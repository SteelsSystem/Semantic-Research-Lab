import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AudioSpectrumMetrics, VisualState } from '../types/cognitive';
import { oklabToOklch, oklabToHex } from '../utils/oklab';

interface VaporSphereViewportProps {
  visualState: VisualState;
  getAudioMetrics: () => AudioSpectrumMetrics;
  particleCount?: number;
}

const VERTEX_SHADER = `
uniform float uTime;
uniform float uBaseRadius;      // R0 = 2.4
uniform float uDeltaMax;        // delta_max = 0.65 (max corona thickness for tanh saturation)
uniform float uLowFreq;         // Envelope-filtered 0-250 Hz (F0 fundamental)
uniform float uMidFreq;         // Envelope-filtered 250-2500 Hz (F1, F2 formants)
uniform float uDispersion;      // Envelope-filtered 2500-8000 Hz (F3, F4 sibilants)
uniform float uTurbulence;      // Base laminar viscosity mu_0 from OKLab telemetry
uniform float uDensity;         // Base density & stiffness k from OKLab telemetry
uniform float uPixelRatio;

attribute float aRandomSeed;
attribute float aShellOffset;   // Initial radial offset in [-1, 1]

varying float vRadialFraction;
varying float vTurbulenceMag;
varying float vSeed;
varying float vHighJitter;

// 3D Simplex Noise implementation for Curl Noise potential field Psi(x)
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x) {
  float s  = snoise(vec3(x));
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

// Divergence-free Curl Noise operator: v_curl(x) = nabla x Psi(x), where nabla . v_curl = 0
vec3 curlNoise(vec3 p) {
  const float e = 0.08;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor + 1e-6);
}

void main() {
  // Unit normal vector from origin to particle on spherical shell: n = x / ||x||
  vec3 n = normalize(position);

  // Dynamic radius modulated by F0 fundamental frequency (0-250 Hz): R(t) = R0 + Delta_R_audio
  float deltaR_audio = uLowFreq * 0.42;
  float R_t = uBaseRadius + deltaR_audio;

  // Raw radial distance including shell offset, breathing oscillator, and high-frequency sibilant jitter
  float breathingOsc = sin(uTime * 1.6 + aRandomSeed * 6.2831) * 0.14 * (1.15 - uDensity);
  float sibilantJitter = sin(uTime * 28.0 + aRandomSeed * 97.0) * uDispersion * 0.36;
  float r_raw = R_t + aShellOffset * (0.45 * (1.2 - uDensity * 0.6)) + breathingOsc + sibilantJitter;

  // Non-linear hyperbolic tangent radial stabilizer:
  // r_bound = R(t) + delta_max * tanh((r_raw - R(t)) / delta_max)
  float diff = (r_raw - R_t) / max(0.05, uDeltaMax);
  // Safe GLSL tanh computation
  float e2x = exp(2.0 * clamp(diff, -8.0, 8.0));
  float tanhVal = (e2x - 1.0) / (e2x + 1.0);
  float r_bound = R_t + uDeltaMax * tanhVal;

  // Spatial frequency of vector potential field Psi modulated by formant energy
  float spatialFreq = 0.68 + uMidFreq * 0.65;
  vec3 v_curl = curlNoise(n * spatialFreq + vec3(uTime * 0.16));

  // Orthogonal Tangential Projection of Curl Noise:
  // v_tangent = v_curl - (v_curl . n) * n
  // Eliminates centrifugal radial escape while preserving laminar vortex streams along the spherical crust
  vec3 v_tangent = v_curl - dot(v_curl, n) * n;

  // Total tangential turbulence amplitude: mu_0 + Delta_mu_audio
  float mu_total = (uTurbulence * 0.45) + (uMidFreq * 0.55);

  // Final position equation: x_final = n * r_bound + v_tangent * (mu_0 + Delta_mu_audio)
  vec3 x_final = n * r_bound + v_tangent * mu_total;

  // Keep final radius strictly within R_max for frustum safety
  vRadialFraction = clamp((length(x_final) - (uBaseRadius * 0.7)) / (uDeltaMax * 2.2), 0.0, 1.0);
  vTurbulenceMag = length(v_tangent * mu_total);
  vSeed = aRandomSeed;
  vHighJitter = uDispersion;

  vec4 mvPosition = modelViewMatrix * vec4(x_final, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size attenuated by depth and modulated by density & sibilant dispersion
  float basePointSize = mix(10.0, 22.0, uDensity) * (0.75 + 0.5 * aRandomSeed);
  gl_PointSize = basePointSize * uPixelRatio * (1.0 / max(1.0, -mvPosition.z));
}
`;

