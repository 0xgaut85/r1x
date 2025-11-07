'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { wrapFetchWithPayment } from 'x402-fetch';
import { parseIntent, isPurchaseIntent, ServiceCategory } from '@/lib/intent/parseIntent';
import { marketplaceCatalog } from '@/lib/marketplace/catalog';
import { X402Client } from '@/lib/payments/x402Client';
import { MarketplaceService } from '@/lib/types/x402';

// No longer need x402-server-url - using Next.js API routes (same origin)
import AgentBackground from '@/components/r1x-agent/AgentBackground';
import AgentHeader from '@/components/r1x-agent/AgentHeader';
import AgentFooter from '@/components/r1x-agent/AgentFooter';
import ChatMessages from '@/components/r1x-agent/ChatMessages';
import ChatInput from '@/components/r1x-agent/ChatInput';
import ChatSuggestions from '@/components/r1x-agent/ChatSuggestions';
import ErrorBanner from '@/components/r1x-agent/ErrorBanner';
import ParamWizard from '@/components/r1x-agent/ParamWizard';
import AgentLeftSidebar from '@/components/r1x-agent/sidebar/AgentLeftSidebar';

const initialWelcomeMessage: ChatMessage = {
  role: 'assistant',
  content: 'Hello! I\'m r1x Agent, your assistant for the machine economy. I can help you understand how r1x enables autonomous machine-to-machine transactions, answer questions about our infrastructure, and guide you through building on Base. What would you like to know?',
};

const suggestions = [
  'How does r1x enable machine-to-machine payments?',
  'What is the machine economy?',
  'How do I integrate r1x SDK?',
  'Tell me about r1x Marketplace',
];

