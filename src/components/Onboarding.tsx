import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Send, Lock, HelpCircle, Info, Zap, CheckCircle2, AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (age: number, rememberMe: boolean) => void;
  theme: 'dark' | 'light';
}

export function Onboarding({ onComplete, theme }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [ageInput, setAgeInput] = useState({ day: '', month: '', year: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'logo', title: '' },
    { id: 'welcome', title: 'Welcome to Builderplex!' },
    { id: 'purpose', title: 'The Purpose' },
    { id: 'credits', title: 'How Credits Work' },
    { id: 'preview', title: 'AI Chat Locking' },
    { id: 'typing', title: 'Real-time Assistance' },
    { id: 'help', title: 'Tutorials & Help' },
    { id: 'age', title: 'Final Step' }
  ];

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className={clsx(
      "fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden",
      theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
    )}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="logo"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-[12rem] font-black tracking-tighter leading-none select-none">W</div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={next}
              className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-xl hover:scale-105 transition-transform"
            >
              Enter Builderplex
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="welcome"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="max-w-xl text-center space-y-8"
          >
            <h1 className="text-6xl font-black tracking-tighter leading-tight">Welcome to Builderplex!</h1>
            <p className="text-xl opacity-60 leading-relaxed">
              The next-generation coding environment where AI and human creativity merge into one seamless experience.
            </p>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-black text-white dark:bg-white dark:text-black font-black text-xl flex items-center justify-center gap-2">
                Get Started <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="purpose"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="max-w-2xl space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500">
                <Zap size={48} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">The Purpose</h2>
            </div>
            <div className="grid gap-6">
              <div className="p-6 rounded-3xl border-2 border-black/5 dark:border-white/5 space-y-2">
                <h3 className="font-bold text-xl">Accelerate Development</h3>
                <p className="opacity-60">Build full-stack applications in minutes, not days, with our integrated AI assistant.</p>
              </div>
              <div className="p-6 rounded-3xl border-2 border-black/5 dark:border-white/5 space-y-2">
                <h3 className="font-bold text-xl">Self-Coding Mode</h3>
                <p className="opacity-60">A distraction-free environment for when you want to write every line yourself.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xl">Continue</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="credits"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="max-w-2xl space-y-8"
          >
            <h2 className="text-4xl font-black tracking-tighter">How Credits Work</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900">
                <CheckCircle2 className="text-green-500 mt-1" size={24} />
                <div>
                  <h3 className="font-bold">Daily Refresh</h3>
                  <p className="opacity-60">You receive 590 credits every 24 hours. They stack up to 500 million!</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900">
                <Info className="text-blue-500 mt-1" size={24} />
                <div>
                  <h3 className="font-bold">Cost per Message</h3>
                  <p className="opacity-60">Each AI response costs 10 credits. Self-coding and project management are free.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xl">Got it</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="preview"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="max-w-2xl space-y-8"
          >
            <h2 className="text-4xl font-black tracking-tighter">AI Chat Locking</h2>
            <p className="opacity-60 text-lg">When your credits run out, the AI assistant locks to prevent overuse. You can still code manually.</p>
            
            <div className="p-8 rounded-[2.5rem] border-4 border-red-500/20 bg-red-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Credits: 0
                </div>
                <Lock className="text-red-500" size={24} />
              </div>
              <div className="h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center px-4 opacity-50">
                <span className="text-sm">Out of credits. Refreshing daily...</span>
              </div>
              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl">
                  LOCKED
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xl">I Understand</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl space-y-8"
          >
            <h2 className="text-4xl font-black tracking-tighter">Real-time Assistance</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 max-w-[80%]">
                  <motion.p
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="overflow-hidden whitespace-nowrap border-r-2 border-blue-500"
                  >
                    "Can you build a React dashboard with Tailwind?"
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-4 items-start justify-end">
                <div className="p-4 rounded-2xl bg-blue-600 text-white max-w-[80%]">
                  <p>Of course! I'll set up the components and styling for you right now.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex-shrink-0" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xl">Next</button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="help"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-2xl space-y-8"
          >
            <h2 className="text-4xl font-black tracking-tighter">Tutorials & Help</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 flex flex-col items-center text-center gap-4">
                <HelpCircle size={48} className="text-blue-500" />
                <h3 className="font-bold">Help Center</h3>
                <p className="text-xs opacity-60">Access documentation and common solutions.</p>
              </div>
              <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 flex flex-col items-center text-center gap-4">
                <ChevronRight size={48} className="text-green-500" />
                <h3 className="font-bold">Tutorials</h3>
                <p className="text-xs opacity-60">Step-by-step guides to master Builderplex.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={back} className="flex-1 py-5 rounded-3xl border-2 border-black/10 dark:border-white/10 font-black text-xl">
                Go Back
              </button>
              <button onClick={next} className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xl">Almost There</button>
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div
            key="age"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md w-full p-8 rounded-[2.5rem] border-2 space-y-8 bg-zinc-900 text-white border-white/10"
          >
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-500 text-sm font-bold text-center animate-bounce">
                {error}
              </div>
            )}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black tracking-tighter">Builderplex</h1>
              <p className="opacity-60 text-white">Please verify your age to continue</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white ml-2">Day</label>
                <input 
                  type="number" 
                  placeholder="DD"
                  value={ageInput.day}
                  onChange={(e) => setAgeInput(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full p-4 rounded-2xl border-2 bg-black border-white/10 focus:border-blue-500 transition-all text-center text-xl font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white ml-2">Month</label>
                <input 
                  type="number" 
                  placeholder="MM"
                  value={ageInput.month}
                  onChange={(e) => setAgeInput(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full p-4 rounded-2xl border-2 bg-black border-white/10 focus:border-blue-500 transition-all text-center text-xl font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white ml-2">Year</label>
                <input 
                  type="number" 
                  placeholder="YYYY"
                  value={ageInput.year}
                  onChange={(e) => setAgeInput(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full p-4 rounded-2xl border-2 bg-black border-white/10 focus:border-blue-500 transition-all text-center text-xl font-bold text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
              <div className={clsx(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                rememberMe ? "bg-blue-600 border-blue-600" : "border-zinc-500"
              )}>
                {rememberMe && <CheckCircle2 size={16} className="text-white" />}
              </div>
              <span className="text-sm font-bold opacity-70">Remember me</span>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  if (ageInput.day && ageInput.month && ageInput.year) {
                    const birthDate = new Date(Number(ageInput.year), Number(ageInput.month) - 1, Number(ageInput.day));
                    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                    
                    if (age < 13) {
                      setError("You are quite young! you cannot enter this app at this age enter a fake age thats over 13 to continue.");
                      return;
                    }
                    
                    setError(null);
                    onComplete(age, rememberMe);
                  }
                }}
                className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
              >
                Verify & Enter
              </button>
              <button 
                onClick={() => onComplete(0, rememberMe)}
                className="w-full py-4 rounded-[1.5rem] border-2 border-red-500/50 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} />
                Im not entering my age!
              </button>
              <button 
                onClick={back}
                className="w-full py-4 rounded-[1.5rem] border-2 border-black/10 dark:border-white/10 font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Go Back to Intro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={clsx(
              "h-1.5 rounded-full transition-all duration-500",
              step === i ? "w-8 bg-blue-600" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}