const FRAGMENT_SHADER = `
uniform vec3 uOklabPrimary;     // (L, a, b) primary state
uniform vec3 uOklabSecondary;   // (L, a, b) secondary pole/corona state
uniform float uDensity;         // Controls radial density profile sigma
uniform float uDispersion;      // High-freq sibilant dispersion (2500-8000 Hz)
uniform float uLowFreq;

varying float vRadialFraction;
varying float vTurbulenceMag;
varying float vSeed;
varying float vHighJitter;

// Exact OKLab to Linear RGB transformation via cubic LMS cone response
vec3 oklabToLinearRGB(vec3 lab) {
  float L = lab.x;
  float a = lab.y;
  float b = lab.z;

  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;

  return vec3(
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

// Non-linear sRGB gamma correction per specification
float linearToSRGBChannel(float c) {
  c = clamp(c, 0.0, 1.0);
  return (c <= 0.0031308) ? (12.92 * c) : (1.055 * pow(c, 1.0 / 2.4) - 0.055);
}

vec3 linearToSRGB(vec3 lin) {
  return vec3(
    linearToSRGBChannel(lin.r),
    linearToSRGBChannel(lin.g),
    linearToSRGBChannel(lin.b)
  );
}

void main() {
  // Distance from fragment to point center r in [0, 0.5]
  vec2 centered = gl_PointCoord - vec2(0.5);
  float r = length(centered);
  if (r > 0.5) discard;

  // Radial density function alpha(r) = exp(-sigma * r^2)
  // High-frequency dispersion lowers sigma on outer corona grains to simulate vapor sublimation
  float sigma = mix(14.0, 26.0, uDensity) - uDispersion * 5.0;
  float alphaProfile = exp(-sigma * r * r);

  // Geodesic linear interpolation in perceptual OKLab space: C(t) = (1 - t)*C1 + t*C2
  float mixFactor = clamp(vRadialFraction * 0.7 + vTurbulenceMag * 0.45, 0.0, 1.0);
  vec3 labColor = mix(uOklabPrimary, uOklabSecondary, mixFactor);

  // Boost lightness subtly in the dense core during vocal articulation
  labColor.x = clamp(labColor.x + uLowFreq * 0.12 + (1.0 - vRadialFraction) * 0.08, 0.15, 0.96);

  vec3 linRGB = oklabToLinearRGB(labColor);
  vec3 srgbColor = linearToSRGB(linRGB);

  float finalAlpha = alphaProfile * mix(0.22, 0.52, uDensity) * (1.0 - vRadialFraction * 0.35);
  gl_FragColor = vec4(srgbColor, finalAlpha);
}
`;

