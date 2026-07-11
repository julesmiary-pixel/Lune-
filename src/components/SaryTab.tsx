import React, { useState } from "react";
import { GeneratedImage } from "../types";
import { Sparkles, Download, Eye, Image as ImageIcon, Loader2, ArrowRight, Save, Share2, Edit2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SaryTabProps {
  images: GeneratedImage[];
  onGenerateImage: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  imageError: string | null;
  setImageError: (err: string | null) => void;
}

export default function SaryTab({ images, onGenerateImage, isGenerating, imageError, setImageError }: SaryTabProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [savedImageIds, setSavedImageIds] = useState<string[]>([]);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateImage(prompt);
    setPrompt("");
  };

  const toggleSaveImage = (id: string) => {
    if (savedImageIds.includes(id)) {
      setSavedImageIds(savedImageIds.filter((imgId) => imgId !== id));
    } else {
      setSavedImageIds([...savedImageIds, id]);
    }
  };

  const handleShareImage = (img: GeneratedImage) => {
    if (navigator.share) {
      navigator.share({
        title: "Sary voamboatra tamin'i lune AI",
        text: img.prompt,
        url: img.imageUrl,
      }).catch(console.error);
    } else {
      // Copy URL or prompt to clipboard
      navigator.clipboard.writeText(img.imageUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleEditAgain = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setSelectedImage(null);
    // Scroll smoothly to form
    document.getElementById("sary-hero")?.scrollIntoView({ behavior: "smooth" });
  };

  // Predefined gorgeous templates for quick generation/viewing
  const imageTemplates = [
    {
      title: "🌳 Morondava Baobab",
      desc: "Fiposahan'ny masoandro mampitolagaga eo amin'ny lalan'ny Baobab.",
      prompt: "A stunning golden hour sunrise over the Avenue of the Baobabs in Madagascar, highly detailed, photorealistic digital art style",
      thumbnail: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "🌊 Diego-Suarez",
      desc: "Ranomasina manga mangirana sy fasika fotsy madio.",
      prompt: "A pristine tropical beach in Diego Suarez, crystal clear turquoise water, soft white sand, emerald green palms, sunny day, high resolution",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "🏔️ Tsingy Bemaraha",
      desc: "Vato maranitra tsara tarehy sy ny ala maitso ao ambany.",
      prompt: "Majestic sharp limestone formations of Tsingy de Bemaraha, deep green forest canyon underneath, soaring eagle, adventurous realistic landscape art",
      thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "🦊 Maky sy Ala Maitso",
      desc: "Gidro lemur mitsambikina eo amin'ny rantsan-kazo.",
      prompt: "A playful Ring-tailed Lemur on a mossy branch in Ranomafana rainforest, soft misty atmosphere, sunrays piercing through giant fern leaves, ultra detailed",
      thumbnail: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=500&q=80"
    }
  ];

  const handleSelectTemplate = (tPrompt: string) => {
    setPrompt(tPrompt);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 max-w-4xl mx-auto w-full" id="sary-tab-container">
      {/* Hero Header */}
      <div className="text-center space-y-2" id="sary-hero">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Studio Famoronan-Tsary</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Soraty ny lohahevitra na sary eritreretinao, ary avelao ny faharanitan-tsaina artifisialy <span className="text-emerald-600 font-semibold">lune</span> hamadika izany ho sary kanto.
        </p>
      </div>

      {imageError && (
        <div className="bg-amber-50/90 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3 relative shadow-xs" id="image-error-banner">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-slate-700 text-xs flex-1 pr-6">
            <span className="font-semibold text-amber-900 block text-sm">Fanamarihana momba ny famoronana sary</span>
            <p className="leading-relaxed">
              Ny fampiasana sary mivantana amin'ny Gemini dia mitaky lakile <strong>Paid API Key</strong> ao amin'ny AI Studio (fetran'ny Free Tier dia 0 sary).
            </p>
            <p className="text-amber-800/90 font-medium">
              Mba tsy hanelingelina ny fampiasanao ny app dia nampiasa sary mifanaraka tsara avy amin'ny fitahirizana kanto (Unsplash) i lune!
            </p>
          </div>
          <button
            onClick={() => setImageError(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1 text-lg font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm space-y-4" id="sary-generation-form">
        <div className="space-y-1.5">
          <label htmlFor="prompt-input" className="text-xs font-semibold text-slate-700 tracking-wider uppercase block">
            Lohahevitry ny sary (Sary tianao hoforonina)
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ohatra: Sary hosodoko mampiseho lapa tranainy eo ambonin'ny tendrombohitra misy zavona..."
            className="w-full min-h-[90px] bg-slate-50 hover:bg-slate-50/70 focus:bg-white border border-slate-100 focus:border-emerald-200 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all resize-none"
            disabled={isGenerating}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            Mampiasa ny modely <strong className="text-emerald-600">Gemini Image Gen</strong>
          </span>
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              prompt.trim() && !isGenerating
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            id="generate-image-button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Eo am-pamboarana...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hamboatra Sary</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generating/Loading Indicator Card */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8 flex flex-col items-center text-center space-y-4"
            id="image-generation-loading-state"
          >
            <div className="relative">
              <span className="absolute -inset-3 rounded-full bg-emerald-400/20 animate-ping"></span>
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="font-semibold text-slate-800 text-sm">Eo am-pandrafetana ny sary...</h4>
              <p className="text-xs text-slate-500 animate-pulse">
                Mametraka ny loko, ny hazavana ary ny pitsopitsony feno kanto i lune. Mety haka 5-10 segondra izany.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Creative Templates Grid */}
      <div className="space-y-3" id="sary-templates-section">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Modely tsara andramana (Templates)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {imageTemplates.map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectTemplate(t.prompt)}
              className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:border-emerald-300 transition-all cursor-pointer group flex flex-col"
              id={`template-box-${idx}`}
            >
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={t.thumbnail}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div className="font-semibold text-slate-800 text-xs truncate">{t.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Images Gallery List */}
      <div className="space-y-3 pt-4" id="sary-gallery-section">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Ny sary voamboatra (Gallery)</h3>
          <span className="text-xs text-slate-400 font-medium">Sary {images.length}</span>
        </div>

        {images.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 flex flex-col items-center space-y-2 bg-slate-50/50">
            <ImageIcon className="w-10 h-10 text-slate-300" />
            <p className="text-sm">Tsy mbola nisy sary voamboatra.</p>
            <p className="text-xs">Soraty ny hevitrao etsy ambony ary tsindrio ny &quot;Hamboatra Sary&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="gallery-grid">
            {images.map((img) => (
              <motion.div
                key={img.id}
                layoutId={`img-card-${img.id}`}
                onClick={() => setSelectedImage(img)}
                className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-xs cursor-pointer hover:shadow-md transition-all group flex flex-col"
              >
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Elegant tag on preview */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white tracking-widest pointer-events-none">
                    Lune AI
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <div className="p-2 bg-white/90 text-slate-800 rounded-full hover:bg-white transition-colors shadow-xs">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">{img.prompt}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(img.timestamp).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal View */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            id="gallery-modal-overlay"
          >
            <motion.div
              layoutId={`img-card-${selectedImage.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-xl w-full"
              id="gallery-modal-content"
            >
              <div className="relative aspect-square w-full bg-slate-950">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Image Watermark Tag */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 tracking-wider pointer-events-none uppercase shadow-sm border border-emerald-500/20">
                  ✨ Lune AI
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 cursor-pointer transition-colors"
                  id="modal-close-button"
                >
                  <span className="sr-only">Hanakatona</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hafatra namoronana (Prompt)</h4>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{selectedImage.prompt}</p>
                </div>

                <div className="text-xs text-slate-400">
                  Voamboatra tamin'ny: {new Date(selectedImage.timestamp).toLocaleString()}
                </div>

                {shareSuccess && (
                  <div className="text-xs text-emerald-600 font-semibold animate-pulse" id="share-notification">
                    ✅ Voakopia ao amin'ny fitadidiana ny rohy fizarana!
                  </div>
                )}

                {/* 4 Action Buttons requested: Download, Share, Edit-again, Save */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Left-side action buttons */}
                  <div className="flex items-center space-x-2">
                    {/* ✏️ Edit Again */}
                    <button
                      onClick={() => handleEditAgain(selectedImage)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Modifier à nouveau"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hamboatra indray</span>
                    </button>

                    {/* 📤 Share */}
                    <button
                      onClick={() => handleShareImage(selectedImage)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Partager"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Hizara</span>
                    </button>
                  </div>

                  {/* Right-side action buttons */}
                  <div className="flex items-center space-x-2">
                    {/* ❤️ Save */}
                    <button
                      onClick={() => toggleSaveImage(selectedImage.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        savedImageIds.includes(selectedImage.id)
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                      title="Enregistrer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${savedImageIds.includes(selectedImage.id) ? "fill-rose-600 text-rose-600" : ""}`} />
                      <span>{savedImageIds.includes(selectedImage.id) ? "Voatahiry" : "Tehirizina"}</span>
                    </button>

                    {/* ⬇️ Download */}
                    <a
                      href={selectedImage.imageUrl}
                      download={`lune-art-${selectedImage.id}.png`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Télécharger"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Hampidina</span>
                    </a>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
