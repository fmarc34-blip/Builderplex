/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sidebar } from './components/Sidebar';
import { DashboardBar } from './components/DashboardBar';
import { OnScreenKeyboard } from './components/OnScreenKeyboard';
import { BottomBar } from './components/BottomBar';
import { ChatBox } from './components/ChatBox';
import { CodeEditor } from './components/CodeEditor';
import { ProjectList } from './components/ProjectList';
import { ContextMenu } from './components/ContextMenu';
import { Onboarding } from './components/Onboarding';
import { Chat, Project, AppMode, InputMode, Message, AppState } from './types';
import { clsx, type ClassValue } from 'clsx';
import { Lock as LockIcon, Calendar, AlertTriangle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('chat');
  const [inputMode, setInputMode] = useState<InputMode>('cursor');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('builderplex_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('builderplex_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [isOSKOpen, setIsOSKOpen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const [showBrightnessIndicator, setShowBrightnessIndicator] = useState(false);
  
  // Gesture refs
  const lastTapTime = useRef<number>(0);
  const initialTwistAngle = useRef<number | null>(null);
  const brightnessTimeout = useRef<NodeJS.Timeout | null>(null);

  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('builderplex_state');
    const sessionSaved = sessionStorage.getItem('builderplex_session_state');
    
    let state: AppState;
    if (saved) {
      state = JSON.parse(saved);
      // Daily refresh logic
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - state.lastRefresh > oneDay) {
        state.credits = Math.min(state.credits + 590, 500000000);
        state.lastRefresh = now;
      }
      
      // If rememberMe is false, check session storage for age verification
      if (!state.rememberMe) {
        if (sessionSaved) {
          const sessionParsed = JSON.parse(sessionSaved);
          state.ageVerified = sessionParsed.ageVerified;
          state.userAge = sessionParsed.userAge;
        } else {
          state.ageVerified = false;
          state.userAge = undefined;
        }
      }
    } else {
      state = {
        credits: 590,
        ageVerified: false,
        lastRefresh: Date.now(),
        rememberMe: false,
        onboardingComplete: false
      };
    }
    return state;
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('builderplex_state', JSON.stringify(appState));
    if (!appState.rememberMe) {
      sessionStorage.setItem('builderplex_session_state', JSON.stringify({
        ageVerified: appState.ageVerified,
        userAge: appState.userAge
      }));
    }
  }, [appState]);

  // Theme logic: default is white
  useEffect(() => {
    if (!appState.onboardingComplete) {
      setTheme('light');
    }
  }, [appState.onboardingComplete]);

  // Keyboard shortcut: Ctrl + Shift + > to toggle black mode or white mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + > (which is usually Ctrl + Shift + .)
      if (e.ctrlKey && e.shiftKey && (e.key === '>' || e.key === '.')) {
        e.preventDefault();
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('builderplex_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('builderplex_projects', JSON.stringify(projects));
  }, [projects]);

  const currentChat = chats.find(c => c.id === currentChatId);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: initialMessage ? initialMessage.slice(0, 30) + '...' : 'New Chat',
      messages: initialMessage ? [{ id: Date.now().toString(), role: 'user', content: initialMessage }] : [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMode('chat');
  };

  const deleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) setCurrentChatId(null);
  };

  const updateChatMessages = (id: string, messages: Message[], extra?: Partial<Chat>) => {
    // Deduct credits for assistant messages
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && !lastMsg.error && !lastMsg.responded) {
      setAppState(prev => ({ ...prev, credits: Math.max(0, prev.credits - 10) }));
    }
    setChats(prev => prev.map(c => c.id === id ? { ...c, ...extra, messages } : c));
  };

  const saveProject = (name: string, code: string, language: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      code,
      language,
      createdAt: Date.now(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleOnboardingComplete = (age: number, rememberMe: boolean) => {
    setAppState(prev => ({
      ...prev,
      ageVerified: true,
      userAge: age,
      rememberMe,
      onboardingComplete: true
    }));
  };

  const resetOnboarding = () => {
    setAppState(prev => ({
      ...prev,
      onboardingComplete: false,
      ageVerified: false
    }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // 1-finger double tap detection
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        setIsBottomBarVisible(prev => !prev);
      }
      lastTapTime.current = now;
    }

    // 5-finger twist start
    if (e.touches.length === 5) {
      const touches = Array.from(e.touches);
      const centerX = touches.reduce((sum, t) => sum + t.clientX, 0) / 5;
      const centerY = touches.reduce((sum, t) => sum + t.clientY, 0) / 5;
      // Use the first finger to calculate initial angle relative to center
      initialTwistAngle.current = Math.atan2(touches[0].clientY - centerY, touches[0].clientX - centerX);
      setShowBrightnessIndicator(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 5 && initialTwistAngle.current !== null) {
      const touches = Array.from(e.touches);
      const centerX = touches.reduce((sum, t) => sum + t.clientX, 0) / 5;
      const centerY = touches.reduce((sum, t) => sum + t.clientY, 0) / 5;
      const currentAngle = Math.atan2(touches[0].clientY - centerY, touches[0].clientX - centerX);
      
      const diff = currentAngle - initialTwistAngle.current;
      // Convert rotation to brightness change (arbitrary scaling)
      const brightnessChange = diff * 50; 
      setBrightness(prev => Math.min(200, Math.max(20, prev + brightnessChange)));
      initialTwistAngle.current = currentAngle;

      if (brightnessTimeout.current) clearTimeout(brightnessTimeout.current);
      brightnessTimeout.current = setTimeout(() => setShowBrightnessIndicator(false), 2000);
    }
  };

  const handleTouchEnd = () => {
    initialTwistAngle.current = null;
  };

  if (!appState.onboardingComplete || !appState.ageVerified) {
    return (
      <Onboarding 
        theme={theme} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <div 
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "flex h-screen w-full transition-all duration-500",
        theme === 'dark' ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-black",
        inputMode === 'touch' ? "touch-mode" : inputMode === 'tablet' ? "tablet-mode" : "cursor-mode"
      )}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      <AnimatePresence>
        {showBrightnessIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl backdrop-blur-md border border-white/10"
          >
            {brightness > 100 ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-400" />}
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-100" 
                style={{ width: `${(brightness / 200) * 100}%` }} 
              />
            </div>
            <span className="text-xs font-mono font-bold">{Math.round(brightness)}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomBar 
        theme={theme} 
        isVisible={isBottomBarVisible} 
        onOpenOSK={() => setIsOSKOpen(true)} 
      />

      <AnimatePresence>
        {isOSKOpen && (
          <OnScreenKeyboard 
            theme={theme} 
            onClose={() => setIsOSKOpen(false)} 
            onAddFile={() => {
              // Find the file input in the ChatBox and trigger it
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) {
                fileInput.click();
              } else {
                // Fallback if no input found
                const input = document.createElement('input');
                input.type = 'file';
                input.click();
              }
            }}
          />
        )}
      </AnimatePresence>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          setMode={setMode}
          setInputMode={setInputMode}
          setCurrentChatId={setCurrentChatId}
          theme={theme}
        />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        deleteChat={deleteChat}
        createNewChat={() => createNewChat()}
        mode={mode}
        setMode={setMode}
        inputMode={inputMode}
        setInputMode={setInputMode}
        theme={theme}
        credits={appState.credits}
        userAge={appState.userAge}
        onResetOnboarding={resetOnboarding}
        onToggleOSK={() => setIsOSKOpen(prev => !prev)}
      />

      <DashboardBar 
        theme={theme} 
        inputMode={inputMode} 
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {mode === 'chat' || mode === 'coding' ? (
          <ChatBox
            chat={currentChat}
            updateMessages={(msgs, extra) => currentChatId && updateChatMessages(currentChatId, msgs, extra)}
            inputMode={inputMode}
            setInputMode={setInputMode}
            theme={theme}
            onSaveProject={saveProject}
            mode={mode}
            setMode={setMode}
            onStartChat={createNewChat}
            credits={appState.credits}
            userAge={appState.userAge}
          />
        ) : mode === 'self-coding' ? (
          <CodeEditor
            inputMode={inputMode}
            theme={theme}
            onSaveProject={saveProject}
          />
        ) : (
          <ProjectList
            projects={projects}
            deleteProject={deleteProject}
            theme={theme}
            inputMode={inputMode}
          />
        )}
      </main>
    </div>
  );
}

