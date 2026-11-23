export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string | AIResponse;
  file?: {
    name: string;
    type: string;
    data: string; // base64
  };
  groundingMetadata?: any;
}

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface GuidanceStep {
  step: number;
  description: string;
}

export interface Portal {
  name: string;
  url: string;
}

export interface Lawyer {
  name: string;
  specialization: string;
  rating?: number;
  contact?: string;
  successRate?: string;
  reviews?: string;
}

export interface Precedent {
  caseName: string;
  summary: string;
}

export interface AIResponse {
  legalCategory: string;
  guidance: GuidanceStep[];
  portals: Portal[];
  lawyerRecommendations: Lawyer[];
  precedents: Precedent[];
  rightsSummary: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  country: string;
  timestamp: number;
  initialPrompt?: string;
  initialFile?: Message['file'];
}