import { PaymentProof } from './x402';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatRequest {
  messages: ChatMessage[];
  proof?: PaymentProof;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

