import { useState, useRef } from 'react';
import { Plus, X, Command, Delete, ArrowUp, Type } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface OnScreenKeyboardProps {
  theme: 'dark' | 'light';
  onClose: () => void;
  onAddFile: () => void;
}

export function OnScreenKeyboard({ theme, onClose, onAddFile }: OnScreenKeyboardProps) {
  const [height, setHeight] = useState(320);
  const [width, setWidth] = useState(800);
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [isAltGr, setIsAltGr] = useState(false);
  const constraintsRef = useRef(null);
  const isDark = theme === 'dark';

  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'AltGr', '+']
  ];

  const shiftMap: Record<string, string> = {
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    '-': '_', '=': '+', '`': '~', '[': '{', ']': '}', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
  };

  const altGrMap: Record<string, { char: string, desc: string }> = {
    '1': { char: '📈', desc: 'Trend Up' },
    '2': { char: '📉', desc: 'Trend Down' },
    '3': { char: '📊', desc: 'Bar Chart' },
    '4': { char: '📋', desc: 'Report' },
    '5': { char: '€', desc: 'Euro' },
    '6': { char: 'π', desc: 'Pi' },
    '7': { char: '∑', desc: 'Sum' },
    '8': { char: '∞', desc: 'Infinity' },
    '9': { char: '√', desc: 'Root' },
    '0': { char: '≈', desc: 'Approx' },
    'Q': { char: 'Ω', desc: 'Omega' },
    'W': { char: 'Δ', desc: 'Delta' },
    'E': { char: 'Σ', desc: 'Sigma' },
    'R': { char: '®', desc: 'Registered' },
    'T': { char: '™', desc: 'Trademark' },
    'Y': { char: '¥', desc: 'Yen' },
    'U': { char: '↑', desc: 'Up' },
    'I': { char: '↓', desc: 'Down' },
    'O': { char: '←', desc: 'Left' },
    'P': { char: '→', desc: 'Right' },
    'A': { char: '∀', desc: 'For All' },
    'S': { char: '§', desc: 'Section' },
    'D': { char: '∂', desc: 'Partial' },
    'F': { char: '∫', desc: 'Integral' },
    'G': { char: '∇', desc: 'Nabla' },
    'H': { char: '±', desc: 'Plus-Minus' },
    'J': { char: '÷', desc: 'Divide' },
    'K': { char: '×', desc: 'Multiply' },
    'L': { char: '¬', desc: 'Not' },
    'Z': { char: '█', desc: 'Block' },
    'X': { char: '▓', desc: 'Dark' },
    'C': { char: '©', desc: 'Copyright' },
    'V': { char: '░', desc: 'Light' },
    'B': { char: '•', desc: 'Bullet' },
    'N': { char: '№', desc: 'Number' },
    'M': { char: 'µ', desc: 'Micro' },
    '-': { char: '—', desc: 'Em Dash' },
    '=': { char: '≠', desc: 'Not Equal' }
  };

  const handleKeyClick = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

    if (key === 'Shift') {
      setIsShift(!isShift);
      return;
    }

    if (key === 'Caps') {
      setIsCaps(!isCaps);
      return;
    }

    if (key === 'AltGr') {
      setIsAltGr(!isAltGr);
      return;
    }

    if (key === '+') {
      onAddFile();
      return;
    }

    let char = key;
    if (key === 'Backspace') {
      if (isInput) {
        const start = activeElement.selectionStart ?? 0;
        const end = activeElement.selectionEnd ?? 0;
        const value = activeElement.value;
        
        if (start === end && start > 0) {
          activeElement.value = value.substring(0, start - 1) + value.substring(end);
          activeElement.setSelectionRange(start - 1, start - 1);
        } else {
          activeElement.value = value.substring(0, start) + value.substring(end);
          activeElement.setSelectionRange(start, start);
        }
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    if (key === 'Enter') {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
      (activeElement || document.body).dispatchEvent(enterEvent);
      return;
    }

    // Handle character transformation
    if (isAltGr && altGrMap[key.toUpperCase()]) {
      char = altGrMap[key.toUpperCase()].char;
    } else if (isShift && shiftMap[key]) {
      char = shiftMap[key];
    } else if (key.length === 1 && key.match(/[A-Z]/i)) {
      const shouldUpper = (isShift && !isCaps) || (!isShift && isCaps);
      char = shouldUpper ? key.toUpperCase() : key.toLowerCase();
    } else if (isShift) {
      char = key;
    } else {
      char = key.toLowerCase();
    }

    const target = activeElement || document.body;
    const eventInit = { key: char, bubbles: true, composed: true };
    target.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    
    if (isInput) {
      const start = activeElement.selectionStart ?? 0;
      const end = activeElement.selectionEnd ?? 0;
      activeElement.value = activeElement.value.substring(0, start) + char + activeElement.value.substring(end);
      const newPos = start + 1;
      activeElement.setSelectionRange(newPos, newPos);
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    target.dispatchEvent(new KeyboardEvent('keyup', eventInit));

    const numberRow = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    if (isShift && numberRow.includes(key)) {
      setIsShift(false);
    }
    
    // Reset AltGr after one use for convenience, or keep it toggled? 
    // Usually it's held, but for OSK toggle is better. 
    // Let's keep it toggled until clicked again.
  };

  const getKeyLabel = (key: string) => {
    if (key === 'Backspace') return <Delete size={16} />;
    if (key === 'Shift') return <ArrowUp size={16} className={clsx(isShift && "text-blue-500")} />;
    if (key === 'Caps') return <Type size={16} className={clsx(isCaps && "text-blue-500")} />;
    if (key === 'AltGr') return <span className={clsx("text-[10px]", isAltGr && "text-blue-500")}>AltGr</span>;
    if (key === '+') return <Plus size={18} />;
    
    if (isAltGr && altGrMap[key.toUpperCase()]) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-blue-500 text-sm">{altGrMap[key.toUpperCase()].char}</span>
          <span className="text-[7px] opacity-40 leading-none">{altGrMap[key.toUpperCase()].desc}</span>
        </div>
      );
    }

    if (isShift && shiftMap[key]) return shiftMap[key];
    if (key.length === 1 && key.match(/[A-Z]/i)) {
      const shouldUpper = (isShift && !isCaps) || (!isShift && isCaps);
      return shouldUpper ? key.toUpperCase() : key.toLowerCase();
    }
    return key;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" ref={constraintsRef}>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={{ opacity: 0, x: 'calc(50vw - 400px)', y: 'calc(100vh - 350px)' }}
        animate={{ y: 'calc(100vh - 350px)', opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{ width, height }}
        className={clsx(
          "pointer-events-auto flex flex-col p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all duration-300",
          isDark ? "bg-[#1a1a1a]/90 border-white/10" : "bg-white/90 border-black/10",
          isAltGr && (isDark ? "ring-2 ring-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]" : "ring-2 ring-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]")
        )}
      >
        {/* Resize Handle Top */}
        <div 
          className="absolute -top-1 left-0 w-full h-2 cursor-ns-resize"
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startHeight = height;
            const onMouseMove = (moveEvent: MouseEvent) => {
              const delta = startY - moveEvent.clientY;
              setHeight(Math.max(200, Math.min(600, startHeight + delta)));
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        />
        {/* Resize Handle Right */}
        <div 
          className="absolute top-0 -right-1 w-2 h-full cursor-ew-resize"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = width;
            const onMouseMove = (moveEvent: MouseEvent) => {
              const delta = moveEvent.clientX - startX;
              setWidth(Math.max(400, Math.min(1200, startWidth + delta)));
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        />

        <div className="flex justify-between items-center mb-2 px-2 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2 opacity-40 text-[9px] font-bold uppercase tracking-widest">
            <Command size={10} />
            <span>{isAltGr ? "Graph/Symbol Mode" : "Builderplex Mini OSK"}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-1">
          {rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-1">
              {row.map(key => (
                <button
                  key={key}
                  onMouseDown={(e) => handleKeyClick(e, key)}
                  className={clsx(
                    "h-full min-h-[40px] rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center",
                    isDark 
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/5" 
                      : "bg-black/5 hover:bg-black/10 text-black border border-black/5",
                    key === 'Backspace' || key === 'Enter' || key === 'Shift' || key === 'Caps' ? "flex-[1.5] px-2" : "flex-1",
                    key === 'Shift' && isShift && (isDark ? "bg-blue-500/20 border-blue-500/50" : "bg-blue-100 border-blue-300"),
                    key === 'Caps' && isCaps && (isDark ? "bg-blue-500/20 border-blue-500/50" : "bg-blue-100 border-blue-300"),
                    key === 'AltGr' && isAltGr && (isDark ? "bg-blue-500/20 border-blue-500/50" : "bg-blue-100 border-blue-300"),
                    key === '+' && "bg-blue-600 hover:bg-blue-500 text-white border-none"
                  )}
                >
                  {getKeyLabel(key)}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-1 mt-0.5">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                  const start = activeElement.selectionStart ?? 0;
                  const end = activeElement.selectionEnd ?? 0;
                  activeElement.value = activeElement.value.substring(0, start) + ' ' + activeElement.value.substring(end);
                  activeElement.setSelectionRange(start + 1, start + 1);
                  activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className={clsx(
                "h-10 w-full max-w-[300px] rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
              )}
            >
              Space
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
