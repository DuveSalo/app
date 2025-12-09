import React from 'react';
import Sidebar from './Sidebar';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-[#F3F4F6] text-gray-900 antialiased h-screen flex overflow-hidden selection:bg-gray-200">
      <Sidebar />
      <main className="flex-1 p-2 md:p-3 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
