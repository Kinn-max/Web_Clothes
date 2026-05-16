import type { ChatProduct } from './product';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  products?: ChatProduct[];
}