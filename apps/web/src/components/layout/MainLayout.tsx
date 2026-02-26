import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { TrialBanner } from '../common/TrialBanner';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-neutral-50 text-neutral-900 antialiased h-screen w-full flex flex-col md:flex-row overflow-hidden selection:bg-brand-100">
      <MobileNav />
      <Sidebar />
      <div className="flex-1 flex flex-col h-[calc(100vh-57px)] md:h-full min-w-0 overflow-hidden">
        <TrialBanner />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
