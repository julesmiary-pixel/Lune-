import React, { useState, useEffect } from "react";
import { NotebookPage } from "../types";
import { 
  Check, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Trash2, 
  Clock, 
  BookOpen, 
  Heading, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  FileText,
  Bookmark,
  Send,
  Loader2,
  List,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SoratraTabProps {
  pages: NotebookPage[];
  onSavePage: (page: NotebookPage) => void;
  onAskAIHelp: (prompt: string, context: string) => Promise<string>;
}

export default function SoratraTab({ pages, onSavePage, onAskAIHelp }: SoratraTabProps) {
  const [activePageId, setActivePageId] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Style properties
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");

  // History for local undo/redo
  const [history, setHistory] = useState<{title: string, content: string}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load selected page values
  useEffect(() => {
    const page = pages.find((p) => p.id === activePageId);
    if (page) {
      setTitle(page.title);
      setContent(page.content);
      setIsBold(page.isBold);
      setIsItalic(page.isItalic);
      setIsUnderline(page.isUnderline);
      setIsStrikethrough(page.isStrikethrough);
      setAlignment(page.alignment);
      setFontSize(page.fontSize);
      
      // Reset undo/redo history for this page
      setHistory([{ title: page.title, content: page.content }]);
      setHistoryIndex(0);
    }
  }, [activePageId, pages]);

  // Keep track of text change for undo/redo
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title, content: newVal });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleTitleChange = (newVal: string) => {
    setTitle(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title: newVal, content });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTitle(prev.title);
      setContent(prev.content);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTitle(next.title);
      setContent(next.content);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Insert Current Date/Time
  const insertDateTime = () => {
    const now = new Date();
    const formatted = `[${now.toLocaleDateString("mg-MG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}] `;
    handleContentChange(content + formatted);
  };

  // Save current notebook page
  const handleSave = () => {
    onSavePage({
      id: activePageId,
      title: title || `Tantara ${activePageId}`,
      content,
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      alignment,
      fontSize,
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Ask AI to generate/polish poem or story
  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const promptText = `Hanampy ahy hanoratra tononkalo na tantara: "${aiPrompt}". 
Votoatiny ankehitriny eo amin'ny kahie: "${content}". 
Azafady, tohizo na hatsarao amin'ny teny malagasy kanto, feno rima, sy tsara rafitra ity tononkalo na tantara ity. Omeo mivantana ny tohiny na ny dika vaovao voadio tsy misy fampidirana hafa.`;
      
      const response = await onAskAIHelp(promptText, content);
      if (response) {
        handleContentChange(content ? `${content}\n\n${response}` : response);
        setShowAiModal(false);
        setAiPrompt("");
      }
    } catch (e) {
      console.error(e);
      alert("Nisy olana teo am-pampiasana ny lune AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clearPage = () => {
    if (window.confirm("Tena hofoananao ve ny soratra rehetra amin'ity pejy ity?")) {
      setTitle("");
      setContent("");
      handleContentChange("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4faf6] overflow-hidden" id="soratra-tab-container">
      
      {/* Top Controller Bar - Notebook Style */}
      <div className="bg-white border-b border-emerald-100 px-4 py-2 flex items-center justify-between shrink-0" id="notebook-top-bar">
        {/* Undo/Redo & Save Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
            title="Hamerina amin'ny teo aloha"
            id="undo-button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
            title="Hampandroso"
            id="redo-button"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Pages Switcher Selector (Page 1 to 4 only) */}
        <div className="flex items-center space-x-1 bg-emerald-50 p-1 rounded-xl border border-emerald-100/60" id="pages-four-selector">
          {[1, 2, 3, 4].map((id) => (
            <button
              key={id}
              onClick={() => setActivePageId(id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePageId === id
                  ? "bg-emerald-600 text-white shadow-xs scale-105"
                  : "text-emerald-800 hover:bg-emerald-100/50"
              }`}
              id={`notebook-page-tab-${id}`}
            >
              Pejy {id}
            </button>
          ))}
        </div>

        {/* Save Page and AI Writer Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Hampiasa ny lune AI"
            id="ask-ai-helper-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tsindrimandry (AI)</span>
          </button>

          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              saveSuccess 
                ? "bg-teal-100 text-teal-800 border border-teal-200" 
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50"
            }`}
            title="Tehirizina ity pejy ity"
            id="save-notebook-page-btn"
          >
            {saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-xs font-bold hidden sm:inline">Tehirizina</span>
          </button>
        </div>
      </div>

      {/* Main Notebook Ruled Sheet Section */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center" id="notebook-sheet-scroller">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-emerald-100/60 p-6 sm:p-8 flex flex-col relative overflow-hidden" 
          id="ruled-paper-sheet"
          style={{ minHeight: "550px" }}
        >
          {/* Aesthetic Notebook Left Margin Line */}
          <div className="absolute left-10 top-0 bottom-0 w-[1.5px] bg-emerald-200/60 pointer-events-none" id="notebook-margin-redline"></div>

          {/* Notebook Header Title matching requested screenshot layout */}
          <div className="mb-4 pl-8 relative z-10" id="ruled-paper-title-area">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Lohateny (Titre)..."
              className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-emerald-300 text-center font-serif text-2xl font-semibold italic text-slate-800 outline-none pb-1"
              id="ruled-paper-title-input"
            />
          </div>

          {/* Notebook Lined Ruled Writing Canvas */}
          <div className="flex-1 relative z-10 pl-8" id="ruled-paper-body-area">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Soraty eto ny tononkalo, tantara, na sangan'asanao..."
              className={`w-full h-full bg-transparent border-none outline-none focus:ring-0 leading-8 tracking-wide text-slate-800 font-cursive ${
                isBold ? "font-bold" : ""
              } ${isItalic ? "italic" : ""} ${isUnderline ? "underline" : ""} ${
                isStrikethrough ? "line-through" : ""
              }`}
              style={{
                backgroundImage: "linear-gradient(#f0fdf4 1px, transparent 1px)", // Very soft emerald notebook lines!
                backgroundSize: "100% 2rem",
                lineHeight: "2rem",
                textAlign: alignment,
                fontSize: fontSize === "sm" ? "16px" : fontSize === "lg" ? "24px" : fontSize === "xl" ? "28px" : "20px"
              }}
              id="ruled-paper-content-textarea"
            />
          </div>
        </div>
      </div>

      {/* Formatting and Actions Tool Bar (Exact styling of bottom toolbar from the screenshot) */}
      <div className="bg-white border-t border-emerald-50 p-3 shrink-0" id="notebook-bottom-toolbar">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2" id="toolbar-flex-container">
          
          {/* Formatting Section */}
          <div className="flex items-center space-x-1" id="format-tools-buttons">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                isBold ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Sora-baventy (Bold)"
              id="btn-bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                isItalic ? "bg-emerald-100 text-emerald-800 italic" : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Sora-mandry (Italic)"
              id="btn-italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                isUnderline ? "bg-emerald-100 text-emerald-800 underline" : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Hanaosipika (Underline)"
              id="btn-underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsStrikethrough(!isStrikethrough)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                isStrikethrough ? "bg-emerald-100 text-emerald-800 line-through" : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Hamafa soratra mitsivalana"
              id="btn-strike"
            >
              <span className="font-semibold text-xs leading-none">S</span>
            </button>
          </div>

          {/* Alignment Tools */}
          <div className="flex items-center space-x-1" id="alignment-tools-buttons">
            <button
              onClick={() => setAlignment("left")}
              className={`p-1.5 rounded-md cursor-pointer ${
                alignment === "left" ? "bg-emerald-100 text-emerald-800" : "text-slate-400 hover:bg-slate-50"
              }`}
              id="align-left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAlignment("center")}
              className={`p-1.5 rounded-md cursor-pointer ${
                alignment === "center" ? "bg-emerald-100 text-emerald-800" : "text-slate-400 hover:bg-slate-50"
              }`}
              id="align-center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAlignment("right")}
              className={`p-1.5 rounded-md cursor-pointer ${
                alignment === "right" ? "bg-emerald-100 text-emerald-800" : "text-slate-400 hover:bg-slate-50"
              }`}
              id="align-right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Sizes Selector */}
          <div className="flex items-center space-x-1" id="fontsize-tools-buttons">
            {(["sm", "base", "lg", "xl"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  fontSize === size ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-50"
                }`}
                id={`font-size-btn-${size}`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Extra helpers */}
          <div className="flex items-center space-x-1.5" id="extra-toolbar-helpers">
            <button
              onClick={insertDateTime}
              className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer flex items-center space-x-1 transition-colors"
              title="Hampiditra ora sy daty"
              id="btn-insert-clock"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold hidden sm:inline">Ora</span>
            </button>

            <button
              onClick={clearPage}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
              title="Hamafa ny pejy"
              id="btn-clear-page"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* AI Poetry Inspiration Prompt Dialog Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
            id="ai-inspiration-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl max-w-md w-full border border-emerald-50 p-5 space-y-4"
              id="ai-inspiration-modal-content"
            >
              <div className="flex items-center space-x-2 text-emerald-600" id="ai-modal-header">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                <h3 className="font-bold text-slate-800">Tsindrimandry avy amin'i lune</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Inona no tianao hampian'i lune AI hosoratana? (Ohatra: "Mamorona andininy fanampiny miresaka fitiavana", na "Hatsarao ity tantara ity mba ho mampihetsi-po").
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Soraty eto ny tianao hampiana..."
                className="w-full min-h-[80px] bg-slate-50 hover:bg-slate-50/70 focus:bg-white border border-slate-100 focus:border-emerald-200 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all resize-none"
                disabled={isGeneratingAI}
                id="ai-prompt-modal-input"
              />

              <div className="flex items-center justify-end space-x-2 pt-2" id="ai-modal-footer">
                <button
                  onClick={() => setShowAiModal(false)}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hanafoana
                </button>
                <button
                  onClick={handleAskAI}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                  id="ai-modal-submit-btn"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mieritreritra...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ampidiro</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
