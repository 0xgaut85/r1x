import AgentBuilderContent from './AgentBuilderContent';

// Force dynamic rendering to avoid SSR issues with wagmi hooks
export const dynamic = 'force-dynamic';

export default function AgentBuilderPage() {
  return <AgentBuilderContent />;
}

