export enum Tab {
  CHAT = "chat",
  SARY = "sary",
  PROFILE = "profile",
}

export interface NotebookPage {
  id: number; // 1 to 4
  title: string;
  content: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  alignment: "left" | "center" | "right" | "justify";
  fontSize: "sm" | "base" | "lg" | "xl";
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string; // ISO string for persistence
  attachmentUrl?: string; // Base64 or standard URL
  attachmentUrls?: string[]; // Multiple images support
}

export interface SavedSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  description: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  preferredLanguage: string;
  joinDate: string;
  googleEmail?: string;
  isGoogleConnected?: boolean;
}
