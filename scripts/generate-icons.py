#!/usr/bin/env python3
"""
VaporSphere Multi-Platform Icon Generator
Generates crisp PNG, ICO, and ICNS assets for Tauri desktop bundles and web clients.
"""
import os
import struct
import zlib
import math

def create_png(width: int, height: int, filename: str) -> bytes:
    raw = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = min(cx, cy) * 0.85
    for y in range(height):
        raw.append(0)  # filter type: None
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            if dist <= radius:
                # OKLab inspired cyan-azure radiant gradient
                factor = 1.0 - (dist / radius)
                r = int(min(255, 30 + factor * 140))
                g = int(min(255, 180 + factor * 75))
                b = int(min(255, 230 + factor * 25))
                a = int(min(255, 220 + factor * 35))
            elif dist <= radius * 1.15:
                # Spectral outer glow
                glow = 1.0 - ((dist - radius) / (radius * 0.15))
                r = int(20 * glow)
                g = int(180 * glow)
                b = int(240 * glow)
                a = int(160 * glow)
            else:
                r, g, b, a = 0, 0, 0, 0
            raw.extend([r, g, b, a])

    def chunk(tag: bytes, data: bytes) -> bytes:
        c = struct.pack('>I', len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)

    png_bytes = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png_bytes)
    return png_bytes

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons_dir = os.path.join(root_dir, 'src-tauri', 'icons')
    public_dir = os.path.join(root_dir, 'public')

    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(public_dir, exist_ok=True)

    png32 = create_png(32, 32, os.path.join(icons_dir, '32x32.png'))
    png128 = create_png(128, 128, os.path.join(icons_dir, '128x128.png'))
    png256 = create_png(256, 256, os.path.join(icons_dir, '128x128@2x.png'))
    png512 = create_png(512, 512, os.path.join(icons_dir, 'icon.png'))
    create_png(64, 64, os.path.join(public_dir, 'favicon.ico'))

    # Standard ICO structure
    ico_header = struct.pack('<HHH', 0, 1, 1)
    img_entry = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png32), 6 + 16)
    with open(os.path.join(icons_dir, 'icon.ico'), 'wb') as f:
        f.write(ico_header + img_entry + png32)

    # Standard ICNS structure
    icns_data = b'ic08' + struct.pack('>I', len(png256) + 8) + png256
    icns_header = b'icns' + struct.pack('>I', len(icns_data) + 8)
    with open(os.path.join(icons_dir, 'icon.icns'), 'wb') as f:
        f.write(icns_header + icns_data)

    print('✓ VaporSphere multi-platform icons successfully generated!')

if __name__ == '__main__':
    main()
