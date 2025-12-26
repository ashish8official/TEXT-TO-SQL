
import React, { useState } from 'react';

interface SqlDisplayProps {
  sql: string;
  explanation: string;
  onCopy: () => void;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ sql, explanation, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightSql = (text: string) => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'AS', 'AND', 'OR', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'COUNT', 'SUM', 'AVG'];
    const parts = text.split(/(\s+|\W+)/);
    return parts.map((part, i) => {
      const upperPart = part.toUpperCase();
      if (keywords.includes(upperPart)) return <span key={i} className="text-[#a1c2fa] font-bold">{part}</span>;
      if (part.startsWith("'") || part.startsWith('"')) return <span key={i} className="text-[#81c995]">{part}</span>;
      if (!isNaN(Number(part))) return <span key={i} className="text-[#fdd663]">{part}</span>;
      return <span key={i} className="text-[#e3e3e3]">{part}</span>;
    });
  };

  return (
    <div className="w-full bg-[#1e1f20] rounded-[24px] border border-[#444746]/50 shadow-xl overflow-hidden transition-all hover:border-[#7cacf8]/40">
      <div className="px-6 py-3 bg-[#28292a] flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-[#8e918f] uppercase tracking-[0.2em]">Generated Output</span>
        </div>
        <button
          onClick={handleCopy}
          className={`text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 ${
            copied ? 'bg-[#34A853] text-white' : 'bg-[#444746] text-[#e3e3e3] hover:bg-[#5f6368]'
          }`}
        >
          {copied ? 'Copied to Clipboard' : 'Copy Script'}
        </button>
      </div>

      <div className="p-6 overflow-x-auto bg-[#131314] min-h-[100px]">
        <pre className="code-font text-sm leading-relaxed">
          <code className="block">
            {sql.split('\n').map((line, i) => (
              <div key={i} className="flex gap-6 group/line">
                <span className="w-6 text-[#444746] text-right select-none font-bold">{i + 1}</span>
                <span className="whitespace-pre">{highlightSql(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {explanation && (
        <div className="px-6 py-4 bg-[#1e1f20] border-t border-[#444746]/30 flex gap-3">
          <div className="mt-1 flex-shrink-0 text-[#7cacf8]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>
          </div>
          <p className="text-sm text-[#c4c7c5] leading-relaxed italic">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default SqlDisplay;
