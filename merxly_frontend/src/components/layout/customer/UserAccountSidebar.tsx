import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/user-account/dashboard', icon: Squares2X2Icon },
  {
    name: 'Order History',
    path: '/user-account/order-history',
    icon: ClipboardDocumentListIcon,
  },
  { name: 'Addresses', path: '/user-account/addresses', icon: MapPinIcon },
  {
    name: 'Payment Methods',
    path: '/user-account/payment-methods',
    icon: CreditCardIcon,
  },
  {
    name: 'Your Profile',
    path: '/user-account/profile',
    icon: UserCircleIcon,
  },
  {
    name: 'AI Assistant',
    path: '/user-account/chat',
    icon: ChatBubbleOvalLeftIcon,
  },
];

interface UserAccountSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const UserAccountSidebar = ({
  isMobileOpen = false,
  onCloseMobile,
}: UserAccountSidebarProps) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleMobileNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden md:block w-64 bg-white border-r border-neutral-200'>
        <div className='sticky top-36 flex flex-col max-h-[calc(100vh-7rem)] md:max-h-[calc(100vh-8rem)]'>
          <nav className='flex-1 px-4 py-6 space-y-1'>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/user-account/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <item.icon className='h-5 w-5 mr-3' />
                {item.name}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className='flex items-center w-full px-4 py-3 text-sm font-medium text-error-600 hover:bg-neutral-100 hover:text-error-700 rounded-lg transition-colors cursor-pointer'
            >
              <ArrowRightStartOnRectangleIcon className='h-5 w-5 mr-3' />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Modal Backdrop */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 bg-opacity-50 z-40 md:hidden'
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Modal Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-neutral-200 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Header with Close Button */}
          <div className='flex items-center justify-between px-4 py-4 border-b border-neutral-200'>
            <h2 className='text-lg font-semibold text-neutral-900'>Menu</h2>
            <button
              onClick={onCloseMobile}
              className='p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className='flex-1 px-4 py-6 space-y-1 overflow-y-auto'>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/user-account/dashboard'}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <item.icon className='h-5 w-5 mr-3' />
                {item.name}
              </NavLink>
            ))}

            <button
              onClick={() => {
                handleLogout();
                handleMobileNavClick();
              }}
              className='flex items-center w-full px-4 py-3 text-sm font-medium text-error-600 hover:bg-neutral-100 hover:text-error-700 rounded-lg transition-colors cursor-pointer'
            >
              <ArrowRightStartOnRectangleIcon className='h-5 w-5 mr-3' />
              Logout
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};
