import { Outlet } from 'react-router-dom';
import { HomeHeader, HomeFooter } from '../home';
import { AiChatProvider } from '../../AiChatProvider';
import { AssistantModal } from '../../assistant-modal';
import { TooltipProvider } from '../../ui/tooltip';

export const CustomerLayout = () => {
  return (
    <TooltipProvider>
      <AiChatProvider>
        <div className='min-h-screen bg-neutral-50'>
          <HomeHeader />

          <main className='pt-16 md:pt-32'>
            <Outlet />
          </main>

          <HomeFooter />
          <AssistantModal />
        </div>
      </AiChatProvider>
    </TooltipProvider>
  );
};
