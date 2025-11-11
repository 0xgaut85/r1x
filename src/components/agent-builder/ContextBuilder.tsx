'use client';

import { motion } from 'framer-motion';

export default function ContextBuilder() {
  const exampleCode = `import { createContext } from '@r1x/agent-sdk';
import { z } from 'zod';

const UserContext = createContext({
  schema: z.object({
    userId: z.string(),
    preferences: z.object({
      language: z.string(),
      currency: z.string(),
    }),
  }),
  memory: {
    recentInteractions: [],
    preferences: {},
  },
  render: (ctx) => \`User: \${ctx.userId}\`,
});

// Use context in agent
const agent = createAgent({
  contexts: [UserContext],
  actions: [/* ... */],
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
          Context Builder
        </h2>
        <p 
          className="text-white/60 text-sm mb-6"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Define stateful contexts for your agents. Inspired by Dreams SDK's context composition patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Definition */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            SCHEMA DEFINITION
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                CONTEXT NAME
              </label>
              <input
                type="text"
                placeholder="UserContext"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                disabled
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                SCHEMA (ZOD)
              </label>
              <textarea
                placeholder="z.object({ userId: z.string() })"
                rows={6}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded font-mono text-sm"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Memory Structure */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            MEMORY STRUCTURE
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                MEMORY TYPE
              </label>
              <select
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                disabled
              >
                <option>Persistent</option>
                <option>Session</option>
                <option>Ephemeral</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                INITIAL STATE
              </label>
              <textarea
                placeholder='{ recentInteractions: [], preferences: {} }'
                rows={6}
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

      {/* Context Composition Visualization */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          CONTEXT COMPOSITION
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="px-4 py-2 bg-[#FF4D00]/20 border border-[#FF4D00]/50 rounded">
            <span className="text-[#FF4D00] text-sm font-mono">UserContext</span>
          </div>
          <span className="text-white/40">→</span>
          <div className="px-4 py-2 bg-[#00D4FF]/20 border border-[#00D4FF]/50 rounded">
            <span className="text-[#00D4FF] text-sm font-mono">PaymentContext</span>
          </div>
          <span className="text-white/40">→</span>
          <div className="px-4 py-2 bg-[#00FF88]/20 border border-[#00FF88]/50 rounded">
            <span className="text-[#00FF88] text-sm font-mono">AgentContext</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mt-4" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Contexts compose using context.use() pattern. Each context can access and modify shared state.
        </p>
      </div>
    </div>
  );
}

