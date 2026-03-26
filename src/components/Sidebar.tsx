import { Chat, AppMode, InputMode } from '../types';
import { Plus, MessageSquare, Code, Folder, Trash2, Keyboard, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string) => void;
  deleteChat: (id: string) => void;
  createNewChat: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  theme: 'dark' | 'light';
  credits: number;
  userAge?: number;
  onResetOnboarding: () => void;
  onToggleOSK: () => void;
}

export function Sidebar({
  isOpen,
  setIsOpen,
  chats,
  currentChatId,
  setCurrentChatId,
  deleteChat,
  createNewChat,
  mode,
  setMode,
  inputMode,
  setInputMode,
  theme,
  credits,
  userAge,
  onResetOnboarding,
  onToggleOSK
}: SidebarProps) {
  const isDark = theme === 'dark';

  return (
    <aside className={clsx(
      "transition-all duration-300 flex flex-col border-r",
      isOpen ? "w-64" : "w-16",
      isDark ? "bg-[#111] border-white/10" : "bg-white border-black/10"
    )}>
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h1 className="font-bold text-xl tracking-tighter">Builderplex</h1>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "p-1 rounded-md hover:bg-white/10 transition-colors",
            !isDark && "hover:bg-black/5"
          )}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="px-2 space-y-1">
        <button
          onClick={createNewChat}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
            isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10",
            !isOpen && "justify-center"
          )}
        >
          <Plus size={18} />
          {isOpen && <span>New Chat</span>}
        </button>
      </div>

      <nav className="mt-6 px-2 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        <div className={clsx("text-xs font-semibold uppercase tracking-widest px-2 mb-2 opacity-50", !isOpen && "hidden")}>
          Modes
        </div>
        <NavItem 
          icon={<MessageSquare size={18} />} 
          label="Chat" 
          active={mode === 'chat'} 
          onClick={() => setMode('chat')} 
          isOpen={isOpen}
          isDark={isDark}
        />
        <NavItem 
          icon={<Code size={18} />} 
          label="Self Coding" 
          active={mode === 'self-coding'} 
          onClick={() => setMode('self-coding')} 
          isOpen={isOpen}
          isDark={isDark}
        />
        <NavItem 
          icon={<Folder size={18} />} 
          label="Projects" 
          active={mode === 'projects'} 
          onClick={() => setMode('projects')} 
          isOpen={isOpen}
          isDark={isDark}
        />

        <div className={clsx("mt-6 text-xs font-semibold uppercase tracking-widest px-2 mb-2 opacity-50", !isOpen && "hidden")}>
          History
        </div>
        {chats.map(chat => (
          <div key={chat.id} className="group relative">
            <NavItem 
              icon={<MessageSquare size={18} className="opacity-50" />} 
              label={chat.title} 
              active={currentChatId === chat.id} 
              onClick={() => {
                setCurrentChatId(chat.id);
                setMode('chat');
              }} 
              isOpen={isOpen}
              isDark={isDark}
            />
            {isOpen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className={clsx(
          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex flex-col gap-1",
          isDark ? "bg-white/5 text-blue-400" : "bg-black/5 text-blue-600",
          !isOpen && "hidden"
        )}>
          <div>Credits: {credits.toLocaleString()}</div>
          {userAge !== undefined && <div>User Age: {userAge > 0 ? userAge : 'Bypassed'}</div>}
        </div>
        <button
          onClick={onResetOnboarding}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
            isDark ? "hover:bg-white/5" : "hover:bg-black/5",
            !isOpen && "justify-center"
          )}
        >
          <Plus size={18} className="rotate-45" />
          {isOpen && <span>Go Back</span>}
        </button>
        <button
          onClick={onToggleOSK}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
            isDark ? "hover:bg-white/5" : "hover:bg-black/5",
            !isOpen && "justify-center"
          )}
        >
          <Keyboard size={18} className="text-blue-500" />
          {isOpen && <span>Open OSK</span>}
        </button>
        <button
          onClick={() => setInputMode(inputMode === 'cursor' ? 'touch' : 'cursor')}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
            isDark ? "hover:bg-white/5" : "hover:bg-black/5",
            !isOpen && "justify-center"
          )}
        >
          {inputMode === 'cursor' ? <Keyboard size={18} /> : <Smartphone size={18} />}
          {isOpen && <span>{inputMode === 'cursor' ? "Keyboard Mode" : "Touch Mode"}</span>}
        </button>
        <div className={clsx(
          "text-[10px] font-mono opacity-30 text-center pt-2",
          !isOpen && "hidden"
        )}>
          Version 1.25.26
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, isOpen, isDark }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-sm",
        active 
          ? (isDark ? "bg-white/10 text-white" : "bg-black/10 text-black") 
          : (isDark ? "text-white/60 hover:bg-white/5 hover:text-white" : "text-black/60 hover:bg-black/5 hover:text-black"),
        !isOpen && "justify-center"
      )}
    >
      {icon}
      {isOpen && <span className="truncate">{label}</span>}
    </button>
  );
}
