import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { type ReactNode } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

// Generate or retrieve session ID for Bedrock Agent memory
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('geekbrain_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('geekbrain_session_id', sessionId);
  }
  return sessionId;
};

export function AiChatProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime({
    async run({ messages }) {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const textContent = lastMessage?.content.find((c) => c.type === 'text');
      const question = textContent?.type === 'text' ? textContent.text : '';

      if (!question) {
        return { content: [{ type: 'text', text: 'Error: Empty message' }] };
      }

      const sessionId = getSessionId();

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: question,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Bedrock Agent response format has an 'answer' field
      const reply = data.answer ?? 'Không có phản hồi từ AI.';

      return {
        content: [{ type: 'text', text: reply }],
      };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

