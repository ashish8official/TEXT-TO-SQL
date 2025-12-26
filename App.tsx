
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
      inputRef.current?.focus();
    }
  };

  const Sidebar = () => (
    <div className="p-5 space-y-8">
      <section className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Engine Dialect</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {SQL_DIALECTS.map(d => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                dialect === d ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' : 'border-white/5 text-slate-500 hover:bg-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <div className="h-[1px] bg-white/5"></div>

      <SchemaPanel
        schemas={DEFAULT_SCHEMAS}
        selectedSchemaId={selectedSchemaId}
        onSelect={setSelectedSchemaId}
        onTableClick={(t) => setPrompt(p => p + (p ? ' ' : '') + t)}
      />
    </div>
  );

  const HistoryTimeline = () => (
    <div className="p-4 flex flex-col gap-2.5">
      {history.length === 0 ? (
        <div className="text-center py-20 opacity-20 text-[10px] font-black uppercase tracking-widest">No Recent Logs</div>
      ) : (
        history.map(item => (
          <div key={item.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer" onClick={() => handleSend(item.prompt)}>
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.dialect}</span>
              <span className="text-[8px] text-slate-600 font-bold">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-bold line-clamp-2 leading-relaxed">{item.prompt}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout sidebar={<Sidebar />} history={<HistoryTimeline />} activePanel={activePanel} setActivePanel={setActivePanel}>
      <div className="flex flex-col h-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
                  Neural Query <br/> 
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Architect.</span>
                </h1>
                <p className="text-slate-500 text-sm md:text-base max-w-lg font-medium leading-relaxed mb-10">
                  Ask questions in plain English. The AI maps your intent to optimized {dialect} structures instantly.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl opacity-80">
                  {[
                    `Analyze ML metrics`,
                    `Identify faulty sensors`,
                    `Sum NeoBank balances`,
                    `Join experiments with runs`
                  ].map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(s)} 
                      className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-24">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                    {msg.role === 'user' ? (
                      <div className="px-6 py-3.5 rounded-3xl rounded-tr-none bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 font-bold text-sm max-w-[85%]">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full space-y-6">
                        <div className="flex flex-col gap-6 w-full">
                          {msg.reasoning && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
                              {msg.reasoning.map((step, i) => (
                                <div key={i} className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                                  {step}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-base text-slate-300 font-medium leading-relaxed max-w-3xl">{msg.content}</p>
                          
                          {msg.sql && (
                            <div className="animate-in zoom-in-95 duration-500 w-full">
                              <SqlDisplay sql={msg.sql} explanation="" onCopy={() => navigator.clipboard.writeText(msg.sql!)} />
                            </div>
                          )}

                          {msg.suggestions && (
                            <div className="flex flex-wrap gap-2 pt-2">
                               {msg.suggestions.map((s, i) => (
                                  <button key={i} onClick={() => handleSend(s)} className="px-3 py-1.5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 hover:border-indigo-400 transition-all">
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
                  <div className="flex flex-col gap-4 animate-pulse max-w-md">
                     <div className="h-4 w-1/2 bg-white/5 rounded-full"></div>
                     <div className="h-24 w-full bg-white/5 rounded-3xl"></div>
                  </div>
                )}
                <div ref={scrollAnchorRef} className="h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Neural Input Station - Integrated */}
        <div className="px-6 md:px-12 py-6 border-t border-white/5 bg-[#020617]">
           <div className="max-w-3xl mx-auto">
              <div className="relative glass-panel rounded-3xl p-2 flex items-end gap-2 shadow-2xl focus-within:border-indigo-500/40 transition-all">
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
                  placeholder={`Describe query for ${activeSchema.name}...`}
                  className="flex-1 bg-transparent py-4 pl-5 text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none text-base font-bold leading-relaxed"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '160px' }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !prompt.trim()}
                  className={`mb-1 mr-1 p-4 rounded-2xl transition-all ${
                    isLoading || !prompt.trim()
                      ? 'bg-slate-800 text-slate-600'
                      : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 12h14"/></svg>
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-600">
                <span>Enter to Send</span>
                <span className="opacity-30">•</span>
                <span>Shift+Enter for new line</span>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
