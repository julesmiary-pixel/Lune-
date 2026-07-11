import React, { useState, useEffect } from "react";
import { Tab, Message, SavedSession, GeneratedImage, UserProfile, NotebookPage } from "./types";
import { Volume2, VolumeX, Headphones, Check, Edit2, MessageSquare, Sparkles, BookOpen, User as UserIcon, Menu, Type, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modular components
import Sidebar from "./components/Sidebar";
import ChatTab from "./components/ChatTab";
import SaryTab from "./components/SaryTab";
import SoratraTab from "./components/SoratraTab";


const initialPages: NotebookPage[] = [
  {
    id: 1,
    title: "Sangan'asa Voalohany",
    content: "Ry volana be mitsiky ririnina,\nManazava ny lalana mangina,\nMitantara fitiavana hadino,\nIzay mbola mamiratra tsy mino...",
    isBold: false,
    isItalic: true,
    isUnderline: false,
    isStrikethrough: false,
    alignment: "center",
    fontSize: "base",
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Tantara Pejy Faharoa",
    content: "Ny lasantsika sy ny ho avy, mifanentana tsara,\nIreo kanto sy tantara sarobidy indrindra no voatara...",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    alignment: "left",
    fontSize: "base",
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Aingam-panahy faha-Telo",
    content: "Lune mpanampy feno hery, mitarika ny saina,\nHanoratra tononkalo, sy izay rehetra ilaina...",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    alignment: "left",
    fontSize: "base",
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Amboara Pejy Fahaefatra",
    content: "Feno sy lavorary ny pejy efatra ankehitriny,\nMitsiry ny aingam-panahy eo am-panoratana...",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    alignment: "left",
    fontSize: "base",
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeAttachments, setActiveAttachments] = useState<string[]>([]);

  // Sound and Voice States
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isVibrating, setIsVibrating] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [fontStyle, setFontStyle] = useState<string>("serif");
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);

  // Synthesized notification audio + vibration fallbacks
  const playNotificationSound = () => {
    // Only trigger a light, gentle, non-jarring phone vibration (60ms)
    if (navigator.vibrate) {
      navigator.vibrate([60]);
    }
    setIsVibrating(false); // No visual screen shaking anymore, just gentle phone vibration

    // If sound is muted, play no audio (silent vibration only)
    if (!isSoundEnabled) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Soft dual-tone chord with gentle decay for uniform premium quality
      const playTone = (freq: number, vol: number, decay: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(vol, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + decay);
      };

      // Play very soft beautiful chord
      playTone(523.25, 0.03, 0.5); // C5 tone
      playTone(659.25, 0.015, 0.6); // E5 harmonic accent
    } catch (e) {
      console.warn("Chime failed:", e);
    }
  };

  // Web Speech API Voice Synthesis helper with pristine pronunciation & youthful voice
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean markdown, brackets, urls, and all emojis very cleanly before synthesis
    const cleanText = text
      .replace(/[\*\#\_`\-]/g, " ") // replace markdown styling and lists with standard space
      .replace(/🟢|🎧|🎹|🔍|📃|🎶|📚|💡|💰|✝️|🗃️|🌄|🧠|⚡|🌐|🤠|🤣|😂|🙂|😉|😔|😗|😌|😏|😟|🤨|🥺|😒|🤗|🤭|🤐|😴|😊|😎|😭|🤑|😆|😅|🥰|😍|🤩/g, "") // remove all emojis
      .replace(/https?:\/\/\S+/g, "") // remove links
      .replace(/\s+/g, " ") // replace duplicate spaces with a single space to avoid choppy reading gaps
      .trim()
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    
    // 1. Try to find an explicit Malagasy voice (seldom preloaded)
    let selectedVoice = voices.find(v => v.lang.startsWith("mg"));
    
    // 2. If no Malagasy voice exists, use a high-quality French female voice because French phonetics
    // sound incredibly close to Malagasy vowels and syllables, producing a very clear, natural-sounding reading of Malagasy!
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.lang.startsWith("fr") && 
        (v.name.toLowerCase().includes("female") || 
         v.name.toLowerCase().includes("google") || 
         v.name.toLowerCase().includes("samantha") || 
         v.name.toLowerCase().includes("amelie") || 
         v.name.toLowerCase().includes("hortense") || 
         v.name.toLowerCase().includes("premium"))
      ) || voices.find(v => v.lang.startsWith("fr"));
    }

    // 3. If no French voice, search for standard English female voices
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        (v.name.toLowerCase().includes("female") || 
         v.name.toLowerCase().includes("samantha") || 
         v.name.toLowerCase().includes("zira") || 
         v.name.toLowerCase().includes("google") || 
         v.name.toLowerCase().includes("premium")) &&
        (v.lang.startsWith("en") || v.lang.startsWith("fr"))
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "fr-FR";
    }
    
    // 17-20 years old youthful clear voice parameters
    utterance.pitch = 1.15; // sweet, clear and youthful
    utterance.rate = 0.86; // perfect peaceful rate (not too fast, ensuring full natural articulation like 'hatrany')

    window.speechSynthesis.speak(utterance);
  };

  // Application Data States (with LocalStorage fallbacks)
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Jules Miary",
    bio: "Mikaroka sy mpankafy faharanitan-tsaina artifisialy",
    preferredLanguage: "Malagasy",
    joinDate: "Jolay 2026",
  });
  
  // Notebook 4 Pages State
  const [notebookPages, setNotebookPages] = useState<NotebookPage[]>(initialPages);

  // Load state from local storage on mount with dynamic topic switching
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("lune_sessions");
      let parsedSessions: SavedSession[] = [];
      if (storedSessions) {
        parsedSessions = JSON.parse(storedSessions);
        setSavedSessions(parsedSessions);
      }

      const storedImages = localStorage.getItem("lune_images");
      if (storedImages) setGeneratedImages(JSON.parse(storedImages));

      const storedProfile = localStorage.getItem("lune_profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedPages = localStorage.getItem("lune_notebook_pages");
      if (storedPages) {
        setNotebookPages(JSON.parse(storedPages));
      } else {
        localStorage.setItem("lune_notebook_pages", JSON.stringify(initialPages));
      }

      const storedFontStyle = localStorage.getItem("lune_font_style");
      if (storedFontStyle) {
        setFontStyle(storedFontStyle);
      }

      // "Miova lohahevitra rehefa niverina miditra ny app"
      // If there are previous current messages from last session, save them as an archive session so they aren't lost,
      // then suggest a dynamic new greeting topic on entry!
      const storedMessages = localStorage.getItem("lune_current_chat");
      const parsedMessages: Message[] = storedMessages ? JSON.parse(storedMessages) : [];

      const initialGreetings = [
        "Salama! Inona ny tianao ho resahina androany?🙂",
        "Salama namako! Inona no azoko ampiana anao androany?🙂",
        "Manao ahoana! Inona ny lohahevitra mahaliana anao hodinihintsika androany?🙂",
        "Arahabaina! Inona no tianao horesahina na hovakafakaina androany?🙂",
        "Salama tsara! Vonona hiara-midinika aminao aho. Inona ny tianao ho resahina androany?🙂",
        "Manao ahoana ianao! Inona no tianao hodinihintsika na horesahintsika androany?🙂"
      ];
      const randomGreeting = initialGreetings[Math.floor(Math.random() * initialGreetings.length)];

      if (parsedMessages.length > 1) {
        // Find a clean title from the first user message
        const firstUserMessage = parsedMessages.find((m) => m.role === "user")?.text || "Resaka taloha";
        const title = firstUserMessage.length > 25 ? firstUserMessage.slice(0, 25) + "..." : firstUserMessage;

        const backupSession: SavedSession = {
          id: `session-${Date.now()}`,
          title,
          messages: parsedMessages,
          createdAt: new Date().toISOString(),
        };

        const updatedSessions = [backupSession, ...parsedSessions];
        setSavedSessions(updatedSessions);
        localStorage.setItem("lune_sessions", JSON.stringify(updatedSessions));
      }

      // Start fresh chat session with the chosen new topic from Lune
      const freshMessage: Message = {
        id: `msg-welcome-${Date.now()}`,
        role: "model",
        text: randomGreeting,
        timestamp: new Date().toISOString(),
      };
      setMessages([freshMessage]);
      localStorage.setItem("lune_current_chat", JSON.stringify([freshMessage]));

    } catch (e) {
      console.error("Fahadisoana teo am-pamakiana fitahirizana:", e);
    }
  }, []);

  // Close font style dropdown on click outside
  useEffect(() => {
    if (!isFontMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const button = document.getElementById("font-style-toggle-button");
      const menu = document.getElementById("font-style-dropdown-menu");
      if (
        button && !button.contains(e.target as Node) &&
        menu && !menu.contains(e.target as Node)
      ) {
        setIsFontMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFontMenuOpen]);

  // Save changes to local storage
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Fahadisoana teo am-pampitomboana fitahirizana:", e);
    }
  };

  // 1. Action: New Chat (Resaka vaovao)
  const handleNewChat = () => {
    // If there are existing messages, save the session first!
    if (messages.length > 0) {
      // Find a clean title from the first message
      const firstUserMessage = messages.find((m) => m.role === "user")?.text || "Resaka vaovao";
      const title = firstUserMessage.length > 25 ? firstUserMessage.slice(0, 25) + "..." : firstUserMessage;

      const newSession: SavedSession = {
        id: `session-${Date.now()}`,
        title,
        messages: [...messages],
        createdAt: new Date().toISOString(),
      };

      const updatedSessions = [newSession, ...savedSessions];
      setSavedSessions(updatedSessions);
      saveToLocalStorage("lune_sessions", updatedSessions);
    }

    setMessages([]);
    saveToLocalStorage("lune_current_chat", []);
    setActiveTab(Tab.CHAT);
  };

  // Clear Chat directly (Famafana resaka)
  const handleClearChat = () => {
    const initialGreetings = [
      "Salama! Inona ny tianao ho resahina androany?🙂",
      "Salama namako! Inona no azoko ampiana anao androany?🙂",
      "Manao ahoana! Inona ny lohahevitra mahaliana anao hodinihintsika androany?🙂",
      "Arahabaina! Inona no tianao horesahina na hovakafakaina androany?🙂",
      "Salama tsara! Vonona hiara-midinika aminao aho. Inona ny tianao ho resahina androany?🙂",
      "Manao ahoana ianao! Inona no tianao hodinihintsika na horesahintsika androany?🙂"
    ];
    const randomGreeting = initialGreetings[Math.floor(Math.random() * initialGreetings.length)];
    const freshMessage: Message = {
      id: `msg-welcome-${Date.now()}`,
      role: "model",
      text: randomGreeting,
      timestamp: new Date().toISOString(),
    };
    setMessages([freshMessage]);
    saveToLocalStorage("lune_current_chat", [freshMessage]);
    if (navigator.vibrate) {
      navigator.vibrate([80]);
    }
  };

  // 2. Action: Send Message
  const handleSendMessage = async (text: string, imageUrls?: string[]) => {
    if (!text.trim() && (!imageUrls || imageUrls.length === 0)) return;

    // Create user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      attachmentUrls: imageUrls,
      attachmentUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined, // backward compatibility
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveToLocalStorage("lune_current_chat", updatedMessages);
    setIsTyping(true);

    try {
      // Call Express server-side chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          image: imageUrls, // Send array of images to backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Create AI response message
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "model",
          text: data.text,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);
        saveToLocalStorage("lune_current_chat", finalMessages);

        // Play notification sound or vibrate
        playNotificationSound();

        // Voice synthesis read the response
        if (isTtsEnabled) {
          speakText(data.text);
        }
      } else {
        throw new Error(data.error || "Nisy olana");
      }
    } catch (error: any) {
      console.error("Fahadisoana hiresahana:", error);
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "model",
        text: `Miala tsiny indrindra, nisy olana ara-teknika teo am-piresahana amin'i lune. (${error.message || error})`,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveToLocalStorage("lune_current_chat", finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  // 3. Action: Select a quick prompt from cards
  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // 4. Action: Load an existing saved session
  const handleLoadSession = (session: SavedSession) => {
    setMessages(session.messages);
    saveToLocalStorage("lune_current_chat", session.messages);
    setActiveTab(Tab.CHAT);
  };

  // 5. Action: Delete saved session
  const handleDeleteSession = (id: string) => {
    const updated = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(updated);
    saveToLocalStorage("lune_sessions", updated);
  };

  // 6. Action: Generate Image via AI
  const handleGenerateImage = async (promptText: string) => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setActiveTab(Tab.SARY);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await response.json();

      if (response.ok) {
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          prompt: promptText,
          imageUrl: data.imageUrl,
          description: data.description || "Sary kanto",
          timestamp: new Date().toISOString(),
        };

        const updatedImages = [newImage, ...generatedImages];
        setGeneratedImages(updatedImages);
        saveToLocalStorage("lune_images", updatedImages);
      } else {
        throw new Error(data.error || "Tsy nahomby");
      }
    } catch (error: any) {
      console.error("Fahadisoana teo am-pamboarana sary:", error);
      
      // Clean up prompt to find English/Malagasy keywords for Unsplash representation
      const cleanWords = promptText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3 && w !== "sary" && w !== "kanto" && w !== "mampiseho" && w !== "aminny")
        .slice(0, 3)
        .join(",");

      const queryKeywords = cleanWords || "nature,landscape,abstract";
      const randomSeed = Math.floor(Math.random() * 100000);
      const fallbackUrl = `https://images.unsplash.com/featured/?${encodeURIComponent(queryKeywords)}&sig=${randomSeed}`;

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: promptText,
        imageUrl: fallbackUrl,
        description: "Sary mifanaraka amin'ny hevitrao (Unsplash)",
        timestamp: new Date().toISOString(),
      };

      const updatedImages = [newImage, ...generatedImages];
      setGeneratedImages(updatedImages);
      saveToLocalStorage("lune_images", updatedImages);

      setImageError(
        "Fampandrenesana: Ny kaonty mampiasa lakile Free Tier dia tsy mahazo famoronana sary mivantana amin'ny Gemini (fetra 0 sary isan'andro). Nampiasa sary avy amin'ny fitahirizana kanto mifandraika amin'izany i lune mba ahafahanao manandrana ny rafitra."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 7. Action: Delete generated image from saved logs
  const handleDeleteImage = (id: string) => {
    const updated = generatedImages.filter((img) => img.id !== id);
    setGeneratedImages(updated);
    saveToLocalStorage("lune_images", updated);
  };

  // 8. Action: Update profile settings
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const finalProfile = { ...profile, ...updated };
    setProfile(finalProfile);
    saveToLocalStorage("lune_profile", finalProfile);
  };

  // 9. Action: Save Notebook page changes
  const handleSaveNotebookPage = (updatedPage: NotebookPage) => {
    const updated = notebookPages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    setNotebookPages(updated);
    saveToLocalStorage("lune_notebook_pages", updated);
  };

  // 10. Action: AI help within Soratra Notebook
  const handleAIHelpNotebook = async (prompt: string, context: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: [],
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.text;
      } else {
        throw new Error(data.error || "Tsy nahomby");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div className={`flex h-screen bg-[#f7fcf8] text-slate-800 font-sans lune-font-${fontStyle}`} id="app-root-container">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        savedSessions={savedSessions}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
        onClearChat={handleClearChat}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" id="main-content-layout">
        
        {/* Top Header Bar matching screenshot but with Soft Green circle */}
        <header className="h-16 bg-white border-b border-emerald-50 px-4 flex items-center justify-between shrink-0" id="top-header-bar">
          {/* Hamburger menu (three horizontal lines) on the left */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer flex items-center justify-center transition-colors"
            id="hamburger-menu-button"
            title="Sokafy ny Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Voice synthesis, sound, and font settings control panel in the middle */}
          <div className="flex items-center space-x-2.5" id="header-settings-panel">
            {/* 🔊 Sound/Vibration Toggle */}
            <button
              onClick={() => {
                setIsSoundEnabled(!isSoundEnabled);
                if (navigator.vibrate) {
                  navigator.vibrate([100]);
                }
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                isSoundEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80"
                  : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
              }`}
              title={isSoundEnabled ? "Hampangina ny feo" : "Hampavitrika ny feo"}
              id="sound-toggle-header-button"
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* 🎙️ Voice synthesis (TTS) Toggle */}
            <button
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                isTtsEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80"
                  : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
              }`}
              title={isTtsEnabled ? "Mavitrika ny famakiana feo" : "Tsy mavitrika ny famakiana feo"}
              id="tts-toggle-header-button"
            >
              <Headphones className={`w-4 h-4 ${isTtsEnabled ? "animate-pulse" : ""}`} />
            </button>

            {/* ✒️ Endri-tsoratra Selector Button with Dropdown Menu */}
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  setIsFontMenuOpen(!isFontMenuOpen);
                  if (navigator.vibrate) {
                    navigator.vibrate([60]);
                  }
                }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                  isFontMenuOpen
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-xs"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80"
                }`}
                title="Hanova endri-tsoratra (Style de Police)"
                id="font-style-toggle-button"
              >
                <Type className="w-4 h-4 shrink-0" />
              </button>

              <AnimatePresence>
                {isFontMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 flex flex-col space-y-1"
                    id="font-style-dropdown-menu"
                  >
                    <div className="px-3 py-1.5 border-b border-slate-50 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Style de Police</span>
                    </div>

                    {[
                      { id: "serif", label: "Lora (Classic Serif)", desc: "Elegant & clean Lora" },
                      { id: "roboto", label: "Roboto (Tsotra sy Mazava)", desc: "Roboto modern clean sans-serif" },
                      { id: "nunito", label: "Nunito (Boribory malefaka)", desc: "Nunito friendly rounded font" },
                      { id: "poppins", label: "Poppins (Jeune & Modern)", desc: "Poppins geometric geometric" },
                      { id: "robotoslab", label: "Roboto Slab (Serif Modern)", desc: "Roboto Slab slab-serif font" },
                      { id: "stardos", label: "Stardos Stencil (Vintage)", desc: "Stardos military stencil font" },
                      { id: "normal", label: "Inter (Tsotra Android)", desc: "Inter modern default sans-serif" }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setFontStyle(style.id);
                          localStorage.setItem("lune_font_style", style.id);
                          setIsFontMenuOpen(false);
                          if (navigator.vibrate) {
                            navigator.vibrate([40]);
                          }
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-slate-50 transition-all flex flex-col rounded-xl border ${
                          fontStyle === style.id
                            ? "bg-emerald-50/60 border-emerald-100/80 text-emerald-900"
                            : "border-transparent text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-slate-500">{style.label}</span>
                          {fontStyle === style.id && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded">Mavitrika</span>
                          )}
                        </div>
                        <div className={`lune-font-${style.id} mt-0.5 w-full`}>
                          <span className="font-cursive text-[17px] leading-snug tracking-wide block">
                            Salama tompoko
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* New Conversation icon pen (Soft Green circle!) on the top-right - reduced size to be less distracting */}
          <button
            onClick={handleNewChat}
            className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            title="Resaka vaovao"
            id="header-new-chat-circle"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Tab pages wrapper (switch layouts) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/40" id="tabs-stage-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
              id="active-tab-motion-view"
            >
              {activeTab === Tab.CHAT && (
                <ChatTab
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                  activeAttachments={activeAttachments}
                  setActiveAttachments={setActiveAttachments}
                  onSelectPrompt={handleSelectPrompt}
                />
              )}

              {activeTab === Tab.SARY && (
                <SaryTab
                  images={generatedImages}
                  onGenerateImage={handleGenerateImage}
                  isGenerating={isGenerating}
                  imageError={imageError}
                  setImageError={setImageError}
                />
              )}


            </motion.div>
          </AnimatePresence>
        </div>

        {/* No bottom tab navigation to match screenshot exactly */}

      </div>
    </div>
  );
}
