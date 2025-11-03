import Anthropic from '@anthropic-ai/sdk';

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  
  return new Anthropic({ apiKey });
}

export async function getChatResponse(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  const client = getAnthropicClient();
  
  // Use the latest Claude 3.5 Sonnet model
  // Available models: claude-3-5-sonnet-20240620, claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20240620', // Latest Claude 3.5 Sonnet model
    max_tokens: 4096,
    messages: messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  throw new Error('Unexpected response format from Anthropic API');
}

