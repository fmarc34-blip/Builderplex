import { useState, useEffect, useRef } from 'react';
import { X, Terminal, Sparkles, FileText, Box, Archive, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardBarProps {
  theme: 'dark' | 'light';
  inputMode: 'cursor' | 'touch' | 'tablet';
}

export function DashboardBar({ theme, inputMode }: DashboardBarProps) {
  const [state, setState] = useState<'hidden' | 'peek' | 'expanded'>('hidden');
  const touchStartRef = useRef<number | null>(null);
  const isDark = theme === 'dark';
  
  // Mock data for the dashboard
  const scripts = ['npm run dev', 'npm run build', 'npm run lint'];
  const features = ['ISO Integration', 'Custom Chatbot', 'Tablet UI', '3D Modeling'];
  const files = ['App.tsx', 'ChatBox.tsx', 'llm.ts', 'Sidebar.tsx', 'DashboardBar.tsx'];
  const packages = ['@google/genai', 'lucide-react', 'clsx', 'tailwind-merge', 'motion'];
  const zips = ['project-backup-v1.zip', 'assets-bundle.zip'];

  const handleTriggerHover = () => {
    if (state === 'hidden') setState('peek');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartRef.current - currentX;
    
    // If swiping from right (diff > 50) and it's a two-finger slide
    if (diff > 50 && state === 'hidden' && e.touches.length === 2) {
      setState('peek');
      touchStartRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (state === 'peek') setState('hidden');
  };

  const handleExpand = () => {
    setState('expanded');
  };

  const handleClose = () => {
    setState('hidden');
  };

  return (
    <>
      {/* Invisible trigger area on the right edge */}
      <div 
        onMouseEnter={handleTriggerHover}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="fixed top-0 right-0 w-4 h-full z-40 cursor-pointer"
      />

      <AnimatePresence>
        {state !== 'hidden' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ 
              x: state === 'peek' ? 'calc(100% - 60px)' : '0%',
              width: state === 'peek' ? '60px' : '400px'
            }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onMouseLeave={handleMouseLeave}
            className={clsx(
              "fixed top-0 right-0 h-full z-50 border-l shadow-2xl flex flex-col overflow-hidden",
              isDark ? "bg-[#111] border-white/10" : "bg-white border-black/10"
            )}
          >
            {state === 'peek' ? (
              <button 
                onClick={handleExpand}
                className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="opacity-50" />
                <div className="rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest opacity-30">
                  Dashboard
                </div>
                <ChevronLeft size={16} className="opacity-30" />
              </button>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="text-blue-500" />
                    <h2 className="font-bold text-xl tracking-tighter">Project Dashboard</h2>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {/* Scripts Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <Terminal size={14} />
                      <span>Active Scripts</span>
                    </div>
                    <div className="grid gap-2">
                      {scripts.map(s => (
                        <div key={s} className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs flex items-center justify-between group">
                          <span className="opacity-70">{s}</span>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Features Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <Sparkles size={14} />
                      <span>Features Added</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {features.map(f => (
                        <span key={f} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Files Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <FileText size={14} />
                      <span>Recent Files</span>
                    </div>
                    <div className="grid gap-1">
                      {files.map(f => (
                        <div key={f} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-sm opacity-70">
                          <FileText size={14} className="opacity-50" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Packages Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <Box size={14} />
                      <span>Packages</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {packages.map(p => (
                        <div key={p} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono opacity-60 truncate">
                          {p}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Zips Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <Archive size={14} />
                      <span>Zips & Backups</span>
                    </div>
                    <div className="grid gap-2">
                      {zips.map(z => (
                        <div key={z} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <Archive size={16} className="text-orange-500" />
                            <span className="text-xs opacity-70">{z}</span>
                          </div>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <footer className="p-6 border-t border-white/10 bg-black/10">
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-30">
                    <span>System Status: Online</span>
                    <span>Build: 1.25.26</span>
                  </div>
                </footer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for expanded state */}
      {state === 'expanded' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}
    </>
  );
}
