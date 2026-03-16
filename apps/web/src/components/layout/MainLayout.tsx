import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { TrialBanner } from '../common/TrialBanner';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-background text-foreground antialiased h-screen w-full flex flex-col md:flex-row overflow-hidden selection:bg-muted-foreground/20">
      <MobileNav />
      <Sidebar />
      <div className="flex-1 flex flex-col h-[calc(100dvh-52px)] md:h-dvh min-w-0 overflow-hidden">
        <TrialBanner />
        <main className="flex-1 overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
