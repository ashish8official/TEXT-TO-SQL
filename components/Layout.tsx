
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activePanel: 'schema' | 'history';
  setActivePanel: (panel: 'schema' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, activePanel, setActivePanel }) => {
  return (
    <div className="flex h-screen w-full bg-[#09090b] text-slate-300">
      {/* Sidebar - Fixed Left */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-white/10 bg-[#020617] h-full">
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-slate-100">
             <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"/></svg>
             </div>
             <span className="font-bold text-sm tracking-tight">SQLWise</span>
          </div>
        </div>

        {/* Panel Toggles */}
        <div className="p-3">
          <div className="bg-white/5 p-1 rounded-lg flex">
            <button 
              onClick={() => setActivePanel('schema')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePanel === 'schema' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Schema
            </button>
            <button 
              onClick={() => setActivePanel('history')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePanel === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              History
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {sidebar}
        </div>
        
        {/* User / Footer area in sidebar */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-200">User Account</span>
               <span className="text-[10px] text-slate-500">Pro Plan Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#09090b]">
        {/* Header - Minimalist */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-slate-400">Untitled Project / <span className="text-slate-200">Query 1</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Documentation</button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">Settings</button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
