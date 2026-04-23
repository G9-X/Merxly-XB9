import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { type ReactNode } from 'react';

export function AiChatProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime({
    async run({ messages }) {
      // Mocking an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lastMessage = messages[messages.length - 1];
      let userText = '...';
      if (lastMessage?.content?.[0]?.type === 'text') {
        userText = lastMessage.content[0].text;
      }

      const reply = `Xin chào! Tôi là trợ lý AI (phiên bản thử nghiệm).\n\nBạn vừa hỏi: "${userText}"\n\nSau này khi tích hợp Knowledge Base của Bedrock, bạn có thể thay thế logic gọi API thực tế tại component \`AiChatProvider.tsx\`.`;

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
