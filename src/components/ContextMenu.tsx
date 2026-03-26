import { clsx } from 'clsx';
import { Home, Code, Tablet, MousePointer, Smartphone, Layout } from 'lucide-react';
import { AppMode, InputMode } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  setMode: (mode: AppMode) => void;
  setInputMode: (mode: InputMode) => void;
  setCurrentChatId: (id: string | null) => void;
  theme: 'dark' | 'light';
}

export function ContextMenu({ x, y, onClose, setMode, setInputMode, setCurrentChatId, theme }: ContextMenuProps) {
  const isDark = theme === 'dark';

  const items = [
    { 
      label: 'Homepage', 
      icon: <Home size={16} />, 
      onClick: () => {
        setCurrentChatId(null);
        setMode('chat');
      }
    },
    { 
      label: 'Self Code', 
      icon: <Layout size={16} />, 
      onClick: () => setMode('self-coding')
    },
    { 
      label: 'Tablet Mode', 
      icon: <Tablet size={16} />, 
      onClick: () => setInputMode('tablet')
    },
    { 
      label: 'Touch Mode', 
      icon: <Smartphone size={16} />, 
      onClick: () => setInputMode('touch')
    },
    { 
      label: 'Cursor Mode', 
      icon: <MousePointer size={16} />, 
      onClick: () => setInputMode('cursor')
    },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div 
        className={clsx(
          "fixed z-50 min-w-[180px] p-1.5 rounded-2xl shadow-2xl border animate-in fade-in zoom-in duration-150",
          isDark ? "bg-zinc-900/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-black"
        )}
        style={{ left: x, top: y }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
              isDark ? "hover:bg-white/10" : "hover:bg-black/5"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
