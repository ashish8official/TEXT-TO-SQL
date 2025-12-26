
import React from 'react';
import { Schema } from '../types';

interface SchemaPanelProps {
  schemas: Schema[];
  selectedSchemaId: string;
  onSelect: (id: string) => void;
  onTableClick?: (tableName: string) => void;
}

const SchemaPanel: React.FC<SchemaPanelProps> = ({ schemas, selectedSchemaId, onSelect, onTableClick }) => {
  const activeSchema = schemas.find(s => s.id === selectedSchemaId);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
           <span>Project Space</span>
           <span className="h-[1px] flex-1 bg-white/5"></span>
        </h3>
        <div className="flex flex-col gap-1">
          {schemas.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs group flex items-center gap-3 border ${
                selectedSchemaId === s.id
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedSchemaId === s.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-700 group-hover:bg-slate-500'}`}></div>
              <span className="font-semibold truncate">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
           <span>Tables</span>
           <span className="h-[1px] flex-1 bg-white/5"></span>
        </h3>
        <div className="flex flex-col gap-3">
          {activeSchema?.tables.map((table) => (
            <div key={table.name} className="bg-[#0b0e14] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all shadow-sm">
              <button 
                onClick={() => onTableClick?.(table.name)}
                className="w-full text-left px-3 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{table.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2.5}/></svg>
                </div>
              </button>
              
              <div className="px-3 pb-3 pt-1 border-t border-white/[0.02]">
                <div className="space-y-1 mt-2">
                    {table.columns.slice(0, 3).map((col) => (
                    <div key={col.name} className="flex items-center justify-between text-[10px] pl-7 pr-1 py-0.5">
                        <span className="text-slate-500 font-medium truncate max-w-[80px]">{col.name}</span>
                        <span className="text-[9px] font-mono text-slate-600">{col.type.split('(')[0]}</span>
                    </div>
                    ))}
                    {table.columns.length > 3 && (
                        <div className="pl-7 pt-1 text-[9px] text-slate-600 italic">
                            + {table.columns.length - 3} more columns
                        </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemaPanel;
