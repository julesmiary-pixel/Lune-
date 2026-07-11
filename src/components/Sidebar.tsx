import React, { useState } from "react";
import { SavedSession, Tab, UserProfile } from "../types";
import { X, MessageSquare, Star, FileText, ChevronRight, Sparkles, User, LogOut, CheckCircle2, ShieldCheck, Mail, Video, Music, Volume2, VolumeX, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedSessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onNewChat: () => void;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
  onClearChat?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  savedSessions,
  onLoadSession,
  onNewChat,
  activeTab,
  onSelectTab,
  profile,
  onUpdateProfile,
  isSoundEnabled = true,
  onToggleSound = () => {},
  onClearChat = () => {},
}: SidebarProps) {
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [typedEmail, setTypedEmail] = useState("julesmiary@gmail.com");
  const [typedName, setTypedName] = useState("Jules Miary");

  const handleGoogleLogin = () => {
    onUpdateProfile({
      name: typedName || "Jules Miary",
      googleEmail: typedEmail || "julesmiary@gmail.com",
      isGoogleConnected: true,
    });
    setShowGoogleDialog(false);
  };

  const handleGoogleLogout = () => {
    onUpdateProfile({
      isGoogleConnected: false,
      googleEmail: undefined,
    });
  };

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          id="sidebar-overlay"
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-emerald-50 z-50 flex flex-col transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 shrink-0`}
        id="app-sidebar"
      >
        {/* Header containing Logo & Close button */}
        <div className="p-4 border-b border-emerald-50 flex items-center justify-between" id="sidebar-header">
          <div className="flex items-center space-x-2.5">
            <Logo size={36} />
            <h1 className="font-bold text-slate-800 text-xl tracking-wide leading-none select-none">lune</h1>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500 cursor-pointer"
            id="sidebar-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Connection Section - HIGHEST QUALITY INTERACTIVE LAYOUT */}
        <div className="px-4 py-3 border-b border-emerald-50/60 bg-gradient-to-br from-emerald-50/20 to-teal-50/10" id="sidebar-google-section">
          {profile.isGoogleConnected ? (
            <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs space-y-2.5" id="google-profile-connected">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm border border-emerald-400 shrink-0 select-none">
                  {(profile.name || "J").trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800 text-xs truncate block">{profile.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Voamarina amin'ny Google" />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">{profile.googleEmail}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center space-x-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Google Connected</span>
                </span>
                <button
                  onClick={handleGoogleLogout}
                  className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 cursor-pointer"
                  title="Hivoaka"
                >
                  <LogOut className="w-3 h-3 text-emerald-600" />
                  <span>Hivoaka</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#fcfdfd] border border-slate-100 rounded-xl p-3 shadow-3xs text-center space-y-2" id="google-profile-disconnected">
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Mila mampifandray kaonty Google ianao mba hamoronana mombamomba feno.
              </p>
              
              {/* Google official style button */}
              <button
                onClick={() => setShowGoogleDialog(true)}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg shadow-3xs flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                id="google-sign-in-btn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.65 1.44 7.5l3.8 2.95C6.15 6.84 8.86 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.45 12.3c0-.82-.07-1.61-.21-2.3H12v4.35h6.42c-.28 1.45-1.1 2.68-2.33 3.5l3.6 2.8c2.1-1.94 3.3-4.8 3.3-8.35z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 14.55c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.44 7.5C.52 9.35 0 11.4 0 13.5s.52 4.15 1.44 6l3.8-2.95z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.96-1.08 7.95-2.92l-3.6-2.8c-1 .67-2.28 1.07-3.71 1.07-3.14 0-5.85-1.8-6.8-4.51L1.04 16.8C3 20.65 6.97 23 12 23z"
                  />
                </svg>
                <span className="text-xs font-semibold text-slate-700">Teny amin'ny Google</span>
              </button>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4" id="sidebar-action-wrapper">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-all active:scale-95"
            id="sidebar-new-chat-button"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Resaka Vaovao</span>
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6" id="sidebar-scroll-content">
          {/* Tab Navigation Section */}
          <div className="space-y-1.5" id="sidebar-tab-navigation">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Fitaovana & Asa
            </h3>
            <div className="space-y-1 px-1">
              <button
                onClick={() => {
                  onSelectTab(Tab.CHAT);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                  activeTab === Tab.CHAT
                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="sidebar-nav-chat"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Resaka (chat)</span>
              </button>

              <a
                href="https://www.fotor.com/photo-editor-app/editor/ai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer text-slate-600 hover:bg-blue-50/40 hover:text-blue-800"
                id="sidebar-nav-sary-fotor"
              >
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Studio fanamboarana sary</span>
              </a>

              <a
                href="https://www.veed.io"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer text-slate-600 hover:bg-purple-50/40 hover:text-purple-800"
                id="sidebar-nav-video"
              >
                <Video className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Fanamboarana videô</span>
              </a>

              <a
                href="https://www.veed.io/edit/3011b105-ca9f-4789-bbe7-1b739b6ac60c/media-audio"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer text-slate-600 hover:bg-red-50/40 hover:text-red-800"
                id="sidebar-nav-music"
              >
                <Music className="w-4 h-4 text-red-600 shrink-0" />
                <span>Feonkira Studio</span>
              </a>
            </div>
          </div>

          {/* Recent saved chats folder list */}
          <div className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Resaka voatahiry farany ({savedSessions.length})
            </h3>
            {savedSessions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400 italic">Tsy misy resaka voatahiry.</p>
            ) : (
              <div className="space-y-0.5">
                {savedSessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      onLoadSession(session);
                      onClose();
                    }}
                    className="w-full text-left p-2 hover:bg-emerald-50/40 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines / Help */}
          <div className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Torohevitra momba an'i lune
            </h3>
            <div className="space-y-0.5">
              <div className="px-3 py-2 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sokajy mampiavaka</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Mahay teny malagasy madio sy tsara rindra. Vonona hanoratra, handika teny, ary hanampy amin'ny zavatra rehetra.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions persistent section */}
        <div className="p-4 border-t border-emerald-50 bg-slate-50/30 space-y-2" id="sidebar-bottom-actions">
          {/* Silencieux Button */}
          <button
            onClick={onToggleSound}
            className={`w-full py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 border text-xs font-semibold ${
              !isSoundEnabled
                ? "bg-emerald-50/40 text-emerald-600 border-emerald-100/50 hover:bg-emerald-50"
                : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80"
            }`}
            title={isSoundEnabled ? "Hampangina ny feo" : "Hampavitrika ny feo"}
            id="sidebar-action-silencieux"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0 text-emerald-500/80" />
            )}
            <span>Silencieux</span>
          </button>

          {/* Fafao ny Resaka Button */}
          <button
            onClick={onClearChat}
            className="w-full py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 text-xs font-semibold"
            title="Famafana ny resaka rehetra"
            id="sidebar-action-clear"
          >
            <Trash2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Fafao ny Resaka</span>
          </button>
        </div>

        {/* Footer info brand block */}
        <div className="p-4 border-t border-emerald-50 text-[10px] text-slate-400 text-center space-y-1" id="sidebar-footer">
          <p>© 2026 lune AI. Zo rehetra voatana.</p>
          <p className="font-medium text-emerald-600">Faharanitan-tsaina Malagasy</p>
        </div>
      </div>

      {/* Google Login popup/modal */}
      <AnimatePresence>
        {showGoogleDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
            id="google-auth-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-5"
              id="google-auth-dialog"
            >
              {/* Google logo design */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex space-x-1 font-bold text-lg tracking-tight">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Hampifandray kaonty Google</h3>
                <p className="text-xs text-slate-500">Mila mampiasa kaonty Google ianao hampiasana ny mombamomba ny lune AI.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Anarana</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-200 rounded-xl p-2.5 text-xs outline-none transition-all"
                    placeholder="Anarana"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Google Email</label>
                  <input
                    type="email"
                    value={typedEmail}
                    onChange={(e) => setTypedEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-200 rounded-xl p-2.5 text-xs outline-none transition-all"
                    placeholder="E-mail"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setShowGoogleDialog(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hofoanana
                </button>
                <button
                  onClick={handleGoogleLogin}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Hampifandray
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
