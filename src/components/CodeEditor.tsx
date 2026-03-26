import { useState } from 'react';
import { InputMode } from '../types';
import { Save, Download, Code } from 'lucide-react';
import { clsx } from 'clsx';

interface CodeEditorProps {
  inputMode: InputMode;
  theme: 'dark' | 'light';
  onSaveProject: (name: string, code: string, language: string) => void;
}

export function CodeEditor({ inputMode, theme, onSaveProject }: CodeEditorProps) {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #000; color: #fff; }
    h1 { font-size: 3rem; tracking: -0.05em; }
  </style>
</head>
<body>
  <h1>Self Coding Mode</h1>
</body>
</html>`);
  const isDark = theme === 'dark';

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-creation.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className={clsx(
        "p-4 border-b flex items-center justify-between",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="flex items-center gap-4">
          <div className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold",
            isDark ? "bg-white text-black" : "bg-black text-white"
          )}>
            <Code size={16} /> Editor Only
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveProject("Self Coded Project", code, 'html')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-sm font-bold",
              inputMode === 'touch' && "px-6 py-4 text-lg"
            )}
          >
            <Save size={16} /> Save Project
          </button>
          <button
            onClick={handleDownload}
            className={clsx(
              "p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all",
              inputMode === 'touch' && "p-4"
            )}
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col transition-all duration-300">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={clsx(
              "flex-1 bg-transparent border-none focus:ring-0 resize-none p-8 font-mono text-lg leading-relaxed",
              isDark ? "text-white/90" : "text-black/90"
            )}
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-white/5 text-center">
        <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">
          Builderplex Self-Coding Environment v3.25.26
        </span>
      </div>
    </div>
  );
}
