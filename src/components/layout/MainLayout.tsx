import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-[#F3F4F6] text-gray-900 antialiased min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden selection:bg-gray-200">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-57px)] md:h-full overflow-hidden">
        {/* Main content */}
        <main className="flex-1 px-1.5 py-1.5 md:px-2 md:py-2 md:pr-3 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
