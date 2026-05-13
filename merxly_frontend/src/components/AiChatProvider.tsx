import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { type ReactNode } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;
console.log(API_GATEWAY_URL);

export function AiChatProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime({
    async run({ messages }) {
      const formattedMessages = messages.map((msg) => {
        const textContent = msg.content.find((c) => c.type === 'text');
        return {
          role: msg.role,
          content: textContent?.type === 'text' ? textContent.text : '',
        };
      });

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply ?? data.body ?? 'Không có phản hồi từ AI.';

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
