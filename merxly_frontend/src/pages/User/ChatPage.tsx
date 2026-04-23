import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@/components/thread';
import { usePersistentRuntime } from '@/hooks/useAssistantRuntime';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052/api')
  .replace(/([^:]\/)\/+/g, '$1').replace(/\/+$/, '');

function authHeaders() {
  const auth = localStorage.getItem('auth');
  const token = auth ? (JSON.parse(auth) as { accessToken: string }).accessToken : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

interface ThreadMeta { id: string; title: string; updatedAt: string | null; createdAt: string; }
interface StoredMessage { role: string; content: string; }

const ChatView = ({
  threadId,
  initialMessages,
  onMessageSaved,
}: {
  threadId: string;
  initialMessages: StoredMessage[];
  onMessageSaved: () => void;
}) => {
  const onFinish = useCallback(async (userText: string, assistantText: string) => {
    await fetch(`${BASE}/chat/threads/${threadId}/messages`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ role: 'user', content: userText }),
    });
    await fetch(`${BASE}/chat/threads/${threadId}/messages`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ role: 'assistant', content: assistantText }),
    });
    onMessageSaved();
  }, [threadId, onMessageSaved]);

  // Convert stored messages to @assistant-ui ThreadMessageLike format
  const aui_initialMessages = useMemo(() =>
    initialMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: [{ type: 'text' as const, text: m.content }],
    })),
  [initialMessages]);

  const runtime = usePersistentRuntime(onFinish, aui_initialMessages);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
};

export const ChatPage = () => {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<StoredMessage[]>([]);
  const mountKey = useRef(0);
  const [, forceUpdate] = useState(0);

  const loadThreads = useCallback(async () => {
    const res = await fetch(`${BASE}/chat/threads`, { headers: authHeaders() });
    if (res.ok) setThreads(await res.json());
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const selectThread = useCallback(async (id: string) => {
    const res = await fetch(`${BASE}/chat/threads/${id}`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    setActiveMessages(data.messages ?? []);
    setActiveId(id);
    mountKey.current += 1;
    forceUpdate((n) => n + 1);
  }, []);

  const newThread = async () => {
    const res = await fetch(`${BASE}/chat/threads`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ title: 'New Chat' }),
    });
    if (!res.ok) return;
    const t: ThreadMeta = await res.json();
    setThreads((prev) => [t, ...prev]);
    setActiveMessages([]);
    setActiveId(t.id);
    mountKey.current += 1;
    forceUpdate((n) => n + 1);
  };

  const deleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE}/chat/threads/${id}`, { method: 'DELETE', headers: authHeaders() });
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setActiveMessages([]);
      mountKey.current += 1;
      forceUpdate((n) => n + 1);
    }
  };

  const onMessageSaved = useCallback(() => { loadThreads(); }, [loadThreads]);

  return (
    <div className='flex h-[calc(100vh-8rem)]'>
      <aside className='w-64 flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col'>
        <div className='p-3 border-b border-neutral-200'>
          <Button variant='outline' size='sm' className='w-full gap-2' onClick={newThread}>
            <PlusIcon className='h-4 w-4' /> New Chat
          </Button>
        </div>
        <nav className='flex-1 overflow-y-auto p-2 space-y-1'>
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => selectThread(t.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-colors',
                activeId === t.id ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <span className='truncate flex-1'>{t.title}</span>
              <Trash2Icon
                className='h-3.5 w-3.5 flex-shrink-0 ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-error-500'
                onClick={(e) => deleteThread(t.id, e)}
              />
            </button>
          ))}
          {threads.length === 0 && (
            <p className='text-xs text-neutral-400 text-center pt-4'>No conversations yet</p>
          )}
        </nav>
      </aside>

      <div className='flex-1 min-w-0'>
        {activeId ? (
          <ChatView
            key={`${activeId}-${mountKey.current}`}
            threadId={activeId}
            initialMessages={activeMessages}
            onMessageSaved={onMessageSaved}
          />
        ) : (
          <div className='flex h-full items-center justify-center text-neutral-400 text-sm'>
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
};
