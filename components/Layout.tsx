
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activePanel: 'schema' | 'history';
  setActivePanel: (panel: 'schema' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, activePanel, setActivePanel }) => {
  return (
    <div className="flex h-screen w-full bg-[#09090b] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Fixed Left */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#020617] h-full">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 bg-[#020617]">
          <div className="flex items-center gap-3 text-slate-100">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"/></svg>
             </div>
             <div className="flex flex-col">
               <span className="font-bold text-sm tracking-tight leading-none">SQLWise</span>
               <span className="text-[10px] text-slate-500 font-medium mt-1">v3.0.1 PRO</span>
             </div>
          </div>
        </div>

        {/* Panel Toggles */}
        <div className="px-4 py-4">
          <div className="bg-slate-900/50 p-1 rounded-lg flex border border-white/5">
            <button 
              onClick={() => setActivePanel('schema')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${activePanel === 'schema' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Schema
            </button>
            <button 
              onClick={() => setActivePanel('history')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${activePanel === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              History
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {sidebar}
        </div>
        
        {/* User / Footer area in sidebar */}
        <div className="p-4 border-t border-white/5 bg-[#020617]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 ring-2 ring-[#020617] group-hover:ring-indigo-500/50 transition-all"></div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-200 group-hover:text-white">Admin User</span>
               <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">workspace_01</span>
            </div>
            <svg className="w-4 h-4 text-slate-600 ml-auto group-hover:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#09090b]">
        {/* Header - Minimalist */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>
            <h1 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">Project /</span> 
              <span className="text-slate-200 font-semibold bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">Main Query</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              Docs
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">Settings</button>
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
