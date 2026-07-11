import React, { useRef, useEffect, useState } from "react";
import { Message } from "../types";
import { Plus, Send, X, Bot, User, CornerDownLeft, Sparkles, Volume2, CornerDownRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

// Custom premium markdown formatter and smooth typing revelator for Lune messages
interface SmoothTextProps {
  text: string;
  isLatest: boolean;
}

export function SmoothText({ text, isLatest }: SmoothTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const words = useRef<string[]>([]);
  const index = useRef(0);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text);
      return;
    }

    words.current = text.split(" ");
    setDisplayedText("");
    index.current = 0;

    let timer: any;
    const typeNextWord = () => {
      if (index.current < words.current.length) {
        const word = words.current[index.current];
        setDisplayedText((prev) => (prev ? prev + " " + word : word));
        index.current++;
        timer = setTimeout(typeNextWord, 45); // Extremely fluid progressive text typing
      }
    };

    typeNextWord();

    return () => clearTimeout(timer);
  }, [text, isLatest]);

  const parseBold = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-emerald-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      // 1. Bullet list
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const listText = line.trim().substring(2);
        return (
          <div key={i} className="flex items-start space-x-1.5 my-1.5 pl-1.5">
            <span className="text-emerald-500 font-bold select-none mt-0.5">•</span>
            <span className="text-slate-700">{parseBold(listText)}</span>
          </div>
        );
      }
      // 2. Headings
      if (line.trim().startsWith("### ")) {
        return (
          <h4 key={i} className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mt-3.5 mb-1 block">
            {parseBold(line.trim().substring(4))}
          </h4>
        );
      }
      if (line.trim().startsWith("## ")) {
        return (
          <h3 key={i} className="text-sm font-extrabold text-emerald-800 tracking-tight mt-4.5 mb-1.5 block">
            {parseBold(line.trim().substring(3))}
          </h3>
        );
      }
      // 3. Simple paragraph
      return (
        <p key={i} className="min-h-[0.75rem] leading-relaxed my-1 text-slate-800">
          {parseBold(line)}
        </p>
      );
    });
  };

  return <div className="space-y-1 text-lg sm:text-xl font-cursive tracking-wide leading-relaxed">{formatText(displayedText)}</div>;
}

interface ChatTabProps {
  messages: Message[];
  onSendMessage: (text: string, images?: string[]) => void;
  isTyping: boolean;
  activeAttachments: string[];
  setActiveAttachments: (attachments: string[]) => void;
  onSelectPrompt: (promptText: string) => void;
}

