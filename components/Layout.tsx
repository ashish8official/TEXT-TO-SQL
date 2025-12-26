
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  history: React.ReactNode;
  activePanel: 'schema' | 'history';
  setActivePanel: (panel: 'schema' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, history, activePanel, setActivePanel }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden p-3 gap-3 bg-[#020617]">
      {/* Retractable Sidebar */}
      <aside className="w-72 flex flex-col gap-3 h-full">
        {/* Toggle Bar */}
        <div className="glass-panel rounded-2xl p-1.5 flex gap-1">
          <button 
            onClick={() => setActivePanel('schema')}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activePanel === 'schema' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Schema
          </button>
          <button 
            onClick={() => setActivePanel('history')}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activePanel === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            History
          </button>
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-0">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              {activePanel === 'schema' ? 'Database Context' : 'Recent Queries'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activePanel === 'schema' ? sidebar : history}
          </div>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col h-full relative">
        <header className="h-14 flex items-center justify-between px-8 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </div>
             <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">SQL Studio v3.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[8px] font-black">
                  U{i}
                </div>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">Share</button>
          </div>
        </header>

        <div className="flex-1 relative flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
