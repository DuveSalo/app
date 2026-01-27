import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import NotificationBell from '../common/NotificationBell';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-[#F3F4F6] text-gray-900 antialiased min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden selection:bg-gray-200">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-57px)] md:h-full overflow-hidden">
        {/* Top bar with notifications - hidden on mobile (notifications in MobileNav) */}
        <div className="hidden md:flex items-center justify-end px-4 py-2 flex-shrink-0">
          <NotificationBell />
        </div>
        {/* Main content */}
        <main className="flex-1 px-2 pb-2 md:px-3 md:pb-3 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
