
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Schema, Dialect, HistoryItem } from './types';
import { DEFAULT_SCHEMAS, SQL_DIALECTS } from './constants';
import { createSqlChat, sendChatMessage, ChatMessage } from './services/geminiService';
import Layout from './components/Layout';
import SchemaPanel from './components/SchemaPanel';
import SqlDisplay from './components/SqlDisplay';

const App: React.FC = () => {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(DEFAULT_SCHEMAS[0].id);
  const [dialect, setDialect] = useState<Dialect>(Dialect.POSTGRES);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activePanel, setActivePanel] = useState<'schema' | 'history'>('schema');
  
  const chatSessionRef = useRef<any>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSchema = useMemo(() => 
    DEFAULT_SCHEMAS.find(s => s.id === selectedSchemaId) || DEFAULT_SCHEMAS[0]
  , [selectedSchemaId]);

  useEffect(() => {
    chatSessionRef.current = createSqlChat(activeSchema, dialect);
    setMessages([]);
  }, [selectedSchemaId, dialect]);

  useEffect(() => {
    const saved = localStorage.getItem('sqlwise_history_v3');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sqlwise_history_v3', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || prompt.trim();
    if (!text || isLoading) return;

    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(chatSessionRef.current, text);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result.explanation,
        sql: result.sql,
        reasoning: result.reasoning,
        suggestions: result.suggestions
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (result.sql) {
        setHistory(prev => [{
          id: Date.now().toString(),
          prompt: text,
          sql: result.sql,
          timestamp: Date.now(),
          dialect,
          schemaId: selectedSchemaId,
          reasoning: result.reasoning
        }, ...prev].slice(0, 50));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const Sidebar = () => (
    <div className="px-4 py-6 space-y-8">
      <section className="space-y-3">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <span>Target Dialect</span>
            <span className="h-[1px] flex-1 bg-white/5"></span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SQL_DIALECTS.map(d => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center text-center ${
                dialect === d 
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300 shadow-sm' 
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-slate-200'
              }`}
            >
              {d === 'PostgreSQL' ? 'Postgres' : d}
            </button>
          ))}
        </div>
      </section>

      <SchemaPanel
        schemas={DEFAULT_SCHEMAS}
        selectedSchemaId={selectedSchemaId}
        onSelect={setSelectedSchemaId}
        onTableClick={(t) => setPrompt(p => p + (p ? ' ' : '') + t)}
      />
    </div>
  );

  const HistoryTimeline = () => (
    <div className="px-4 py-6 flex flex-col gap-3">
       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2 mb-2">
            <span>Recent Queries</span>
            <span className="h-[1px] flex-1 bg-white/5"></span>
        </h4>
      {history.length === 0 ? (
        <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3 text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-[11px] font-medium text-slate-500">No history yet</p>
        </div>
      ) : (
        history.map(item => (
          <div key={item.id} className="group p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer shadow-sm" onClick={() => handleSend(item.prompt)}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.dialect}</span>
              <span className="text-[9px] text-slate-600 font-medium">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-medium">{item.prompt}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout sidebar={activePanel === 'schema' ? <Sidebar /> : <HistoryTimeline />} activePanel={activePanel} setActivePanel={setActivePanel}>
      
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col min-h-full">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-24 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl shadow-indigo-500/10">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <h2 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">Data Architect AI</h2>
              <p className="text-slate-400 mb-12 max-w-md text-base leading-relaxed">
                Connect to <span className="text-indigo-400 font-semibold">{activeSchema.name}</span> and generate optimized SQL queries instantly.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                {[
                  `Find all users in 'New York'`,
                  `Calculate monthly revenue growth`,
                  `Identify experiments with high loss`,
                  `Join accounts with latest transactions`
                ].map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(s)}
                    className="p-5 rounded-2xl bg-[#0f1117] border border-white/5 hover:border-indigo-500/30 hover:bg-[#15171e] text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                    </div>
                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-10 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  {msg.role === 'user' ? (
                    <div className="max-w-[80%] bg-[#3730a3] text-white px-6 py-4 rounded-3xl rounded-tr-sm shadow-lg text-[15px] leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full pl-0 md:pl-4 border-l-2 border-indigo-500/20 md:border-transparent">
                      <div className="space-y-5">
                        {msg.reasoning && (
                          <div className="space-y-2 bg-[#0f1117] p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Reasoning Chain</div>
                            {msg.reasoning.map((step, i) => (
                              <div key={i} className="flex items-start gap-3 text-xs text-slate-400">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                <span className="leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-[15px] text-slate-200 leading-relaxed font-medium">{msg.content}</div>
                        
                        {msg.sql && (
                          <div className="mt-2">
                            <SqlDisplay sql={msg.sql} explanation="" onCopy={() => navigator.clipboard.writeText(msg.sql!)} />
                          </div>
                        )}

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.suggestions.map((s, i) => (
                              <button key={i} onClick={() => handleSend(s)} className="px-4 py-2 rounded-full border border-white/10 text-[11px] font-bold text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3 pl-4 py-4">
                   <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></div>
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></div>
                   </div>
                   <span className="text-xs font-semibold text-indigo-400 animate-pulse">Analyzing Schema...</span>
                </div>
              )}
              
              <div ref={scrollAnchorRef} className="h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="flex-shrink-0 w-full bg-[#09090b] border-t border-white/5 p-5 md:p-6 z-20">
        <div className="max-w-4xl mx-auto relative">
           <div className="bg-[#1e293b]/40 backdrop-blur-xl rounded-2xl flex items-end p-2 transition-all ring-1 ring-white/10 focus-within:ring-indigo-500/50 focus-within:bg-[#1e293b]/60 shadow-xl">
             <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question about your data..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-slate-200 placeholder:text-slate-500 px-4 py-3.5 resize-none max-h-32 font-medium"
                rows={1}
                style={{ minHeight: '52px' }}
             />
             <button
               onClick={() => handleSend()}
               disabled={isLoading || !prompt.trim()}
               className={`p-3 rounded-xl mb-0.5 mr-0.5 transition-all duration-200 ${
                 isLoading || !prompt.trim() 
                  ? 'text-slate-600 bg-transparent cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95'
               }`}
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-7-7l7 7-7 7"/></svg>
             </button>
           </div>
           <div className="text-center mt-3 text-[11px] text-slate-600 font-medium">
             AI-generated SQL may require validation.
           </div>
        </div>
      </div>

    </Layout>
  );
};

export default App;
