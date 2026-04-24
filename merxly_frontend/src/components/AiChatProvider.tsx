import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { type ReactNode } from 'react';

const CHAT_API_URL = 'https://nq12s8smy1.execute-api.us-west-2.amazonaws.com/prod/chat';

export function AiChatProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime({
    async run({ messages }) {
      const lastMessage = messages[messages.length - 1];
      let userText = '';
      if (lastMessage?.content?.[0]?.type === 'text') {
        userText = lastMessage.content[0].text;
      }

      try {
        const res = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${res.status}`);
        }

        const data = await res.json();

        let replyText = data.answer || 'Không có câu trả lời.';

        // Append sources if available
        if (data.sources?.length > 0) {
          replyText += '\n\n---\n📚 **Nguồn tham khảo:**\n';
          data.sources.forEach((src: { snippet: string; uri: string }, i: number) => {
            replyText += `${i + 1}. ${src.snippet}...\n`;
          });
        }

        return {
          content: [{ type: 'text' as const, text: replyText }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text' as const, text: `❌ Lỗi kết nối AI: ${message}` }],
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

