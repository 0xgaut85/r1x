/**
 * Intent Parsing Utility
 * 
 * Maps user queries to marketplace service categories
 * Used by r1x Agent to understand what services users are requesting
 */

export type ServiceCategory = 
  | 'ai' 
  | 'api' 
  | 'mint' 
  | 'data' 
  | 'compute' 
  | 'teleop' 
  | 'routes' 
  | 'content'
  | 'tokens'
  | 'nfts'
  | 'other';

export interface ParsedIntent {
  category: ServiceCategory;
  confidence: number; // 0-1
  keywords: string[];
  originalQuery: string;
}

/**
 * Parse user query to determine service category intent
 */
export function parseIntent(query: string): ParsedIntent {
  const lowerQuery = query.toLowerCase().trim();
  const keywords: string[] = [];
  let category: ServiceCategory = 'other';
  let confidence = 0.5;

  // AI services
  if (
    /(ai|artificial intelligence|inference|llm|model|gpt|claude|openai|anthropic|chatbot|assistant)/i.test(lowerQuery) ||
    /(generate|generate text|text generation|completion)/i.test(lowerQuery)
  ) {
    category = 'ai';
    confidence = 0.9;
    keywords.push('ai', 'inference', 'llm');
  }
  // Minting / Token creation
  else if (
    /(mint|minting|create token|token creation|meme token|erc-20|erc20|coin creation)/i.test(lowerQuery) ||
    /(create.*token|new token|deploy token)/i.test(lowerQuery)
  ) {
    category = 'mint';
    confidence = 0.9;
    keywords.push('mint', 'token');
  }
  // NFTs
  else if (
    /(nft|non-fungible|erc-721|erc721|collectible|digital art)/i.test(lowerQuery) ||
    /(mint.*nft|create.*nft)/i.test(lowerQuery)
  ) {
    category = 'nfts';
    confidence = 0.9;
    keywords.push('nft', 'collectible');
  }
  // API services
  else if (
    /(api|endpoint|service|rest|graphql|webhook)/i.test(lowerQuery) ||
    /(call.*api|use.*api|access.*api)/i.test(lowerQuery)
  ) {
    category = 'api';
    confidence = 0.8;
    keywords.push('api', 'endpoint');
  }
  // Data services
  else if (
    /(data|dataset|database|query|analytics|stream)/i.test(lowerQuery) ||
    /(get.*data|fetch.*data|access.*data)/i.test(lowerQuery)
  ) {
    category = 'data';
    confidence = 0.8;
    keywords.push('data', 'dataset');
  }
  // Compute services
  else if (
    /(compute|compute.*resource|gpu|cpu|processing|rendering)/i.test(lowerQuery) ||
    /(run.*code|execute|process)/i.test(lowerQuery)
  ) {
    category = 'compute';
    confidence = 0.8;
    keywords.push('compute', 'processing');
  }
  // Teleoperation
  else if (
    /(teleop|teleoperation|remote.*control|robot.*control|human.*control)/i.test(lowerQuery)
  ) {
    category = 'teleop';
    confidence = 0.9;
    keywords.push('teleop', 'remote control');
  }
  // Routes / Navigation
  else if (
    /(route|routing|navigation|path|directions|map)/i.test(lowerQuery) ||
    /(find.*route|calculate.*route|navigate)/i.test(lowerQuery)
  ) {
    category = 'routes';
    confidence = 0.8;
    keywords.push('route', 'navigation');
  }
  // Content / Media
  else if (
    /(content|media|image|video|audio|file)/i.test(lowerQuery) ||
    /(generate.*image|create.*content|produce.*media)/i.test(lowerQuery)
  ) {
    category = 'content';
    confidence = 0.7;
    keywords.push('content', 'media');
  }
  // Tokens (general)
  else if (
    /(token|tokens|coin|coins|crypto)/i.test(lowerQuery) &&
    !/(mint|create|deploy)/i.test(lowerQuery)
  ) {
    category = 'tokens';
    confidence = 0.7;
    keywords.push('token');
  }

  return {
    category,
    confidence,
    keywords,
    originalQuery: query,
  };
}

/**
 * Check if intent suggests a purchase action
 */
export function isPurchaseIntent(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return /(buy|purchase|get|use|access|call|mint|create|generate|run|execute)/i.test(lowerQuery);
}

