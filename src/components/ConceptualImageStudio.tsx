import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Wand2,
  Upload,
  RefreshCw,
  Sliders,
  Maximize2,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle,
  AlertCircle,
  Crop,
  ShieldCheck,
} from 'lucide-react';
import { LanguageCode } from '../types/cognitive';

interface GeneratedImageItem {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  createdAt: string;
  isEdited?: boolean;
}

interface ConceptualImageStudioProps {
  lang: LanguageCode;
  onBackToDashboard: () => void;
}

export const ConceptualImageStudio: React.FC<ConceptualImageStudioProps> = ({
  lang,
  onBackToDashboard,
}) => {
  const isCs = lang === 'cs';

  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '512px'>('1K');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected base image for editing
  const [editSourceImage, setEditSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery of generated images
  const [gallery, setGallery] = useState<GeneratedImageItem[]>(() => {
    try {
      const saved = localStorage.getItem('vaporsphere_image_gallery_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeImage, setActiveImage] = useState<GeneratedImageItem | null>(null);

  const saveGallery = (items: GeneratedImageItem[]) => {
    setGallery(items);
    try {
      localStorage.setItem('vaporsphere_image_gallery_v1', JSON.stringify(items));
    } catch {}
  };

  // Sample conceptual prompts for scientific visualization
  const SAMPLE_PROMPTS = [
    {
      title: isCs ? 'OKLab Fluidní Sféra' : 'OKLab Fluid Sphere',
      prompt: 'Solidified vapor sphere in perceptual OKLab color space with curl noise fluid turbulence, scientific quantum visualization, dark background, 8k',
    },
    {
      title: isCs ? 'Sokratovská Dekonstrukce' : 'Socratic Deconstruction',
      prompt: 'Abstract geometric representation of dialectical tension, glowing epistemological axioms and branching inquiry vectors, minimalist architectural style',
    },
    {
      title: isCs ? 'Disipativní Struktury' : 'Dissipative Structures',
      prompt: 'Non-equilibrium thermodynamic dissipative structures (Prigogine theory), entropy dissipation flow into orderly vortices, glowing bioluminescent particles',
    },
    {
      title: isCs ? 'Integrovaná Informace (Φ)' : 'Integrated Information (Phi)',
      prompt: 'Complex neural manifold representing integrated information theory of consciousness, high-dimensional topological knot with chromatic dispersion',
    },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(isCs ? 'Generuji konceptuální obraz modelem gemini-3.1-flash-image-preview...' : 'Generating image with gemini-3.1-flash-image-preview...');

    try {
      if (mode === 'edit' && editSourceImage) {
        // Image edit endpoint
        const res = await fetch('/api/image/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            base64Image: editSourceImage,
            mimeType: 'image/png',
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const newItem: GeneratedImageItem = {
          id: `img-${Date.now()}`,
          imageUrl: data.imageUrl,
          prompt: prompt.trim(),
          model: data.model || 'gemini-3.1-flash-image-preview',
          aspectRatio,
          createdAt: new Date().toLocaleTimeString(),
          isEdited: true,
        };

        const updated = [newItem, ...gallery];
        saveGallery(updated);
        setActiveImage(newItem);
        setStatusMessage(isCs ? 'Úprava obrazu úspěšně dokončena!' : 'Image edit completed!');
      } else {
        // Image generate endpoint
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            aspectRatio,
            imageSize,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const newItem: GeneratedImageItem = {
          id: `img-${Date.now()}`,
          imageUrl: data.imageUrl,
          prompt: prompt.trim(),
          model: data.model || 'gemini-3.1-flash-image-preview',
          aspectRatio,
          createdAt: new Date().toLocaleTimeString(),
        };

        const updated = [newItem, ...gallery];
        saveGallery(updated);
        setActiveImage(newItem);
        setStatusMessage(isCs ? 'Obraz úspěšně vygenerován!' : 'Image successfully generated!');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Chyba při komunikaci s modelem generování obrazů.');
      setStatusMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditSourceImage(reader.result as string);
      setMode('edit');
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (item: GeneratedImageItem) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `vaporsphere-conceptual-image-${item.id}.png`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07090E] text-slate-100">
      {/* 1. Header Toolbar */}
      <div className="shrink-0 border-b border-slate-800/80 bg-[#0B0E17]/95 px-6 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">
                {isCs ? 'Generování & Editace Obrazů (gemini-3.1-flash-image-preview)' : 'Image Studio (gemini-3.1-flash-image-preview)'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Nano Banana Series
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isCs
                ? 'Tvorba a úprava konceptuálních vizualizací pomocí textových promptů.'
                : 'Create and edit conceptual scientific visuals using text prompts with Gemini.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#090D16] border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setMode('generate')}
              className={`px-3 py-1 rounded transition-colors ${
                mode === 'generate'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isCs ? 'Vytvořit nový' : 'Generate'}
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded transition-colors ${
                mode === 'edit'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isCs ? 'Upravit existující' : 'Edit Image'}
            </button>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-colors"
          >
            {isCs ? '← Zpět do Akční Konzole' : '← Back to Arena'}
          </button>
        </div>
      </div>

      {/* 2. Main Studio Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Control Column (Inputs & Settings) */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-[#0B0E17] flex flex-col min-h-0 overflow-y-auto p-5 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Mode: Image Edit Upload Box */}
            {mode === 'edit' && (
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-semibold text-cyan-300 block">
                  {isCs ? '1. Vyberte podkladový obraz k úpravě' : '1. Select Source Image to Edit'}
                </span>

                {editSourceImage ? (
                  <div className="relative group rounded-lg overflow-hidden border border-cyan-500/40">
                    <img
                      src={editSourceImage}
                      alt="Source to edit"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                      >
                        {isCs ? 'Změnit' : 'Change'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSourceImage(null)}
                        className="px-2.5 py-1 text-xs bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded"
                      >
                        {isCs ? 'Odebrat' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl text-center space-y-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                    <span className="text-xs text-slate-300 block">
                      {isCs ? 'Klikněte pro nahrání obrázku z disku' : 'Click to upload image'}
                    </span>
                    <span className="text-[10px] text-slate-500">PNG, JPG nebo WebP</span>
                  </button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Prompt Input Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between">
                <span>{mode === 'edit' ? (isCs ? 'Instrukce k úpravě obrazu' : 'Edit Instructions') : (isCs ? 'Textový prompt pro generování' : 'Generation Text Prompt')}</span>
                <span className="text-[10px] text-slate-500">gemini-3.1-flash-image</span>
              </label>

              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'edit'
                    ? isCs
                      ? 'Např.: Přidej kyanové turbulence a zvýrazni fluidní částice v pravé části...'
                      : 'E.g.: Add cyan turbulence and enhance the fluid particles...'
                    : isCs
                    ? 'Popište vizuální koncept, barevný prostor nebo vědecké schéma...'
                    : 'Describe the visual concept, color palette, or scientific diagram...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090E] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
              />
            </div>

            {/* Aspect Ratio & Format Controls */}
            {mode === 'generate' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {isCs ? 'Poměr stran (Aspect Ratio)' : 'Aspect Ratio'}
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full bg-[#07090E] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1:1">1:1 (Čtverec / Square)</option>
                    <option value="16:9">16:9 (Širokoúhlý / Landscape)</option>
                    <option value="4:3">4:3 (Klasický / Standard)</option>
                    <option value="9:16">9:16 (Vertikální / Portrait)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {isCs ? 'Rozlišení (Resolution)' : 'Resolution'}
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="w-full bg-[#07090E] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1K">1K (Standardní / 1024px)</option>
                    <option value="512px">512px (Rychlý náhled)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || (mode === 'edit' && !editSourceImage)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>
                {isLoading
                  ? isCs
                    ? 'Zpracovávám obraz...'
                    : 'Processing image...'
                  : mode === 'edit'
                  ? isCs
                    ? 'Aplikovat úpravu na obraz'
                    : 'Apply Image Edit'
                  : isCs
                  ? 'Vygenerovat konceptuální obraz'
                  : 'Generate Image'}
              </span>
            </button>
          </form>

          {/* Status Feedback */}
          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sample Prompts Pills */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block">
              {isCs ? 'Předpřipravené epistemologické prompty:' : 'Sample conceptual prompts:'}
            </span>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sp.prompt)}
                  className="w-full p-2 rounded-lg bg-[#07090E] border border-slate-800/80 hover:border-cyan-500/40 text-left transition-colors group"
                >
                  <div className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300">
                    {sp.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{sp.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output & Gallery Column */}
        <div className="lg:col-span-7 bg-[#07090E] flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Active Image Hero Display */}
          {activeImage || gallery[0] ? (
            (() => {
              const current = activeImage || gallery[0];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-mono font-semibold text-cyan-300">
                        {current.isEdited ? (isCs ? 'UPRAVENÝ OBRAZ' : 'EDITED IMAGE') : (isCs ? 'VYGENEROVANÝ OBRAZ' : 'GENERATED IMAGE')}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {current.model} · {current.aspectRatio} · {current.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditSourceImage(current.imageUrl);
                          setMode('edit');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        title={isCs ? 'Použít tento obraz pro další editaci' : 'Use this image for further editing'}
                      >
                        <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isCs ? 'Upravit' : 'Edit'}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(current)}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isCs ? 'Stáhnout PNG' : 'Download'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Viewport Container */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0E17] flex items-center justify-center shadow-2xl">
                    <img
                      src={current.imageUrl}
                      alt={current.prompt}
                      className="max-h-[480px] w-auto object-contain mx-auto"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0E17] border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    <strong className="text-slate-400 font-mono mr-1">Prompt:</strong>
                    {current.prompt}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-center p-6 space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-600 mb-1" />
              <h3 className="text-sm font-semibold text-slate-300">
                {isCs ? 'Zatím nebyl vygenerován žádný obraz' : 'No images generated yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {isCs
                  ? 'Zadejte prompt v levém panelu nebo zvolte předpřipravený koncept a klikněte na "Vygenerovat konceptuální obraz".'
                  : 'Enter a prompt on the left or select a preset to generate conceptual artwork.'}
              </p>
            </div>
          )}

          {/* Gallery of Past Generations */}
          {gallery.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-mono font-semibold text-slate-400">
                {isCs ? `HISTORIE RELACE (${gallery.length} OBRAZŮ)` : `SESSION GALLERY (${gallery.length} IMAGES)`}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveImage(item)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                      (activeImage?.id || gallery[0]?.id) === item.id
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                      <span className="truncate font-semibold">{item.prompt}</span>
                      <span className="text-slate-400 font-mono">{item.aspectRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
