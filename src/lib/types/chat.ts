export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  error?: string;
}

