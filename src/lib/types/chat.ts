import { PaymentProof } from './x402';
import { MarketplaceService } from './x402';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'sending' | 'sent' | 'error';
  serviceResult?: {
    service: MarketplaceService;
    result: any;
    paymentReceipt: any;
    contentType: string;
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  proof?: PaymentProof;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

