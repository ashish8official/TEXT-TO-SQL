
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
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Space</label>
        <div className="flex flex-col gap-1">
          {schemas.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl transition-all text-xs font-bold border ${
                selectedSchemaId === s.id
                  ? 'bg-white/5 border-white/10 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Data Objects</label>
        <div className="flex flex-col gap-2.5">
          {activeSchema?.tables.map((table) => (
            <div key={table.name} className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
              <button 
                onClick={() => onTableClick?.(table.name)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-bold text-slate-300">{table.name}</span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} /></svg>
              </button>
              
              <div className="px-4 pb-3 space-y-2 pt-1 border-t border-white/5">
                {table.columns.map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-[10px] px-1">
                    <div className="flex items-center gap-2">
                       <span className={`w-1 h-1 rounded-full ${col.description?.toLowerCase().includes('primary') ? 'bg-amber-400' : 'bg-slate-700'}`}></span>
                       <span className="text-slate-400 font-medium">{col.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 uppercase">
                      {col.type.split('(')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemaPanel;
