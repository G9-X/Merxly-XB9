import { useMemo, useRef } from 'react';
import { useLocalRuntime, type ChatModelAdapter } from '@assistant-ui/react';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052/api';
const BASE = RAW_BASE.replace(/([^:]\/)\/+/g, '$1').replace(/\/+$/, '');
const CHAT_URL = `${BASE}/chat`;

function getToken(): string {
  const auth = localStorage.getItem('auth');
  return auth ? (JSON.parse(auth) as { accessToken: string }).accessToken : '';
}

async function* streamChat(
  messages: { role: string; content: string }[],
  abortSignal: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ messages }),
    signal: abortSignal,
  });
  if (!response.ok) throw new Error(`Chat error: ${response.statusText}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const delta = (JSON.parse(line.slice(6)) as { content: string }).content;
        if (delta) yield delta;
      } catch { /* skip malformed */ }
    }
  }
}

function toPlainMessages(messages: Parameters<ChatModelAdapter['run']>[0]['messages']) {
  return messages.map((m) => ({
    role: m.role,
    content: m.content
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join(''),
  }));
}

/** Ephemeral — for AssistantModal. Stable adapter, no persistence. */
export function useEphemeralRuntime() {
  const adapter = useMemo<ChatModelAdapter>(() => ({
    async *run({ messages, abortSignal }) {
      let text = '';
      for await (const delta of streamChat(toPlainMessages(messages), abortSignal)) {
        text += delta;
        yield { content: [{ type: 'text', text }] };
      }
    },
  }), []);
  return useLocalRuntime(adapter);
}

/** Persistent — for /user-account/chat. onFinish ref ensures latest callback without recreating adapter. */
export function usePersistentRuntime(
  onFinish: (userText: string, assistantText: string) => void,
  initialMessages?: { role: 'user' | 'assistant'; content: { type: 'text'; text: string }[] }[],
) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const adapter = useMemo<ChatModelAdapter>(() => ({
    async *run({ messages, abortSignal }) {
      const plain = toPlainMessages(messages);
      const lastUser = [...plain].reverse().find((m) => m.role === 'user');
      const userText = lastUser?.content ?? '';

      let text = '';
      for await (const delta of streamChat(plain, abortSignal)) {
        text += delta;
        yield { content: [{ type: 'text', text }] };
      }

      onFinishRef.current(userText, text);
    },
  }), []); // stable — onFinish accessed via ref

  return useLocalRuntime(adapter, { initialMessages });
}
