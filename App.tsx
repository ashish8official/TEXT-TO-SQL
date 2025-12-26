
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
      // Keep focus on input after send
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const Sidebar = () => (
    <div className="px-3 py-4 space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dialect</h4>
          <span className="text-[10px] text-indigo-400 font-bold">{dialect}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SQL_DIALECTS.map(d => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all border ${
                dialect === d 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              {d === 'PostgreSQL' ? 'Postgres' : d}
            </button>
          ))}
        </div>
      </section>

      <div className="h-[1px] bg-white/5 mx-1"></div>

      <SchemaPanel
        schemas={DEFAULT_SCHEMAS}
        selectedSchemaId={selectedSchemaId}
        onSelect={setSelectedSchemaId}
        onTableClick={(t) => setPrompt(p => p + (p ? ' ' : '') + t)}
      />
    </div>
  );

  const HistoryTimeline = () => (
    <div className="px-2 py-4 flex flex-col gap-2">
      {history.length === 0 ? (
        <div className="text-center py-10 opacity-30 text-[10px] font-bold uppercase tracking-widest">No History</div>
      ) : (
        history.map(item => (
          <div key={item.id} className="group p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => handleSend(item.prompt)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase">{item.dialect}</span>
              <span className="text-[9px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.prompt}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout sidebar={activePanel === 'schema' ? <Sidebar /> : <HistoryTimeline />} activePanel={activePanel} setActivePanel={setActivePanel}>
      
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-full">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-100 mb-3">How can I help you query?</h2>
              <p className="text-slate-500 mb-10 max-w-md">
                I'm your AI Data Architect. Select a schema from the sidebar and ask me anything about your data.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  `Show me all users from USA`,
                  `Count orders by status for last month`,
                  `Find experiments with accuracy > 0.9`,
                  `Calculate average transaction amount`
                ].map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(s)}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05] text-left transition-all group"
                  >
                    <span className="text-xs text-slate-300 font-medium group-hover:text-white">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full pl-2 border-l-2 border-indigo-500/30">
                      <div className="pl-4 space-y-4">
                        {msg.reasoning && (
                          <div className="space-y-1">
                            {msg.reasoning.map((step, i) => (
                              <div key={i} className="flex items-start gap-2 text-[10px] text-slate-500">
                                <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-600"></span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-300 leading-relaxed">{msg.content}</p>
                        
                        {msg.sql && (
                          <div className="mt-3">
                            <SqlDisplay sql={msg.sql} explanation="" onCopy={() => navigator.clipboard.writeText(msg.sql!)} />
                          </div>
                        )}

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.suggestions.map((s, i) => (
                              <button key={i} onClick={() => handleSend(s)} className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 hover:text-indigo-400 hover:border-indigo-400 transition-colors">
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
                <div className="flex items-center gap-2 pl-6 text-slate-500 text-xs">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></div>
                   <span className="ml-2 font-medium">Generating SQL...</span>
                </div>
              )}
              
              <div ref={scrollAnchorRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="flex-shrink-0 w-full bg-[#09090b] border-t border-white/5 p-4 md:p-6 z-20">
        <div className="max-w-3xl mx-auto relative">
           <div className="glass-input rounded-xl flex items-end p-2 transition-all ring-1 ring-white/10 focus-within:ring-indigo-500/50">
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
                placeholder="Describe your data question..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-600 px-3 py-3 resize-none max-h-32"
                rows={1}
                style={{ minHeight: '44px' }}
             />
             <button
               onClick={() => handleSend()}
               disabled={isLoading || !prompt.trim()}
               className={`p-2.5 rounded-lg mb-0.5 mr-0.5 transition-all ${
                 isLoading || !prompt.trim() 
                  ? 'text-slate-600 bg-transparent' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
               }`}
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-7-7l7 7-7 7"/></svg>
             </button>
           </div>
           <div className="text-center mt-3 text-[10px] text-slate-600 font-medium">
             SQLWise AI can make mistakes. Review generated code.
           </div>
        </div>
      </div>

    </Layout>
  );
};

export default App;