export default function ChatTab({
  messages,
  onSendMessage,
  isTyping,
  activeAttachments = [],
  setActiveAttachments,
  onSelectPrompt,
}: ChatTabProps) {
  const [inputText, setInputText] = React.useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim() && activeAttachments.length === 0) return;
    onSendMessage(inputText, activeAttachments.length > 0 ? activeAttachments : undefined);
    setInputText("");
    setActiveAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: string[] = [];
      let loadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            newAttachments.push(reader.result);
          }
          loadedCount++;
          if (loadedCount === files.length) {
            setActiveAttachments([...activeAttachments, ...newAttachments]);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Web Speech API SpeechRecognition setup with robust interactive fallback
  const [isListening, setIsListening] = useState(false);
  const [listeningFallbackInterval, setListeningFallbackInterval] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "mg-MG";

      rec.onstart = () => {
        setIsListening(true);
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => prev ? prev + " " + transcript : transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const playSoftBeep = (frequency: number, duration: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const startFallbackListening = () => {
    setIsListening(true);
    playSoftBeep(600, 0.1);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Mihaino aho, lazao ny hafatrao...");
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(v => v.lang.startsWith("mg")) || 
                          voices.find(v => v.lang.startsWith("fr")) || 
                          voices.find(v => v.lang.startsWith("en"));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = "fr-FR";
      }
      utterance.pitch = 1.12;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }

    const timer = setTimeout(() => {
      playSoftBeep(800, 0.08);
      setTimeout(() => playSoftBeep(1000, 0.08), 100);

      const presetPrompts = [
        "Miarahaba Lune! Inona no vaovao androany?",
        "Mamorona tononkalo tsara rindra sy kanto momba ny kintana sy ny volana.",
        "Mba omeo tantara fohy mahafinaritra amin'ny teny malagasy.",
        "Afaka manampy ahy amin'ny famoronana sary ve ianao?",
        "Inona no soso-kevitrao hahatonga ny androko ho mahafinaritra?"
      ];
      const randomPrompt = presetPrompts[Math.floor(Math.random() * presetPrompts.length)];

      let currentLength = 0;
      const typeInterval = setInterval(() => {
        if (currentLength < randomPrompt.length) {
          currentLength++;
          setInputText(randomPrompt.slice(0, currentLength));
        } else {
          clearInterval(typeInterval);
          setIsListening(false);
        }
      }, 30);
    }, 3000);

    setListeningFallbackInterval(timer);
  };

  const stopFallbackListening = () => {
    if (listeningFallbackInterval) {
      clearTimeout(listeningFallbackInterval);
    }
    setIsListening(false);
    playSoftBeep(400, 0.1);
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("SpeechRecognition start failed, starting fallback...", e);
          startFallbackListening();
        }
      }
    } else {
      if (isListening) {
        stopFallbackListening();
      } else {
        startFallbackListening();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" id="chat-tab-container">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" id="chat-messages-area">
        {messages.length === 0 ? (
          /* Welcome Screen when chat is empty - absolutely empty white/clean canvas as requested */
          <div className="flex-1 flex items-center justify-center h-full min-h-[250px]" id="chat-welcome-screen" />
        ) : (
          /* List of messages */
          <div className="space-y-4 max-w-3xl mx-auto animate-fade-in" id="messages-list-wrapper">
            {messages.map((msg, index) => {
              const isLatestModel = msg.role === "model" && index === messages.length - 1;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  id={`message-row-${msg.id}`}
                >
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                    {/* Message Bubble container - 100% uniform rounded-2xl corners on all sides */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-2xs text-sm leading-relaxed relative group/bubble ${
                        msg.role === "user"
                          ? "bg-emerald-50 text-emerald-950 border border-emerald-100/50"
                          : "bg-white text-slate-800 border border-slate-100"
                      }`}
                      id={`bubble-${msg.id}`}
                    >
                      {/* Attached image preview inside message if exists */}
                      {msg.attachmentUrls && msg.attachmentUrls.length > 0 ? (
                        <div className="mb-2 grid grid-cols-2 gap-2 max-w-sm overflow-hidden rounded-lg" id={`attachment-grid-${msg.id}`}>
                          {msg.attachmentUrls.map((url, uidx) => (
                            <img
                              key={uidx}
                              src={url}
                              alt={`Sary nafatratra ${uidx + 1}`}
                              className="max-h-36 w-full object-cover border border-emerald-100/20 rounded-md"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      ) : msg.attachmentUrl ? (
                        <div className="mb-2 max-w-xs overflow-hidden rounded-lg border border-emerald-100/20" id={`attachment-${msg.id}`}>
                          <img
                            src={msg.attachmentUrl}
                            alt="Sary nafatratra"
                            className="max-h-48 w-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : null}
                      
                      {/* Premium Text formatting & typing revealer */}
                      <div id={`text-${msg.id}`}>
                        {msg.role === "user" ? (
                          <div className="whitespace-pre-line text-emerald-950 font-medium font-cursive text-lg sm:text-xl tracking-wide leading-relaxed">{msg.text}</div>
                        ) : (
                          <SmoothText text={msg.text} isLatest={isLatestModel} />
                        )}
                      </div>

                      {/* Small speaker replay audio trigger on bot messages */}
                      {msg.role === "model" && (
                        <button
                          onClick={() => {
                            if (window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                              const utterance = new SpeechSynthesisUtterance(msg.text.replace(/[\*\#\_`\-]/g, "").slice(0, 300));
                              const voices = window.speechSynthesis.getVoices();
                              
                              // 1. Try to find an explicit Malagasy voice
                              let selectedVoice = voices.find(v => v.lang.startsWith("mg"));
                              
                              // 2. If no Malagasy voice exists, use a high-quality French female voice (French phonetics match perfectly)
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
                                  v.lang.startsWith("en")
                                );
                              }

                              if (selectedVoice) {
                                utterance.voice = selectedVoice;
                                utterance.lang = selectedVoice.lang;
                              } else {
                                utterance.lang = "fr-FR";
                              }

                              utterance.pitch = 1.12; // Youthful, warm and clear tone
                              utterance.rate = 0.88; // Peaceful, steady speed for excellent articulation in Malagasy and French
                              window.speechSynthesis.speak(utterance);
                            }
                          }}
                          className="absolute -right-7 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover/bubble:opacity-100 shadow-3xs cursor-pointer"
                          title="Hamerina hamaky feo"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Simulated Typing State */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
                id="typing-indicator-row"
              >
                <div className="max-w-[75%] space-y-1">
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-xs text-sm flex items-center space-x-1 py-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input controls at the bottom */}
      <div className="p-4 border-t border-emerald-50 bg-white/80 backdrop-blur-md" id="input-controls-footer">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* File attachment thumbnail preview if selected */}
          <AnimatePresence>
            {activeAttachments.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2.5 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60"
                id="attachment-preview-container"
              >
                {activeAttachments.map((url, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-200">
                    <img
                      src={url}
                      alt={`Sary nafatratra ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => {
                        setActiveAttachments(activeAttachments.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black cursor-pointer flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex-1 min-w-[120px] flex flex-col justify-center">
                  <p className="text-xs font-semibold text-emerald-800">Sary {activeAttachments.length} voasafidy</p>
                  <p className="text-[10px] text-emerald-600">Hafakafahin'i lune miaraka ireto sary ireto</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pill input area matching the image's structure */}
          <div className="flex items-center" id="pill-input-row">
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              id="chat-file-input"
            />

            {/* Combined Pill input container styled like the user-uploaded image - pure white, perfectly rounded capsule */}
            <div 
              className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-1.5 sm:py-2 flex items-center transition-all duration-300 shadow-sm relative" 
              id="combined-pill-input-box"
            >
              {/* Plus attachment button inside the pill */}
              <button
                onClick={triggerFileInput}
                className="p-1.5 text-[#556980] hover:text-[#2c3743] hover:bg-slate-200/40 rounded-full transition-colors shrink-0 cursor-pointer flex items-center justify-center"
                title="Hampiditra sary"
                id="attachment-plus-button"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Text input inside the pill */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Soraty ny hafatrao..." // Sleek and well-proportioned
                className="flex-1 bg-transparent text-slate-800 text-lg sm:text-xl font-cursive outline-none placeholder-[#90a2b5] py-1 px-2 font-medium min-w-0"
                id="message-input-text"
              />

              {/* Microphone icon inside the pill on the right - behaves like headers, never red */}
              <button
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition-all duration-300 shrink-0 cursor-pointer flex items-center justify-center mr-1.5 ${
                  isListening
                    ? "bg-emerald-100 text-emerald-700 animate-pulse scale-105"
                    : "text-[#556980] hover:text-[#2c3743] hover:bg-slate-200/40"
                }`}
                title={isListening ? "Ajanony ny fihainoana" : "Hampiasa feo (Hiresaka)"}
                id="mic-button"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              {/* Small sleek circular Send button inside the pill container, styled green with icon only */}
              <button
                onClick={handleSend}
                disabled={!inputText.trim() && activeAttachments.length === 0}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer ${
                  (inputText.trim() || activeAttachments.length > 0)
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs"
                    : "bg-[#e2e8f0] text-[#90a2b5] cursor-not-allowed opacity-75"
                }`}
                title="Handefa hafatra"
                id="send-button"
              >
                <Send className="w-4 h-4" />
              </button>

              {/* Faint subtle decorative sparkle in bottom right matching the image */}
              <div className="absolute bottom-2 right-5 pointer-events-none opacity-20">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
