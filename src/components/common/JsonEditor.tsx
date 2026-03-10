import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Copy } from "lucide-react";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

export const JsonEditor = ({ value, onChange, label }: JsonEditorProps) => {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-zinc-900 uppercase tracking-widest">{label}</label>
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Invalid JSON</span>}
            {isSuccess && <span className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Saved</span>}
          </div>
        </div>
      )}
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          rows={8}
          className={`w-full px-6 py-4 bg-zinc-900 text-zinc-100 font-mono text-sm rounded-2xl border-2 transition-all focus:outline-none ${error ? "border-red-500/50" : "border-zinc-800 focus:border-marine/50"}`}
          spellCheck={false}
        />
        <button 
          onClick={() => {
            navigator.clipboard.writeText(text);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
      </div>
      <p className="text-[10px] text-zinc-400 italic">Unstructured JSON data. Changes are validated and saved on blur.</p>
    </div>
  );
};
