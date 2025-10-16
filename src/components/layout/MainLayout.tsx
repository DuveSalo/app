

import React, { useState } from 'react';
import Sidebar from './Sidebar';
// import GlobalSearch from '../common/GlobalSearch';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(prev => !prev)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* El encabezado ha sido eliminado según la solicitud del usuario */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-start justify-center">
            <div className="w-full max-w-7xl">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;