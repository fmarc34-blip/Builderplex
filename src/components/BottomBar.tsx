import { useState, useRef } from 'react';
import { ChevronUp, Keyboard, GripHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface BottomBarProps {
  theme: 'dark' | 'light';
  onOpenOSK: () => void;
  isVisible: boolean;
}

export function BottomBar({ theme, onOpenOSK, isVisible }: BottomBarProps) {
  const isDark = theme === 'dark';
  const [isSliding, setIsSliding] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
    setIsSliding(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartRef.current - currentY;
    
    // If sliding up (diff > 50)
    if (diff > 50) {
      onOpenOSK();
      touchStartRef.current = null;
      setIsSliding(false);
    }
  };

  const handleTouchEnd = () => {
    setIsSliding(false);
    touchStartRef.current = null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className={clsx(
            "fixed bottom-0 left-1/2 -translate-x-1/2 w-64 h-12 z-[90] rounded-t-2xl shadow-2xl flex items-center justify-center cursor-pointer",
            isDark ? "bg-[#1a1a1a] border-t border-x border-white/10" : "bg-white border-t border-x border-black/10"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onOpenOSK}
        >
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <ChevronUp size={14} className="animate-bounce" />
            <GripHorizontal size={20} />
            <div className="text-[8px] font-bold uppercase tracking-widest">Slide for OSK</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
