import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { TrialBanner } from '../common/TrialBanner';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-gray-100 text-gray-900 antialiased min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden selection:bg-gray-200">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-57px)] md:h-full overflow-hidden">
        <TrialBanner />
        {/* Main content */}
        <main className="flex-1 px-1.5 py-1.5 md:px-2 md:py-2 md:pr-3 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
