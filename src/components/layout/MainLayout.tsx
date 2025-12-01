

import React, { useState } from 'react';
import Sidebar from './Sidebar';
// import GlobalSearch from '../common/GlobalSearch';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(prev => !prev)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        {/* El encabezado ha sido eliminado según la solicitud del usuario */}
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;