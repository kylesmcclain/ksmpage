
import React from 'react';
import { LayoutDashboard, Network, TerminalSquare, ShieldAlert, FolderGit2, Share2, User } from 'lucide-react';
import { ViewState } from '../types';
import { playRetroSound } from '../utils/soundEffects';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const handleNavClick = (view: ViewState) => {
    playRetroSound('click');
    setView(view);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => handleNavClick(view)}
      onMouseEnter={() => playRetroSound('hover')}
      className={`
        w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-lg font-display uppercase tracking-wider text-lg border-2 border-black shadow-hard transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        ${currentView === view
          ? 'bg-y2k-orange text-white'
          : 'bg-white text-black hover:bg-y2k-yellow'}
      `}
    >
      <Icon size={24} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#94a3b8] p-2 md:p-6 font-sans selection:bg-y2k-lime selection:text-black">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto bg-white border-4 border-black shadow-hard-lg min-h-[90vh] flex flex-col">
        
        {/* Header - Nick Style */}
        <header className="bg-black p-2">
           <div className="bg-gradient-to-r from-y2k-green to-y2k-lime border-2 border-black p-4 flex flex-col md:flex-row justify-between items-center shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                 <div className="bg-y2k-orange text-white font-display text-4xl px-4 py-1 border-2 border-black shadow-hard -rotate-2 transform hover:rotate-2 transition-transform cursor-default select-none"
                      onMouseEnter={() => playRetroSound('hover')}>
                    KYLE.COM
                 </div>
                 <div className="hidden md:block h-12 w-0.5 bg-black/20"></div>
                 <div className="text-black font-mono font-bold text-sm leading-tight hidden md:block">
                    SYSTEMS_ADMINISTRATOR<br/>
                    DEVOPS_ENGINEER v2.0
                 </div>
              </div>
              
              <div className="flex gap-2">
                 <div className="bg-white border-2 border-black px-3 py-1 font-bold text-xs shadow-hard-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    SERVER: ONLINE
                 </div>
                 <div className="bg-white border-2 border-black px-3 py-1 font-bold text-xs shadow-hard-sm">
                    UPTIME: 99.9%
                 </div>
              </div>
           </div>
        </header>

        {/* Layout Body */}
        <div className="flex-1 flex flex-col md:flex-row bg-y2k-bg">
          
          {/* Left Sidebar - "Cool Links" Style */}
          <aside className="w-full md:w-64 bg-[#cbd5e1] p-4 border-b-4 md:border-b-0 md:border-r-4 border-black">
            
            {/* User Profile Widget */}
            <div className="bg-white border-2 border-black p-4 mb-6 shadow-hard text-center">
              <div className="w-16 h-16 mx-auto bg-y2k-blue rounded-full border-2 border-black mb-2 flex items-center justify-center text-white">
                <User size={32} strokeWidth={3} />
              </div>
              <h3 className="font-display text-xl leading-none mb-1">GUEST_USER</h3>
              <p className="text-xs font-bold text-gray-500">ACCESS LEVEL: READ_ONLY</p>
            </div>

            <nav>
              <div className="text-xs font-black text-gray-500 mb-2 px-1">NAVIGATION</div>
              <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="HOME" />
              <NavItem view={ViewState.PROJECTS} icon={FolderGit2} label="PROJECTS" />
              <NavItem view={ViewState.NETWORK} icon={Network} label="SKILLS" />
              <NavItem view={ViewState.ARCHITECTURE} icon={Share2} label="NETWORK" />
              <NavItem view={ViewState.SECURITY} icon={ShieldAlert} label="SECURITY" />
              <NavItem view={ViewState.TERMINAL} icon={TerminalSquare} label="TERMINAL" />
            </nav>

            {/* Daily Poll / Ad Space filler */}
            <div className="mt-8 bg-y2k-yellow border-2 border-black p-4 shadow-hard hidden md:block transform rotate-1 hover:rotate-0 transition-transform cursor-help"
                 onMouseEnter={() => playRetroSound('hover')}>
               <h4 className="font-display text-lg leading-none mb-2">DID YOU KNOW?</h4>
               <p className="text-xs font-bold">Kyle has managed over 200+ cloud nodes across GCP & Azure!</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             {children}
          </main>

        </div>

        {/* Footer */}
        <footer className="bg-black text-white p-4 text-center font-mono text-xs">
           COPYRIGHT © 2004-2025 KYLE MCCLAIN SYSTEMS. ALL RIGHTS RESERVED. BUILT WITH REACT & TAILWIND.
        </footer>
      </div>
    </div>
  );
};
