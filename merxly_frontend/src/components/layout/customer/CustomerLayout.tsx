import { Outlet } from 'react-router-dom';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { HomeHeader, HomeFooter } from '../home';
import { AssistantModal } from '@/components/assistant-modal';
import { useEphemeralRuntime } from '@/hooks/useAssistantRuntime';
import { useAuth } from '@/contexts/AuthContext';

const AuthenticatedAssistant = () => {
  const runtime = useEphemeralRuntime();
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal />
    </AssistantRuntimeProvider>
  );
};

export const CustomerLayout = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className='min-h-screen bg-neutral-50'>
      <HomeHeader />
      <main className='pt-16 md:pt-32'>
        <Outlet />
      </main>
      <HomeFooter />
      {isAuthenticated && <AuthenticatedAssistant />}
    </div>
  );
};
