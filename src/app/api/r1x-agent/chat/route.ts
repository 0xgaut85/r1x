import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/anthropic';
import { ChatRequest } from '@/lib/types/chat';

/**
 * Chat API endpoint for r1x Agent
 * 
 * Requires ANTHROPIC_API_KEY to be set in environment variables (.env.local)
 * 
 * Example .env.local:
 * ANTHROPIC_API_KEY=sk-ant-api03-...
 */

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }
    
    // Validate messages format
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { error: 'Invalid message format: role and content are required' },
          { status: 400 }
        );
      }
    }
    
    const response = await getChatResponse(body.messages);
    
    return NextResponse.json({ message: response });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

