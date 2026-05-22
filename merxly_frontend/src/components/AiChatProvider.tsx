import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { type ReactNode } from 'react';
import apiClient from '../services/apiClient'; 

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
      const lastMessage = messages[messages.length - 1];
      const textContent = lastMessage?.content.find((c) => c.type === 'text');
      const question = textContent?.type === 'text' ? textContent.text : '';

      if (!question) {
        return { content: [{ type: 'text', text: 'Error: Empty message' }] };
      }

      const sessionId = getSessionId();

      try {
        // Change from direct fetch to backend endpoint
        const response = await apiClient.post('/AiChat/ask', {
          question: question,
          session_id: sessionId,
        });

        const reply = response.data?.data?.answer ?? response.data?.answer ?? 'Không có ph?n h?i t? AI.';

        return {
          content: [{ type: 'text', text: reply }],
        };
      } catch (error) {
        console.error('Error calling AI endpoint:', error);
        return {
          content: [{ type: 'text', text: 'X?y ra l?i khi giao ti?p v?i AI.' }],
        };
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