export const VaporSphereViewport: React.FC<VaporSphereViewportProps> = ({
  visualState,
  getAudioMetrics,
  particleCount = 120000,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualStateRef = useRef<VisualState>(visualState);
  visualStateRef.current = visualState;

  const [frustumTelemetry, setFrustumTelemetry] = useState({
    width: 800,
    height: 600,
    aspect: 1.33,
    cameraDistance: 11.07,
    limitingAxis: 'Vertical Frustum Axis',
  });

  const [webglLost, setWebglLost] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    // Perspective camera with vertical FOV = 45 deg
    const FOV_V_DEG = 45;
    const R_MAX = 3.6; // Maximum physical radius (R0=2.4 + DeltaR_audio + delta_max=0.65)
    const SAFETY_MARGIN_P = 0.15; // 15% safety margin from container boundaries

    const camera = new THREE.PerspectiveCamera(FOV_V_DEG, 1, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x07090e, 1);

    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full cursor-crosshair';

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const handleContextRestored = () => {
      setWebglLost(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    container.appendChild(canvas);

    // Subtle coordinate reference rings inside the 3D scene for scientific calibration
    const ringGeo = new THREE.RingGeometry(3.58, 3.6, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const boundaryRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(boundaryRing);

    // Generate spherical particle distribution (Fibonacci sphere + radial shell offset)
    const positions = new Float32Array(particleCount * 3);
    const randomSeeds = new Float32Array(particleCount);
    const shellOffsets = new Float32Array(particleCount);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const baseR0 = 2.4;

    for (let i = 0; i < particleCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      positions[i * 3] = nx * baseR0;
      positions[i * 3 + 1] = ny * baseR0;
      positions[i * 3 + 2] = nz * baseR0;

      randomSeeds[i] = Math.random();
      // Gaussian-like distribution around 0 in [-1, 1]
      shellOffsets[i] = (Math.random() + Math.random() + Math.random()) / 1.5 - 1.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandomSeed', new THREE.BufferAttribute(randomSeeds, 1));
    geometry.setAttribute('aShellOffset', new THREE.BufferAttribute(shellOffsets, 1));

    // Smoothly interpolated OKLab state inside render loop
    const currentLab = {
      L: visualStateRef.current.L,
      a: visualStateRef.current.a,
      b: visualStateRef.current.b,
      turbulence: visualStateRef.current.turbulence,
      density: visualStateRef.current.density,
    };

    const uniforms = {
      uTime: { value: 0 },
      uBaseRadius: { value: baseR0 },
      uDeltaMax: { value: 0.65 },
      uLowFreq: { value: 0 },
      uMidFreq: { value: 0 },
      uDispersion: { value: 0 },
      uTurbulence: { value: currentLab.turbulence },
      uDensity: { value: currentLab.density },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOklabPrimary: { value: new THREE.Vector3(currentLab.L, currentLab.a, currentLab.b) },
      uOklabSecondary: {
        value: new THREE.Vector3(
          Math.min(0.95, currentLab.L + 0.14),
          -currentLab.a * 0.65,
          currentLab.b * 0.8 + 0.06
        ),
      },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pointsSystem = new THREE.Points(geometry, material);
    scene.add(pointsSystem);

    /**
     * Analytical Frustum Camera Distance Calculation via ResizeObserver
     *
     * theta_v = FOV_v in radians
     * theta_h = 2 * arctan(alpha * tan(theta_v / 2))
     * d_v = R_max / ((1 - p) * sin(theta_v / 2))
     * d_h = R_max / ((1 - p) * sin(theta_h / 2))
     * d = max(d_v, d_h)
     */
    const updateContainerSize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h, false);

      const alpha = w / h;
      camera.aspect = alpha;
      camera.updateProjectionMatrix();

      const thetaV = (FOV_V_DEG * Math.PI) / 180.0;
      const thetaH = 2.0 * Math.atan(alpha * Math.tan(thetaV / 2.0));

      const dv = R_MAX / ((1.0 - SAFETY_MARGIN_P) * Math.sin(thetaV / 2.0));
      const dh = R_MAX / ((1.0 - SAFETY_MARGIN_P) * Math.sin(thetaH / 2.0));
      const d = Math.max(dv, dh);

      camera.position.set(0, 0, d);

      setFrustumTelemetry({
        width: Math.round(w),
        height: Math.round(h),
        aspect: Number(alpha.toFixed(2)),
        cameraDistance: Number(d.toFixed(2)),
        limitingAxis:
          Math.abs(alpha - 1.0) < 0.04
            ? 'Isotropic Limit (1:1)'
            : alpha > 1.0
            ? 'Vertical Frustum Axis'
            : 'Horizontal Frustum Axis',
      });
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateContainerSize(width, height);
      }
    });
    resizeObserver.observe(container);
    updateContainerSize(container.clientWidth, container.clientHeight);

    // Interactive orbit drag on the contained viewport
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotX = 0.15;
    let targetRotY = 0.0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotY += dx * 0.006;
      targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX + dy * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let animFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Read envelope-followed acoustic spectrum metrics
      const audio = getAudioMetrics();
      uniforms.uLowFreq.value = audio.lowBand;
      uniforms.uMidFreq.value = audio.midBand;
      uniforms.uDispersion.value = audio.highBand;

      // Geodesic interpolation in OKLab space towards target visualState
      const target = visualStateRef.current;
      const lerpSpeed = 0.045;
      currentLab.L += (target.L - currentLab.L) * lerpSpeed;
      currentLab.a += (target.a - currentLab.a) * lerpSpeed;
      currentLab.b += (target.b - currentLab.b) * lerpSpeed;
      currentLab.turbulence += (target.turbulence - currentLab.turbulence) * lerpSpeed;
      currentLab.density += (target.density - currentLab.density) * lerpSpeed;

      uniforms.uTurbulence.value = currentLab.turbulence;
      uniforms.uDensity.value = currentLab.density;
      uniforms.uOklabPrimary.value.set(currentLab.L, currentLab.a, currentLab.b);
      uniforms.uOklabSecondary.value.set(
        Math.min(0.95, currentLab.L + 0.14),
        -currentLab.a * 0.65,
        currentLab.b * 0.8 + 0.06
      );

      // Gentle laminar rotation + interactive orbit damping
      if (!isDragging) {
        targetRotY += 0.0018 * (1.0 + audio.midBand * 1.4);
      }
      pointsSystem.rotation.y += (targetRotY - pointsSystem.rotation.y) * 0.08;
      pointsSystem.rotation.x += (targetRotX - pointsSystem.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [particleCount, getAudioMetrics]);

  const lch = oklabToOklch(visualState.L, visualState.a, visualState.b);
  const swatchHex = oklabToHex(visualState.L, visualState.a, visualState.b);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#07090E] select-none"
    >
      {webglLost && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07090E]/90 p-6 text-center">
          <p className="text-sm text-slate-300 font-mono">
            WebGL context temporarily suspended. Restoring particle field...
          </p>
        </div>
      )}

      {/* Top-Left HUD Overlay: OKLab / OKLCh Perceptual Colorimetry Coordinates */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm border border-slate-800/90 px-3 py-2 rounded">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: swatchHex }}
          />
          <span className="font-medium text-slate-200">
            {visualState.domainLabel || 'OKLab Cognitive Field'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-cyan-400">
            {(particleCount / 1000).toFixed(0)}k particles
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono tabular-nums text-slate-400">
          <span>L: {visualState.L.toFixed(2)}</span>
          <span>a: {visualState.a >= 0 ? `+${visualState.a.toFixed(2)}` : visualState.a.toFixed(2)}</span>
          <span>b: {visualState.b >= 0 ? `+${visualState.b.toFixed(2)}` : visualState.b.toFixed(2)}</span>
          <span aria-hidden="true">·</span>
          <span>C: {lch.C.toFixed(2)}</span>
          <span>h: {lch.h.toFixed(0)}°</span>
        </div>
      </div>

      {/* Top-Right HUD Overlay: Analytical Frustum & Boundary Equations */}
      <div className="pointer-events-none absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm border border-slate-800/90 px-3 py-2 rounded text-right">
        <div className="text-[11px] font-mono tabular-nums text-slate-300">
          <span>d = {frustumTelemetry.cameraDistance.toFixed(2)}</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span>α = {frustumTelemetry.aspect.toFixed(2)}</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span>{frustumTelemetry.width}×{frustumTelemetry.height}px</span>
        </div>
        <div className="mt-0.5 text-[11px] font-mono text-slate-400">
          {frustumTelemetry.limitingAxis} · R_max = 3.60 (p = 0.15)
        </div>
      </div>

      {/* Bottom-Left HUD Overlay: Shader Vector Identity */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm border border-slate-800/90 px-3 py-1.5 rounded">
        <div className="text-[11px] font-mono tabular-nums text-slate-400 flex items-center gap-2">
          <span>∇·v_curl = 0</span>
          <span aria-hidden="true">·</span>
          <span>v_tangent = v_curl − (v_curl·n)n</span>
          <span aria-hidden="true">·</span>
          <span>r_bound = R(t) + δ_max·tanh(Δr/δ_max)</span>
        </div>
      </div>
    </div>
  );
};
