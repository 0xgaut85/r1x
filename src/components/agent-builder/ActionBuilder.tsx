'use client';

import { motion } from 'framer-motion';

export default function ActionBuilder() {
  const exampleCode = `import { createAction } from '@r1x/agent-sdk';
import { z } from 'zod';

const ProcessPaymentAction = createAction({
  name: 'processPayment',
  schema: z.object({
    amount: z.number(),
    recipient: z.string(),
    serviceId: z.string(),
  }),
  handler: async (params, context) => {
    // Automatically handles x402 payment flow
    const result = await x402Client.pay({
      amount: params.amount,
      service: params.serviceId,
    });
    return { success: true, txHash: result.txHash };
  },
});`;

  return (
    <div className="space-y-6">
      <div>
        <h2 
          className="text-white text-2xl mb-2"
          style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
            fontWeight: 400,
            letterSpacing: '-1px',
          }}
        >
          Action Builder
        </h2>
        <p 
          className="text-white/60 text-sm mb-6"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Define agent actions with schemas and handlers. Actions can integrate with x402 services automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Definition */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            ACTION DEFINITION
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                ACTION NAME
              </label>
              <input
                type="text"
                placeholder="processPayment"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                disabled
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                INPUT SCHEMA (ZOD)
              </label>
              <textarea
                placeholder="z.object({ amount: z.number(), recipient: z.string() })"
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded font-mono text-sm"
                disabled
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                OUTPUT SCHEMA (ZOD)
              </label>
              <textarea
                placeholder="z.object({ success: z.boolean(), txHash: z.string() })"
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded font-mono text-sm"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Handler Preview */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            HANDLER PREVIEW
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                HANDLER TYPE
              </label>
              <select
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                disabled
              >
                <option>JavaScript/TypeScript</option>
                <option>Python</option>
                <option>HTTP Endpoint</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                HANDLER CODE
              </label>
              <textarea
                placeholder="async (params, context) => { /* ... */ }"
                rows={8}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded font-mono text-sm"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-black/60 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          EXAMPLE CODE
        </h3>
        <pre className="text-white/80 text-xs font-mono overflow-x-auto">
          <code>{exampleCode}</code>
        </pre>
      </div>

      {/* x402 Integration Badge */}
      <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/30 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse" />
          <p className="text-white/80 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
            <strong className="text-[#FF4D00]">x402 Integration:</strong> Actions can automatically handle payment flows. 
            When an action requires payment, the agent will generate quotes, request approval, and retry with payment proof.
          </p>
        </div>
      </div>
    </div>
  );
}