export default function R1xAgentContent() {
  const { walletClient, address, isConnected } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const chainId = useChainId();
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingPurchase, setPendingPurchase] = useState<null | {
    service: MarketplaceService;
    isExternal: boolean;
    baseRequest: {
      body?: any;
      queryParams?: Record<string, string>;
      headers?: Record<string, string>;
    };
    missing: string[];
    fieldLocations?: Record<string, 'body' | 'query' | 'header'>;
    hints?: Record<string, { description?: string; example?: string; options?: string[] }>;
    fields?: Array<{ name: string; location: 'body' | 'query' | 'header'; required: boolean; description?: string; example?: string; options?: string[]; defaultValue?: string }>;
    method?: 'GET' | 'POST';
  }>(null);

  // Initialize marketplace catalog with 60s refresh
  useEffect(() => {
    marketplaceCatalog.startAutoRefresh();
    return () => {
      marketplaceCatalog.stopAutoRefresh();
    };
  }, []);

  /**
   * Conforme aux docs PayAI officielles : https://docs.payai.network/x402/clients/typescript/fetch
   * 
   * wrapFetchWithPayment(fetch, walletClient, maxValue)
   * - fetch: fonction fetch native
   * - walletClient: Signer compatible (walletClient Wagmi = Client viem avec WalletActions = EvmSigner)
   * - maxValue: montant maximum autorisé en base units (0.25 USDC = 250000 pour USDC avec 6 décimales)
   * 
   * x402-fetch gère automatiquement :
   * 1. Détection des réponses 402 Payment Required
   * 2. Génération du payment proof
   * 3. Signature de la transaction USDC via walletClient
   * 4. Ré-envoi avec header X-PAYMENT
   * 5. Retries en cas d'erreur
   */
  const fetchWithPayment = useMemo(() => {
    if (!walletClient) return null;
    try {
      // Conforme aux docs PayAI officielles
      return wrapFetchWithPayment(
        fetch, 
        walletClient as any, // walletClient Wagmi compatible avec EvmSigner (SignerWallet)
        BigInt(0.25 * 10 ** 6) // max 0.25 USDC (en base units)
      );
    } catch (err) {
      console.error('[x402-fetch] Failed to wrap fetch:', err);
      return null;
    }
  }, [walletClient]);

  // x402 client for autonomous purchases (higher max: 100 USDC)
  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    try {
      return new X402Client({
        walletClient,
        maxValue: BigInt(100 * 10 ** 6), // 100 USDC max for service purchases
      });
    } catch (err) {
      console.error('[X402Client] Failed to initialize:', err);
      return null;
    }
  }, [walletClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Preflight service endpoint to get 402 response and extract schema
   * Returns the accepts[0] object with outputSchema if available
   */
  const preflightService = async (endpoint: string): Promise<any | null> => {
    try {
      console.log('[Preflight] Fetching schema from:', endpoint);
      
      // Use proxy for external endpoints to avoid CORS
      let isExternalEndpoint = false;
      try {
        const u = new URL(endpoint);
        isExternalEndpoint = !u.hostname.includes('r1xlabs.com');
      } catch {
        // If not a full URL, treat as internal
        isExternalEndpoint = false;
      }

      let response: Response;
      // First try POST
      if (isExternalEndpoint) {
        response = await fetch('/api/x402/proxy', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: endpoint,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {},
          }),
        });
      } else {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      // If not 402 on POST, try GET as a fallback (some merchants 402 on GET)
      if (response.status !== 402) {
        console.warn('[Preflight] Expected 402 on POST, got:', response.status, '- trying GET fallback');
        if (isExternalEndpoint) {
          response = await fetch('/api/x402/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: endpoint,
              method: 'GET',
              headers: { 'Accept': 'application/json' },
            }),
          });
        } else {
          response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });
        }
      }

      if (response.status !== 402) {
        console.warn('[Preflight] No 402 on preflight (POST/GET). Got:', response.status);
        return null;
      }

      const raw = await response.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw };
      }
      
      // Extract accepts[0] which contains the schema
      if (data.accepts && Array.isArray(data.accepts) && data.accepts.length > 0) {
        const accept = data.accepts[0];
        console.log('[Preflight] Found schema:', {
          hasOutputSchema: !!accept.outputSchema,
          method: accept.outputSchema?.input?.method,
          bodyType: accept.outputSchema?.input?.bodyType,
          hasBodyFields: !!accept.outputSchema?.input?.bodyFields,
          hasQueryParams: !!accept.outputSchema?.input?.queryParams,
        });
        return accept;
      }

      // Fallback: some merchants encode quote/schema in headers per x402
      const getHeader = (name: string) => response.headers.get(name) || response.headers.get(name.toLowerCase()) || response.headers.get(name.toUpperCase());
      const headerCandidates = [
        getHeader('X-Payment-Quote'),
        getHeader('X-Payment-Required'),
        getHeader('WWW-Authenticate'),
      ].filter(Boolean) as string[];

      for (const h of headerCandidates) {
        try {
          // Try to parse JSON directly or extract JSON substring
          let jsonStr = h;
          const start = h.indexOf('{');
          const end = h.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            jsonStr = h.substring(start, end + 1);
          }
          const parsed = JSON.parse(jsonStr);
          const accepts = parsed.accepts || (Array.isArray(parsed) ? parsed : null);
          if (accepts && Array.isArray(accepts) && accepts.length > 0) {
            const accept = accepts[0];
            console.log('[Preflight] Found schema in header:', {
              hasOutputSchema: !!accept.outputSchema,
              method: accept.outputSchema?.input?.method,
              bodyType: accept.outputSchema?.input?.bodyType,
              hasBodyFields: !!accept.outputSchema?.input?.bodyFields,
              hasQueryParams: !!accept.outputSchema?.input?.queryParams,
            });
            return accept;
          }
          // Some merchants may return single accept object
          if (parsed.outputSchema?.input) {
            return parsed;
          }
        } catch {
          // ignore header parse errors
        }
      }

      console.warn('[Preflight] No accepts array found in 402 response');
      return null;
    } catch (error) {
      const err = error as any;
      console.error('[Preflight] Error fetching schema:', err);
      return null;
    }
  };

  /**
   * Build request body/query/headers from schema and user input
   * Returns { body, queryParams, headers }
   */
  const buildRequestFromSchema = (
    schema: any,
    userInput: string
  ): { body?: any; queryParams?: Record<string, string>; headers?: Record<string, string>; missing?: string[]; hints?: Record<string, { description?: string; example?: string; options?: string[] }>; fieldLocations?: Record<string, 'body' | 'query' | 'header'>; fields?: Array<{ name: string; location: 'body' | 'query' | 'header'; required: boolean; description?: string; example?: string; options?: string[]; defaultValue?: string }>; method?: 'GET' | 'POST'; bodyType?: string } => {
    const result: { body?: any; queryParams?: Record<string, string>; headers?: Record<string, string>; missing?: string[]; hints?: Record<string, { description?: string; example?: string; options?: string[] }>; fieldLocations?: Record<string, 'body' | 'query' | 'header'>; fields?: Array<{ name: string; location: 'body' | 'query' | 'header'; required: boolean; description?: string; example?: string; options?: string[]; defaultValue?: string }>; method?: 'GET' | 'POST'; bodyType?: string } = {};
    const missing: string[] = [];
    const hints: Record<string, { description?: string; example?: string; options?: string[] }> = {};
    const fieldLocations: Record<string, 'body' | 'query' | 'header'> = {};
    const fields: Array<{ name: string; location: 'body' | 'query' | 'header'; required: boolean; description?: string; example?: string; options?: string[]; defaultValue?: string }> = [];
    
    if (!schema?.outputSchema?.input) {
      // No schema, use default
      return { body: { input: userInput } };
    }

    const input = schema.outputSchema.input;
    if (input?.method) {
      const m = String(input.method).toUpperCase();
      if (m === 'GET' || m === 'POST') result.method = m;
    }
    if (input?.bodyType) result.bodyType = input.bodyType;
    const genericInputKeys = new Set(['input', 'message', 'prompt', 'query', 'text']);
    
    // Helper to extract field metadata (description, example, options/enum)
    const captureFieldHints = (key: string, fieldDef: any) => {
      const hint: { description?: string; example?: string; options?: string[] } = {};
      if (typeof fieldDef?.description === 'string') hint.description = fieldDef.description;
      if (fieldDef?.example !== undefined) hint.example = String(fieldDef.example);
      // Common option carriers: enum | options | values | oneOf[].const/title
      let options: string[] | undefined;
      if (Array.isArray(fieldDef?.enum)) {
        options = fieldDef.enum.map((v: any) => String(v));
      } else if (Array.isArray(fieldDef?.options)) {
        options = fieldDef.options.map((v: any) => typeof v === 'object' && v !== null ? String(v.value ?? v.label ?? v) : String(v));
      } else if (Array.isArray(fieldDef?.values)) {
        options = fieldDef.values.map((v: any) => String(v));
      } else if (Array.isArray(fieldDef?.oneOf)) {
        options = fieldDef.oneOf.map((v: any) => String(v?.const ?? v?.value ?? v?.title ?? v));
      }
      if (options && options.length > 0) hint.options = options;
      if (hint.description || hint.example || hint.options) {
        hints[key] = hint;
      }
    };
    
    // Build query params if specified
    if (input.queryParams && typeof input.queryParams === 'object') {
      result.queryParams = {};
      Object.entries(input.queryParams).forEach(([key, fieldDef]: [string, any]) => {
        captureFieldHints(key, fieldDef);
        fields.push({
          name: key,
          location: 'query',
          required: !!fieldDef?.required && fieldDef?.default === undefined,
          description: fieldDef?.description,
          example: fieldDef?.example !== undefined ? String(fieldDef.example) : undefined,
          options: Array.isArray(fieldDef?.enum) ? fieldDef.enum.map((v: any) => String(v)) : undefined,
          defaultValue: fieldDef?.default !== undefined ? String(fieldDef.default) : undefined,
        });
        if (fieldDef.required && !fieldDef.default) {
          if (genericInputKeys.has(key)) {
          result.queryParams![key] = userInput;
          } else {
            missing.push(key);
            fieldLocations[key] = 'query';
          }
        } else if (fieldDef.default !== undefined) {
          result.queryParams![key] = String(fieldDef.default);
        }
      });
    }

    // Build headers if specified
    if (input.headerFields && typeof input.headerFields === 'object') {
      result.headers = {};
      Object.entries(input.headerFields).forEach(([key, fieldDef]: [string, any]) => {
        captureFieldHints(key, fieldDef);
        fields.push({
          name: key,
          location: 'header',
          required: !!fieldDef?.required && fieldDef?.default === undefined,
          description: fieldDef?.description,
          example: fieldDef?.example !== undefined ? String(fieldDef.example) : undefined,
          options: Array.isArray(fieldDef?.enum) ? fieldDef.enum.map((v: any) => String(v)) : undefined,
          defaultValue: fieldDef?.default !== undefined ? String(fieldDef.default) : undefined,
        });
        if (fieldDef.required && !fieldDef.default) {
          if (genericInputKeys.has(key)) {
          result.headers![key] = userInput;
          } else {
            missing.push(key);
            fieldLocations[key] = 'header';
          }
        } else if (fieldDef.default !== undefined) {
          result.headers![key] = String(fieldDef.default);
        }
      });
    }

    // Build body based on bodyType
    if (input.bodyFields && typeof input.bodyFields === 'object') {
      if (input.bodyType === 'json') {
        result.body = {};
        Object.entries(input.bodyFields).forEach(([key, fieldDef]: [string, any]) => {
          captureFieldHints(key, fieldDef);
          fields.push({
            name: key,
            location: 'body',
            required: !!fieldDef?.required && fieldDef?.default === undefined,
            description: fieldDef?.description,
            example: fieldDef?.example !== undefined ? String(fieldDef.example) : undefined,
            options: Array.isArray(fieldDef?.enum) ? fieldDef.enum.map((v: any) => String(v)) : undefined,
            defaultValue: fieldDef?.default !== undefined ? String(fieldDef.default) : undefined,
          });
          if (fieldDef.required && !fieldDef.default) {
            if (genericInputKeys.has(key)) {
            result.body![key] = userInput;
            } else {
              missing.push(key);
              fieldLocations[key] = 'body';
            }
          } else if (fieldDef.default !== undefined) {
            result.body![key] = fieldDef.default;
          }
        });
      } else {
        // For form-data, text, etc., use user input as default
        result.body = { input: userInput };
      }
    } else {
      // No bodyFields specified, use default
      result.body = { input: userInput };
    }

    if (missing.length > 0) {
      result.missing = missing;
    }
    if (Object.keys(hints).length > 0) {
      result.hints = hints;
    }
    if (Object.keys(fieldLocations).length > 0) {
      result.fieldLocations = fieldLocations;
    }
    if (fields.length > 0) {
      result.fields = fields;
    }

    return result;
  };

  // Complete a pending purchase using provided values from the wizard
  const completePendingPurchaseWithValues = async (formValues: Record<string, string>) => {
    if (!pendingPurchase || !x402Client) return;
    try {
      setIsLoading(true);

      // Start from baseRequest
      const body = { ...(pendingPurchase.baseRequest.body || {}) } as Record<string, any>;
      const headers = { ...(pendingPurchase.baseRequest.headers || {}) } as Record<string, string>;
      const queryParams = { ...(pendingPurchase.baseRequest.queryParams || {}) } as Record<string, string>;

      // Apply values at correct locations
      Object.entries(formValues).forEach(([k, v]) => {
        const loc = pendingPurchase.fieldLocations?.[k] || 'body';
        if (loc === 'query') {
          queryParams[k] = v;
        } else if (loc === 'header') {
          headers[k] = v;
        } else {
          body[k] = v;
        }
      });

      // Check remaining required
      const remaining = pendingPurchase.missing.filter((k) => {
        const loc = pendingPurchase.fieldLocations?.[k] || 'body';
        const val = loc === 'query' ? queryParams[k] : loc === 'header' ? headers[k] : body[k];
        return !val;
      });

      if (remaining.length > 0) {
        const missingList = remaining.map((k) => {
          const hint = pendingPurchase.hints?.[k];
          const parts: string[] = [`- ${k}`];
          if (hint?.options && hint.options.length > 0) {
            parts.push(`  options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
          }
          if (hint?.example) parts.push(`  example: ${hint.example}`);
          if (hint?.description) parts.push(`  desc: ${hint.description}`);
          return parts.join('\n');
        }).join('\n');

        setPendingPurchase({
          ...pendingPurchase,
          baseRequest: { body, headers, queryParams },
          missing: remaining,
        });
        setMessages((prev) => ([
          ...prev,
          { role: 'assistant', content: `Still need:\n${missingList}`, status: 'sent' as const },
        ]));
        setIsLoading(false);
        return;
      }

      // Auto-supply buyerAddress if merchant complains later
      const ensureBuyerAddress = (m?: string) => {
        const method = (m || pendingPurchase.method || 'POST').toUpperCase();
        if (!address) return;
        if (method === 'GET') {
          if (!queryParams['buyerAddress']) queryParams['buyerAddress'] = address;
        } else {
          if (!body['buyerAddress']) body['buyerAddress'] = address;
        }
      };

      // Fee first
      const feeResponse = await x402Client.request('/api/fee', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!feeResponse.ok) {
        const errTxt = await feeResponse.text();
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, status: 'error', content: `Failed to pay agent fee: ${errTxt || 'Payment required'}` } as any;
          return updated;
        });
        setIsLoading(false);
        return;
      }

      // Execute purchase
      let res = await x402Client.purchaseService({
        id: pendingPurchase.service.id,
        name: pendingPurchase.service.name,
        endpoint: pendingPurchase.service.endpoint!,
        price: pendingPurchase.service.price!,
        priceWithFee: pendingPurchase.service.priceWithFee,
        isExternal: pendingPurchase.isExternal,
      }, body, queryParams, headers, (pendingPurchase as any).method as any);

      if (!res.ok) {
        const t = await res.text();
        // Retry once if buyerAddress missing
        if (res.status === 400 && /buyeraddress/i.test(t)) {
          ensureBuyerAddress((pendingPurchase as any).method as any);
          res = await x402Client.purchaseService({
            id: pendingPurchase.service.id,
            name: pendingPurchase.service.name,
            endpoint: pendingPurchase.service.endpoint!,
            price: pendingPurchase.service.price!,
            priceWithFee: pendingPurchase.service.priceWithFee,
            isExternal: pendingPurchase.isExternal,
          }, body, queryParams, headers, (pendingPurchase as any).method as any);
        }
      }

      if (!res.ok) {
        const t2 = await res.text();
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, status: 'error', content: `Purchase failed (HTTP ${res.status}): ${t2}` } as any;
          return updated;
        });
        setIsLoading(false);
        return;
      }

      // Render result
      const contentType = res.headers.get('content-type') || '';
      let result: any;
      if (contentType.includes('application/json')) result = await res.json();
      else if (contentType.includes('text/')) result = { text: await res.text() };
      else {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        result = { blob: blobUrl, filename: res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download', contentType };
      }

      const paymentResponseHeader = res.headers.get('x-payment-response') || res.headers.get('X-Payment-Response');
      let paymentReceipt: any = null;
      if (paymentResponseHeader) { try { paymentReceipt = JSON.parse(paymentResponseHeader); } catch {} }

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          content: `✅ Successfully purchased "${pendingPurchase.service.name}"!`,
          status: 'sent',
          serviceResult: { service: pendingPurchase.service, result, paymentReceipt, contentType },
        } as any;
        return updated;
      });

      setPendingPurchase(null);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  /**
   * Handle autonomous purchase of a marketplace service
   */
  const handleAutopurchase = async (service: MarketplaceService): Promise<boolean> => {
    if (!x402Client) {
      console.error('[Autopurchase] x402Client not initialized');
      setError('Payment client not available. Please ensure your wallet is connected.');
      return false;
    }

    if (!service.endpoint) {
      console.error('[Autopurchase] Service has no endpoint:', service.id);
      setError(`Service "${service.name}" is not available for direct purchase. Please check the marketplace.`);
      return false;
    }

    try {
      // Get last user message for input
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      // Show in chat that we're purchasing
      const purchaseMessage: ChatMessage = {
        role: 'assistant',
        content: `Purchasing "${service.name}" for ${service.priceWithFee || service.price} USDC...`,
        status: 'sending',
      };
      setMessages(prev => [...prev, purchaseMessage]);

      console.log('[Autopurchase] Purchasing service:', {
        id: service.id,
        name: service.name,
        endpoint: service.endpoint,
        price: service.price,
        priceWithFee: service.priceWithFee,
        isExternal: service.isExternal,
      });

      // Preflight: Require 402 (x402 merchant). Abort if not.
      const schema = await preflightService(service.endpoint);
      if (!schema) {
        console.warn('[Autopurchase] Preflight did not return 402 - not an x402 endpoint, aborting');
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            status: 'error',
            content: `This service endpoint does not speak x402 (no 402 preflight). Purchase cancelled.`,
          };
          return updated;
        });
        return false;
      }

      const requestData = buildRequestFromSchema(schema, lastUserMessage);

      // If the provider requires specific fields (non-generic) ask user instead of guessing (include options/examples when available)
      if (requestData.missing && requestData.missing.length > 0) {
        const missingList = requestData.missing.map(k => {
          const hint = requestData.hints?.[k];
          const parts: string[] = [`- ${k}`];
          if (hint?.options && hint.options.length > 0) {
            parts.push(`  options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
          }
          if (hint?.example) {
            parts.push(`  example: ${hint.example}`);
          }
          if (hint?.description) {
            parts.push(`  desc: ${hint.description}`);
          }
          return parts.join('\n');
        }).join('\n');
        // Detect external before persisting pending
        let isExternalService = service.isExternal ?? false;
        if (!isExternalService && service.endpoint) {
          try {
            const endpointUrl = new URL(service.endpoint);
            isExternalService = !endpointUrl.hostname.includes('r1xlabs.com');
          } catch {
            isExternalService = true;
          }
        }
        // Update current "Purchasing..." message to a paused state
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx]?.status === 'sending') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              status: 'sent',
              content: `⏸️ Awaiting required fields to proceed with "${service.name}".`,
            };
          }
          return updated;
        });
        // Persist pending purchase context to handle next user message with values
        setPendingPurchase({
          service,
          isExternal: isExternalService,
          baseRequest: {
            body: requestData.body,
            queryParams: requestData.queryParams,
            headers: requestData.headers,
          },
          missing: requestData.missing,
          fieldLocations: requestData.fieldLocations,
          hints: requestData.hints,
          fields: requestData.fields,
          method: requestData.method as any,
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `This service requires additional fields:\n${missingList}\n\nReply with key=value pairs for each field (e.g., field=value). If there's only one field, you can reply with just the value.`,
        }]);
        setError('Missing required fields for the external service.');
        return false;
      }
      
      console.log('[Autopurchase] Built request from schema:', {
        hasBody: !!requestData.body,
        hasQueryParams: !!requestData.queryParams,
        hasHeaders: !!requestData.headers,
      });

      // Step 1: Pay fixed $0.05 agent fee first (for all services)
      console.log('[Autopurchase] Paying agent fee ($0.05 USDC)...');
      const feeResponse = await x402Client.request('/api/fee', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      if (!feeResponse.ok) {
        const errorText = await feeResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('[Autopurchase] Agent fee payment failed:', {
          status: feeResponse.status,
          error: errorData,
        });
        
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.status === 'sending') {
            updated[updated.length - 1] = {
              ...lastMsg,
              status: 'error',
              content: `Failed to pay agent fee: ${errorData.error || 'Payment required'}`,
            };
          }
          return updated;
        });
        
        return false;
      }

      console.log('[Autopurchase] Agent fee paid successfully, proceeding with service purchase...');

      // Step 2: Purchase service via x402
      // External detection: isExternal flag OR endpoint host != r1xlabs.com
      let isExternalService = service.isExternal ?? false;
      
      if (!isExternalService && service.endpoint) {
        try {
          const endpointUrl = new URL(service.endpoint);
          isExternalService = !endpointUrl.hostname.includes('r1xlabs.com');
        } catch {
          // Invalid URL, assume external
          isExternalService = true;
        }
      }
      
      console.log('[Autopurchase] Service external detection:', {
        isExternalFlag: service.isExternal,
        endpoint: service.endpoint,
        isExternal: isExternalService,
      });

      let response = await x402Client.purchaseService({
        id: service.id,
        name: service.name,
        endpoint: service.endpoint,
        price: service.price,
        priceWithFee: service.priceWithFee,
        isExternal: isExternalService,
      }, requestData.body, requestData.queryParams, requestData.headers, requestData.method as any);

      console.log('[Autopurchase] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('[Autopurchase] Purchase failed:', {
          status: response.status,
          error: errorData,
        });

        // If the external merchant requires specific input fields, surface it clearly
        if (response.status === 400) {
          const message: string = errorData.error || errorData.message || '';
          if (typeof message === 'string' && /required/i.test(message)) {
            // Try to infer missing keys from the error message (best-effort, generic)
            const inferredKeys: string[] = [];
            // Look for quoted keys or words before "is required"/"are required"
            const quoted = message.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
            inferredKeys.push(...quoted);
            const reqMatch = message.match(/([A-Za-z0-9_\- ]+)\s+(is|are)\s+required/i);
            if (reqMatch && reqMatch[1]) {
              const tokens = reqMatch[1].split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
              // Prefer last non-generic token as a key candidate
              const candidate = tokens.reverse().find(t => !['field', 'value', 'input', 'parameter', 'agent', 'name'].includes(t.toLowerCase()));
              if (candidate) inferredKeys.push(candidate);
            }
            // Deduplicate and sanitize candidates
            const missingKeys = Array.from(new Set(inferredKeys.filter(Boolean))).slice(0, 3);

            // Persist pending purchase so user's next message can supply key=value
            setPendingPurchase({
              service,
              isExternal: isExternalService,
              baseRequest: {
                body: requestData.body,
                queryParams: requestData.queryParams,
                headers: requestData.headers,
              },
              missing: missingKeys.length > 0 ? missingKeys : ['value'],
              fieldLocations: requestData.fieldLocations,
              hints: requestData.hints,
              fields: requestData.fields,
              method: requestData.method as any,
            });

            const fieldList = (missingKeys.length > 0 ? missingKeys : []).map(k => `- ${k}`).join('\n');
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                status: 'error',
                content: fieldList 
                  ? `The selected service requires additional input:\n${fieldList}\n\nReply with key=value for each field. If there's only one field, you can reply with just the value.`
                  : `The selected service requires additional input.\n\nReply with key=value for each field the provider expects (as per their 402 quote). If there's only one field, you can reply with just the value.`,
              };
              return updated;
            });
            return false;
          }
        }

        // Retry once if buyerAddress missing
        if (response.status === 400) {
          const msg = (errorData.error || errorData.message || errorText || '').toString();
          if (/buyeraddress/i.test(msg) && address) {
            if ((requestData.method || 'POST').toUpperCase() === 'GET') {
              requestData.queryParams = { ...(requestData.queryParams || {}), buyerAddress: address };
            } else {
              requestData.body = { ...(requestData.body || {}), buyerAddress: address };
            }
            response = await x402Client.purchaseService({
              id: service.id,
              name: service.name,
              endpoint: service.endpoint,
              price: service.price,
              priceWithFee: service.priceWithFee,
              isExternal: isExternalService,
            }, requestData.body, requestData.queryParams, requestData.headers, requestData.method as any);
            if (response.ok) {
              // continue to success processing
            } else {
              const et = await response.text();
              throw new Error(`Purchase failed (HTTP ${response.status}): ${et}`);
            }
          }
        }

        // Handle 402 Payment Required (shouldn't happen with x402-fetch, but handle gracefully)
        if (response.status === 402) {
          throw new Error(
            `Payment required but could not be processed. Please check:\n` +
            `1. Wallet is connected and on Base network\n` +
            `2. You have sufficient USDC balance\n` +
            `3. Transaction was approved in wallet`
          );
        }

        throw new Error(
          `Purchase failed (HTTP ${response.status}): ${errorData.error || errorData.message || errorText}`
        );
      }

      // Get response content type
      const contentType = response.headers.get('content-type') || '';
      let result: any;
      
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else if (contentType.includes('text/')) {
        result = { text: await response.text() };
      } else {
        // Binary or unknown - create blob
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        result = { 
          blob: blobUrl,
          filename: response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download',
          contentType: contentType,
        };
      }
      
      console.log('[Autopurchase] Purchase successful:', {
        contentType,
        hasResult: !!result,
      });
      
      // Extract payment receipt from headers
      const paymentResponseHeader = response.headers.get('x-payment-response') || response.headers.get('X-Payment-Response');
      let paymentReceipt: any = null;
      if (paymentResponseHeader) {
        try {
          paymentReceipt = JSON.parse(paymentResponseHeader);
        } catch {
          // Ignore parse errors
        }
      }

      // Log purchases to our API so settlementHash is persisted for panels
      try {
        const feeReceiptHeader = feeResponse.headers.get('x-payment-response') || feeResponse.headers.get('X-Payment-Response');
        await fetch('/api/purchases/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service.id,
            serviceName: service.name,
            payer: address,
            feeReceipt: feeReceiptHeader || null,
            serviceReceipt: paymentResponseHeader || null,
            feeAmount: '0.05',
            servicePrice: service.price,
            type: isExternalService ? 'external' : 'internal',
          }),
        });
      } catch (logErr) {
        console.warn('[Autopurchase] Failed to log purchase (non-blocking):', logErr);
      }

      // Log service result (non-blocking)
      try {
        const resultPayload: any = {
          serviceId: service.id,
          payer: address,
          serviceReceipt: paymentResponseHeader || null,
          contentType,
        };

        if (contentType.includes('application/json')) {
          // Extract meaningful data from JSON response
          let jsonData = result;
          if (result?.data) jsonData = result.data;
          else if (result?.result) jsonData = result.result;
          else if (result?.output) jsonData = result.output;
          resultPayload.resultJson = jsonData;
        } else if (contentType.includes('text/')) {
          resultPayload.resultText = result.text || result;
        } else if (result?.filename) {
          resultPayload.filename = result.filename;
          resultPayload.metadata = { contentType: result.contentType };
        }

        await fetch('/api/purchases/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resultPayload),
        });
      } catch (resultErr) {
        console.warn('[Autopurchase] Failed to log service result (non-blocking):', resultErr);
      }
      
      // Update purchase message with result (will be enhanced by ServiceResultCard component later)
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `✅ Successfully purchased "${service.name}"!`,
          status: 'sent',
          serviceResult: {
            service,
            result,
            paymentReceipt,
            contentType,
          },
        };
        return updated;
      });

      return true;
    } catch (error) {
      const err = error as any;
      console.error('[Autopurchase] Error:', err);
      console.error('[Autopurchase] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      
      // Provide helpful error message
      let errorMessage = err.message || 'Unknown error';
      
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = `Cannot connect to payment service. Please check:\n` +
          `1. Network connection is stable\n` +
          `2. Next.js API route is accessible (/api/x402/pay)\n` +
          `3. Express server is running\n` +
          `4. Wallet is properly connected\n\n` +
          `Original error: ${err.message}`;
      } else if (err.message?.includes('exceeds maximum')) {
        errorMessage = err.message;
      } else if (err.message?.includes('not initialized')) {
        errorMessage = `Payment client error: ${err.message}\n\nPlease reconnect your wallet and try again.`;
      }
      
      // Update purchase message with error
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `❌ Failed to purchase "${service.name}": ${errorMessage}`,
          status: 'error',
        };
        return updated;
      });

      setError(errorMessage);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Vérifier que le wallet est connecté et que x402-fetch est disponible
    if (!wagmiConnected || !fetchWithPayment) {
      modal.open();
      setError('Please connect your wallet to send messages');
      setIsLoading(false);
      return;
    }

    if (chainId !== base.id) {
      setError('Please switch to Base network');
      setIsLoading(false);
      return;
    }

    // If we have a pending purchase awaiting required fields, interpret this message as field values
    if (pendingPurchase && x402Client) {
      try {
        setIsLoading(true);
        const raw = input.trim();
        const rawLower = raw.toLowerCase();

        // Allow cancel/exit while awaiting fields
        if (['cancel', 'stop', 'abort', 'no', 'exit', 'back'].includes(rawLower)) {
          setPendingPurchase(null);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Purchase cancelled. You can continue chatting or choose another service.',
            status: 'sent',
          }]);
          setIsLoading(false);
          setInput('');
          return;
        }

        // If user tries to confirm/purchase without providing fields, re-list exactly what is needed
        if (['confirm', 'purchase', 'pay', 'proceed'].includes(rawLower) && pendingPurchase.missing.length > 0) {
          const missingList = pendingPurchase.missing.map(k => {
            const hint = pendingPurchase.hints?.[k];
            const parts: string[] = [`- ${k}`];
            if (hint?.options && hint.options.length > 0) {
              parts.push(`  options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
            }
            if (hint?.example) {
              parts.push(`  example: ${hint.example}`);
            }
            if (hint?.description) {
              parts.push(`  desc: ${hint.description}`);
            }
            return parts.join('\n');
          }).join('\n');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: missingList
              ? `Still need these fields before payment:\n${missingList}\n\nReply with key=value for each field.`
              : `The provider requires additional input. Reply with the expected key=value pairs.`,
            status: 'sent',
          }]);
          setIsLoading(false);
          setInput('');
          return;
        }
        // Prepare working copies
        const body = { ...(pendingPurchase.baseRequest.body || {}) };
        const headers = { ...(pendingPurchase.baseRequest.headers || {}) };
        const queryParams = { ...(pendingPurchase.baseRequest.queryParams || {}) };
        let remaining = [...pendingPurchase.missing];

        // Parse key=value pairs
        const kv: Record<string, string> = {};
        const pairRegex = /([A-Za-z0-9_\-]+)\s*=\s*([^\s,;]+)/g;
        let m: RegExpExecArray | null;
        while ((m = pairRegex.exec(raw)) !== null) {
          kv[m[1]] = m[2];
        }
        // If no pairs and exactly one missing, treat whole input as the value
        if (Object.keys(kv).length === 0 && remaining.length === 1) {
          const onlyKey = remaining[0];
          kv[onlyKey] = raw;
        }

        // Apply values to the correct locations
        for (const [k, v] of Object.entries(kv)) {
          const loc = pendingPurchase.fieldLocations?.[k] || 'body';
          if (loc === 'query') {
            queryParams[k] = v;
          } else if (loc === 'header') {
            headers[k] = v;
          } else {
            if (!body || typeof body !== 'object') {
              // ensure object
              (pendingPurchase.baseRequest as any).body = {};
            }
            (body as any)[k] = v;
          }
          remaining = remaining.filter(x => x !== k);
        }

        // If still missing, prompt again with remaining and hints
        if (remaining.length > 0) {
          const missingList = remaining.map(k => {
            const hint = pendingPurchase.hints?.[k];
            const parts: string[] = [`- ${k}`];
            if (hint?.options && hint.options.length > 0) {
              parts.push(`  options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
            }
            if (hint?.example) {
              parts.push(`  example: ${hint.example}`);
            }
            if (hint?.description) {
              parts.push(`  desc: ${hint.description}`);
            }
            return parts.join('\n');
          }).join('\n');

          setPendingPurchase({
            ...pendingPurchase,
            baseRequest: { body, headers, queryParams },
            missing: remaining,
          });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Still need:\n${missingList}\n\nPlease provide the remaining values.`,
          }]);
          setIsLoading(false);
          setInput('');
          return;
        }

        // All required fields collected → proceed with fee then purchase
        // Show progress
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Purchasing "${pendingPurchase.service.name}"...`,
          status: 'sending',
        }]);

        console.log('[Autopurchase] Paying agent fee ($0.05 USDC)...');
        const feeResponse = await x402Client.request('/api/fee', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        if (!feeResponse.ok) {
          const errTxt = await feeResponse.text();
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              status: 'error',
              content: `Failed to pay agent fee: ${errTxt || 'Payment required'}`,
            };
            return updated;
          });
          setIsLoading(false);
          setInput('');
          return;
        }

        const response = await x402Client.purchaseService({
          id: pendingPurchase.service.id,
          name: pendingPurchase.service.name,
          endpoint: pendingPurchase.service.endpoint!,
          price: pendingPurchase.service.price!,
          priceWithFee: pendingPurchase.service.priceWithFee,
          isExternal: pendingPurchase.isExternal,
        }, body, queryParams, headers);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData: any;
          try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }

          // Surface 400 required-field messages again
          if (response.status === 400) {
            const message: string = errorData.error || errorData.message || '';
            if (typeof message === 'string' && /required/i.test(message)) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  status: 'error',
                  content: `The selected service requires additional input:\n\n${message}\n\nPlease provide the required value and I'll retry.`,
                };
                return updated;
              });
              setIsLoading(false);
              setInput('');
              return;
            }
          }

          // 402 edge
          if (response.status === 402) {
            throw new Error('Payment required but could not be processed.');
          }

          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              status: 'error',
              content: `Purchase failed (HTTP ${response.status}): ${errorData.error || errorData.message || errorText}`,
            };
            return updated;
          });
          setIsLoading(false);
          setInput('');
          return;
        }

        // Decode result
        const contentType = response.headers.get('content-type') || '';
        let result: any;
        if (contentType.includes('application/json')) {
          result = await response.json();
        } else if (contentType.includes('text/')) {
          result = { text: await response.text() };
        } else {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          result = { blob: blobUrl, filename: response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download', contentType };
        }

        // Receipts and logging
        const paymentResponseHeader = response.headers.get('x-payment-response') || response.headers.get('X-Payment-Response');
        let paymentReceipt: any = null;
        if (paymentResponseHeader) {
          try { paymentReceipt = JSON.parse(paymentResponseHeader); } catch {}
        }
        try {
          const feeReceiptHeader = feeResponse.headers.get('x-payment-response') || feeResponse.headers.get('X-Payment-Response');
          await fetch('/api/purchases/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: pendingPurchase.service.id,
              serviceName: pendingPurchase.service.name,
              payer: address,
              feeReceipt: feeReceiptHeader || null,
              serviceReceipt: paymentResponseHeader || null,
              feeAmount: '0.05',
              servicePrice: pendingPurchase.service.price,
              type: pendingPurchase.isExternal ? 'external' : 'internal',
            }),
          });
        } catch (logErr) {
          console.warn('[Autopurchase] Failed to log purchase (non-blocking):', logErr);
        }

        // Log service result (non-blocking)
        try {
          const resultPayload: any = {
            serviceId: pendingPurchase.service.id,
            payer: address,
            serviceReceipt: paymentResponseHeader || null,
            contentType,
          };

          if (contentType.includes('application/json')) {
            let jsonData = result;
            if (result?.data) jsonData = result.data;
            else if (result?.result) jsonData = result.result;
            else if (result?.output) jsonData = result.output;
            resultPayload.resultJson = jsonData;
          } else if (contentType.includes('text/')) {
            resultPayload.resultText = result.text || result;
          } else if (result?.filename) {
            resultPayload.filename = result.filename;
            resultPayload.metadata = { contentType: result.contentType };
          }

          await fetch('/api/purchases/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultPayload),
          });
        } catch (resultErr) {
          console.warn('[Autopurchase] Failed to log service result (non-blocking):', resultErr);
        }

        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: `✅ Successfully purchased "${pendingPurchase.service.name}"!`,
            status: 'sent',
            serviceResult: {
              service: pendingPurchase.service,
              result,
              paymentReceipt,
              contentType,
            },
          };
          return updated;
        });

        setPendingPurchase(null);
        setIsLoading(false);
        setInput('');
        return;
      } catch (e: any) {
        console.error('[PendingPurchase] Error:', e?.message || e);
        setIsLoading(false);
        // Fall through to default handling if anything unexpected
      }
    }
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      status: 'sending',
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Check if this is a purchase intent
    const intent = parseIntent(input.trim());
    const isPurchase = isPurchaseIntent(input.trim());
    
    // If purchase intent, find and propose services
    if (isPurchase && intent.category !== 'other') {
      const proposals = marketplaceCatalog.findServices(intent.category, 5);
      
      // Filter to only services with endpoints (purchasable)
      const purchasableProposals = proposals.filter(s => s.endpoint);
      
      if (purchasableProposals.length > 0) {
        // Propose services in chat (show top 3)
        const topProposals = purchasableProposals.slice(0, 3);
        const proposalText = topProposals
          .map((s, i) => `${i + 1}. **${s.name}** - ${s.priceWithFee || s.price} USDC\n   ${s.description || ''}`)
          .join('\n\n');
        
        const proposalMessage: ChatMessage = {
          role: 'assistant',
          content: `I found ${purchasableProposals.length} ${intent.category} service(s) for you:\n\n${proposalText}\n\nI'll proceed with the best option: **${topProposals[0].name}**.`,
          status: 'sent',
        };
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
          return [...updated, proposalMessage];
        });

        // Automatically purchase the top proposal
        const purchased = await handleAutopurchase(topProposals[0]);
        
        if (!purchased && topProposals.length > 1) {
          // Try next proposal if first failed
          await handleAutopurchase(topProposals[1]);
        }

        setIsLoading(false);
        return;
      } else if (proposals.length > 0) {
        // Services found but none have endpoints
        const infoMessage: ChatMessage = {
          role: 'assistant',
          content: `I found ${proposals.length} ${intent.category} service(s), but they're not yet available for direct purchase. Please check the marketplace for more details.`,
          status: 'sent',
        };
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
          return [...updated, infoMessage];
        });

        setIsLoading(false);
        return;
      }
    }

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      /**
       * Utilisation conforme aux docs PayAI officielles
       * x402-fetch gère automatiquement tout le flow de paiement :
       * - Si 402 reçu → génère automatiquement le payment proof
       * - Signe la transaction USDC via walletClient
       * - Ré-envoie avec header X-PAYMENT
       * - Retries automatiques en cas d'erreur
       * 
       * L'utilisateur verra uniquement la popup de signature dans son wallet
       * 
       * Using Next.js API route (/api/r1x-agent/chat) which proxies to Express server
       * This eliminates CORS issues since browser calls same origin
       */
      
      timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
      
      const response = await fetchWithPayment('/api/r1x-agent/chat', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });
      
      // Clear timeout on success
      if (timeoutId) clearTimeout(timeoutId);

      console.log('[Agent] Response status:', response.status);

      // Handle 402 Payment Required responses
      // x402-fetch should handle 402 automatically, but if we still get 402,
      // it means x402-fetch gave up (user rejected payment, payment failed, or payment proof invalid)
      if (response.status === 402) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('[Agent] 402 Payment Required after x402-fetch retry:', errorData);
        
        // Check if this is a payment quote format
        if (errorData.accepts && Array.isArray(errorData.accepts)) {
          const quote = errorData.accepts[0];
          throw new Error(
            `Payment required but could not be processed:\n\n` +
            `Amount: ${quote.maxAmountRequired ? (parseInt(quote.maxAmountRequired) / 1e6).toFixed(6) + ' USDC' : 'N/A'}\n` +
            `Recipient: ${quote.payTo || 'N/A'}\n` +
            `Network: ${quote.network || 'N/A'}\n\n` +
            `Possible causes:\n` +
            `1. Payment transaction was rejected or failed\n` +
            `2. Payment proof format invalid\n` +
            `3. Express server not accepting payment proof\n\n` +
            `Please check:\n` +
            `- Wallet transaction status\n` +
            `- Express server logs (Railway → r1x-server → Logs)\n` +
            `- Browser console for detailed errors`
          );
        }
        
        throw new Error(`Payment required (402) but could not be processed. Please check your wallet and try again.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Agent] Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      // Capture payment receipt header for immediate Basescan link logging
      const paymentResponseHeader = response.headers.get('x-payment-response') || response.headers.get('X-Payment-Response');

      const data = await response.json();
      console.log('[Agent] Response data:', data);

      const responseText = data.message || data.data?.message || '';

      // Log the paid chat as a purchase so user panel shows Basescan link immediately
      try {
        if (paymentResponseHeader && address) {
          await fetch('/api/purchases/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: 'r1x-agent-chat',
              serviceName: 'r1x Agent Chat',
              payer: address,
              feeReceipt: null,
              serviceReceipt: paymentResponseHeader,
              servicePrice: '0.25',
              type: 'internal',
            }),
          });
        }
      } catch (logErr) {
        console.warn('[Agent] Failed to log chat purchase (non-blocking):', (logErr as any)?.message || logErr);
      }
      
      // Check if agent wants to trigger a purchase
      const purchaseMatch = responseText.match(/\[PURCHASE:([^\]]+)\]/);
      if (purchaseMatch && x402Client) {
        const serviceId = purchaseMatch[1];
        console.log('[Agent] Purchase trigger detected for service:', serviceId);
        
        // Find the service in the catalog
        let allServices = marketplaceCatalog.getAllServices();
        let service = allServices.find(s => s.id === serviceId);
        
        // If not found, refresh catalog once and retry (handles first-load race)
        if (!service) {
          console.log('[Agent] Service not found in cache, refreshing catalog...');
          try {
            await marketplaceCatalog.fetchServices();
            allServices = marketplaceCatalog.getAllServices();
            service = allServices.find(s => s.id === serviceId);
          } catch (catalogError) {
            console.warn('[Agent] Catalog refresh failed:', (catalogError as any)?.message || catalogError);
          }
        }
        
        if (service && service.endpoint) {
          // Remove the purchase marker from the message
          const cleanMessage = responseText.replace(/\[PURCHASE:[^\]]+\]/, '').trim();
          
          // Preflight service to check for required parameters BEFORE purchasing
          console.log('[Agent] Preflighting service to check required parameters...');
          const schema = await preflightService(service.endpoint);
          
          if (schema?.outputSchema?.input) {
            const requestData = buildRequestFromSchema(schema, '');
            
            // If service requires specific parameters, ask Claude to explain them
            if (requestData.missing && requestData.missing.length > 0) {
              // Build schema description for Claude
              const schemaDesc: string[] = [];
              schemaDesc.push(`The service "${service.name}" requires these parameters:`);
              
              requestData.missing.forEach(key => {
                const hint = requestData.hints?.[key];
                const loc = requestData.fieldLocations?.[key] || 'body';
                const parts: string[] = [`- ${key} (${loc})`];
                if (hint?.description) parts.push(`  Description: ${hint.description}`);
                if (hint?.example) parts.push(`  Example: ${hint.example}`);
                if (hint?.options && hint.options.length > 0) {
                  parts.push(`  Options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
                }
                schemaDesc.push(parts.join('\n'));
              });
              
              // Ask Claude to explain what's needed
              const missingList = requestData.missing.map((k) => {
                const hint = requestData.hints?.[k];
                const loc = requestData.fieldLocations?.[k] || 'body';
                const parts: string[] = [`- ${k} (${loc})`];
                if (hint?.description) parts.push(`  Description: ${hint.description}`);
                if (hint?.example) parts.push(`  Example: ${hint.example}`);
                if (hint?.options && hint.options.length > 0) parts.push(`  Options: ${hint.options.slice(0, 10).join(', ')}${hint.options.length > 10 ? ', ...' : ''}`);
                return parts.join('\n');
              }).join('\n');

              setPendingPurchase({
                service,
                missing: requestData.missing,
                hints: requestData.hints || {},
                fieldLocations: requestData.fieldLocations || {},
                baseRequest: {
                  body: requestData.body,
                  queryParams: requestData.queryParams,
                  headers: requestData.headers,
                },
                isExternal: service.isExternal ?? false,
                fields: requestData.fields,
                method: requestData.method as any,
              });

              setMessages((prev) => ([
                ...prev,
                { role: 'assistant', content: `This service requires parameters:\n${missingList}`, status: 'sent' as const },
              ]));
              setIsLoading(false);
              return;
            }
          }
          
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: cleanMessage || 'Purchasing service...',
            status: 'sent',
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
            return [...updated, assistantMessage];
          });

          // Trigger the purchase (no required fields, or all provided)
          await handleAutopurchase(service);
          return;
        } else {
          console.warn('[Agent] Service not found or has no endpoint:', serviceId);
        }
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseText,
        status: 'sent',
      };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
        return [...updated, assistantMessage];
      });
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);
      
      const err = error as any;
      console.error('[Agent] Error:', err);
      console.error('[Agent] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      let errorMessage = err.message || 'An error occurred';
      
      // Handle timeout
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        errorMessage = 'Request timed out. This might be due to:\n1. Wallet connection issues (check Reown domain allowlist)\n2. Network issues\n3. Server not responding\n\nPlease try again or check the console for details.';
      } else if (err.message.includes('502') || err.message.includes('not responding') || err.message.includes('Express server')) {
        errorMessage = `Express server error (502):\n\nThe Express x402 server is not responding. Please check:\n\n1. Railway → Express Service → Status (should be "Active")\n2. Railway → Express Service → Logs (check for errors)\n3. Verify X402_SERVER_URL is correct in Railway Next.js service\n4. Test Express server: curl <EXPRESS_URL>/health\n\nIf the service is down, restart it in Railway.`;
      } else if (err.message.includes('402') || err.message.includes('Payment required')) {
        // Already handled above, but catch here to ensure proper formatting
        errorMessage = err.message;
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError' || err.message.includes('network')) {
        errorMessage = `Cannot connect to x402 server. Please check:\n1. Next.js API route is accessible (/api/r1x-agent/chat)\n2. X402_SERVER_URL is set in Railway (for server-side proxy)\n3. Express server is running and accessible\n4. Wallet is properly connected (check Reown domain allowlist)\n5. Check browser console and server logs for details\n\nOriginal error: ${err.message}`;
      } else if (err.message.includes('Runtime config')) {
        errorMessage = `Configuration error: ${err.message}\n\nPlease ensure X402_SERVER_URL is set in Railway environment variables.`;
      } else if (err.message.includes('Reown') || err.message.includes('allow list') || err.message.includes('APKT002')) {
        errorMessage = `Wallet connection issue:\n\nThe domain ${typeof window !== 'undefined' ? window.location.origin : 'your domain'} is not in the Reown allowlist.\n\nPlease add it at: https://dashboard.reown.com\n\nProject ID: ac7a5e22564f2698c80f05dbf4811d6a`;
      }

      setError(errorMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'error' };
        return updated;
      });
    } finally {
      setIsLoading(false);
      // Reset loading state even if there's an error
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.status === 'sending') {
          updated[updated.length - 1] = { ...lastMessage, status: 'sent' };
        }
        return updated;
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleReRunByServiceId = async (serviceId: string) => {
    if (!x402Client) {
      alert('Payment client not available. Please ensure your wallet is connected.');
      return;
    }

    // Find service in catalog
    const allServices = marketplaceCatalog.getAllServices();
    const service = allServices.find(s => s.id === serviceId);

    if (!service || !service.endpoint) {
      alert('Service not found or not available');
      return;
    }

    // Use existing handleAutopurchase
    await handleAutopurchase(service);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0A0A0A', overflowY: 'hidden' }}>
      <AgentBackground />
      <AgentHeader address={address} isConnected={isConnected} />
      <AgentLeftSidebar 
        address={address} 
        isConnected={isConnected}
        onReRun={handleReRunByServiceId}
      />

      <main className="flex-1 flex flex-col relative z-10 lg:ml-80 xl:ml-96">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            messagesEndRef={messagesEndRef}
          />

          {pendingPurchase && pendingPurchase.fields && pendingPurchase.fields.length > 0 && (
            <ParamWizard
              title={`Parameters for ${pendingPurchase.service.name}`}
              fields={pendingPurchase.fields}
              initialValues={(() => {
                const iv: Record<string, string> = {};
                if (address && pendingPurchase.fields?.some(f => f.name === 'buyerAddress')) {
                  iv['buyerAddress'] = address;
                }
                return iv;
              })()}
              onSubmit={(values) => completePendingPurchaseWithValues(values)}
              onCancel={() => setPendingPurchase(null)}
            />
          )}

          {messages.length === 1 && (
            <ChatSuggestions 
              suggestions={suggestions} 
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {error && (
            <ErrorBanner error={error} />
          )}

          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </main>

      <AgentFooter />
    </div>
  );
}
