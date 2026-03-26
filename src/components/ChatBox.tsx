import { useState, useRef, useEffect } from 'react';
import { Chat, Message, InputMode, AppMode } from '../types';
import { Send, Code, MessageSquare, Download, RefreshCw, AlertCircle, Package, Check, X, Box, Save, Smartphone, Keyboard, Tablet, MousePointer, Lock as LockIcon, Plus, FileArchive } from 'lucide-react';
import { invokeLLM } from '../services/llm';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx } from 'clsx';
import { ThreePreview } from './ThreePreview';

interface ChatBoxProps {
  chat: Chat | undefined;
  updateMessages: (messages: Message[], extra?: Partial<Chat>) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  theme: 'dark' | 'light';
  onSaveProject: (name: string, code: string, language: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onStartChat: (initialMessage: string) => void;
  credits: number;
  userAge?: number;
}

export function ChatBox({
  chat,
  updateMessages,
  inputMode,
  setInputMode,
  theme,
  onSaveProject,
  mode,
  setMode,
  onStartChat,
  credits,
  userAge
}: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (chat && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.role === 'user' && !isTyping) {
        // Automatically trigger AI response for new user messages
        const hasAssistantFollowup = chat.messages.some((m, i) => i > chat.messages.indexOf(lastMessage) && m.role === 'assistant');
        if (!hasAssistantFollowup) {
          triggerAIResponse(chat.messages);
        }
      }
    }
  }, [chat?.id, chat?.messages.length]);

  const triggerAIResponse = async (messages: Message[]) => {
    if (credits < 10) return;
    setIsTyping(true);
    try {
      const aiContent = await invokeLLM(messages);
      
      const codeMatch = aiContent.match(/```(\w+)?\n([\s\S]*?)```/);
      const is3D = aiContent.toLowerCase().includes('3d model');
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        type: is3D ? '3d' : (codeMatch ? 'code' : 'chat'),
        code: codeMatch ? codeMatch[2] : undefined,
        language: codeMatch ? codeMatch[1] : undefined
      };

      updateMessages([...messages, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "An error occurred while processing your request.",
        error: error.message,
        type: 'chat'
      };
      updateMessages([...messages, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || credits < 10) return;
    
    if (!chat) {
      onStartChat(text);
      setInput('');
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    updateMessages([...chat.messages, userMsg]);
    setInput('');
  };

  const handleRetry = (errorMsg: string) => {
    handleSend(`I got this error: ${errorMsg}. Please fix it.`);
  };

  const handleDownload = (code: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePackageResponse = (msgId: string, accepted: boolean) => {
    if (!chat) return;

    const updatedMessages = chat.messages.map(m => {
      if (m.id === msgId) {
        return { 
          ...m, 
          responded: true,
          type: 'text' as const,
          content: accepted ? "✅ **Installing packages...**" : "❌ **Skipping package installation.**"
        };
      }
      return m;
    });

    const responseMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: accepted ? "Yes, install them." : "No, skip them."
    };
    
    updateMessages([...updatedMessages, responseMsg], { packagesHandled: true });
    
    if (accepted) {
      // Simulate installation then proceed
      setTimeout(() => {
        handleSend("Proceed with the request now that packages are installed.");
      }, 1000);
    } else {
      handleSend("Proceed without installing packages.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type || 'unknown';
    const fileSize = (file.size / 1024).toFixed(2) + ' KB';
    
    if (fileName.toLowerCase().endsWith('.iso')) {
      handleSend(`[ISO File Uploaded: ${fileName}]\nSize: ${fileSize}\n\nThis ISO has been added to the internal project assets. The custom chatbot can now use it.`);
    } else if (file.type.startsWith('text/') || fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.html') || fileName.endsWith('.css') || fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleSend(`[File Uploaded: ${fileName}]\nType: ${fileType}\nSize: ${fileSize}\n\nContent:\n\`\`\`\n${content}\n\`\`\`\n\nPlease use this file content to build or edit the app.`);
      };
      reader.readAsText(file);
    } else {
      handleSend(`[File Uploaded: ${fileName}]\nType: ${fileType}\nSize: ${fileSize}\n\nThis is a binary or non-text file. Please acknowledge its presence and use its metadata if needed for the app.`);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const lastCodeMessage = chat?.messages.filter(m => m.code).pop();

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl w-full space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tighter">Tablet AI</h2>
            <p className="opacity-60">What can Builderplex help you build today?</p>
          </div>
          <div className="flex items-end gap-3 w-full">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={credits < 10}
              className={clsx(
                "p-4 rounded-2xl transition-all border-2 shrink-0 flex items-center justify-center group relative",
                isDark 
                  ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" 
                  : "bg-blue-500 border-blue-400 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20",
                inputMode === 'tablet' && "p-8 rounded-[3rem]"
              )}
              title="Upload File"
            >
              <Plus size={inputMode === 'tablet' ? 48 : 24} strokeWidth={3} />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-tighter">
                Open File Explorer
              </div>
            </button>
            <div className={clsx(
              "flex-1 relative group rounded-2xl p-4 transition-all border-2",
              isDark ? "bg-white/5 border-white/10 focus-within:border-blue-500/50" : "bg-black/5 border-black/10 focus-within:border-blue-500/50"
            )}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Describe your app idea..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-lg"
              />
              <button
                onClick={() => handleSend()}
                className={clsx(
                  "absolute bottom-4 right-4 p-2 rounded-xl transition-all",
                  isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90",
                  inputMode === 'touch' ? "p-4 scale-125" : "p-2"
                )}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                if (inputMode === 'cursor') setInputMode('touch');
                else if (inputMode === 'touch') setInputMode('tablet');
                else setInputMode('cursor');
              }}
              className={clsx(
                "px-8 py-4 rounded-2xl text-sm font-bold transition-all border flex items-center gap-3 mx-auto",
                inputMode !== 'cursor' 
                  ? (isDark ? "bg-blue-500 text-white border-blue-400 scale-110" : "bg-blue-600 text-white border-blue-500 scale-110")
                  : (isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10")
              )}
            >
              {inputMode === 'cursor' ? <Smartphone size={20} /> : inputMode === 'touch' ? <Tablet size={20} /> : <MousePointer size={20} />}
              {inputMode === 'cursor' ? "I don't have a keyboard" : inputMode === 'touch' ? "Switch to Tablet Mode" : "Switch to Cursor Mode"}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono opacity-40">
              Version 1.25.26
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'coding') {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className={clsx(
          "p-4 border-b flex items-center justify-between",
          isDark ? "border-white/10" : "border-black/10"
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('chat')}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                "opacity-50 hover:opacity-100"
              )}
            >
              <MessageSquare size={16} /> Chat
            </button>
            <button
              onClick={() => setMode('coding')}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                isDark ? "bg-white text-black" : "bg-black text-white"
              )}
            >
              <Code size={16} /> Coding
            </button>
          </div>
          <div className="text-sm opacity-50 font-mono">Coding View</div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {!lastCodeMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
              <Code size={48} className="mb-4" />
              <p>No code generated in this chat yet.</p>
              <button 
                onClick={() => setMode('chat')}
                className="mt-4 text-blue-400 hover:underline"
              >
                Go back to chat to generate code
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 font-mono text-sm overflow-auto bg-black/20">
                <pre className="text-white/80">
                  <code>{lastCodeMessage.code}</code>
                </pre>
              </div>
              <div className="p-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(lastCodeMessage.code!)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all text-sm font-bold",
                      inputMode === 'touch' && "px-6 py-4 text-lg"
                    )}
                  >
                    <Download size={16} /> Download index.html
                  </button>
                  <button
                    onClick={() => onSaveProject(chat.title, lastCodeMessage.code!, lastCodeMessage.language || 'html')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm",
                      inputMode === 'touch' && "px-6 py-4 text-lg"
                    )}
                  >
                    <Save size={16} /> Save to Projects
                  </button>
                </div>
                <div className="flex items-end gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={credits < 10}
                    className={clsx(
                      "p-3 rounded-2xl transition-all border-2 shrink-0 flex items-center justify-center group relative",
                      isDark 
                        ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" 
                        : "bg-blue-500 border-blue-400 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                    )}
                    title="Upload File"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                  <div className={clsx(
                    "flex-1 relative flex items-center rounded-2xl p-2 transition-all border-2",
                    isDark ? "bg-white/5 border-white/10 focus-within:border-blue-500/50" : "bg-black/5 border-black/10 focus-within:border-blue-500/50"
                  )}>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Ask to edit the code..."
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-4 text-sm max-h-20"
                      rows={1}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping || credits < 10}
                      className={clsx(
                        "p-2 rounded-xl transition-all disabled:opacity-30",
                        isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                      )}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "flex-1 flex flex-col h-full overflow-hidden transition-all",
      inputMode === 'tablet' && "scale-105 origin-top"
    )}>
      <header className={clsx(
        "p-4 border-b flex items-center justify-between",
        isDark ? "border-white/10" : "border-black/10",
        inputMode === 'tablet' && "p-8"
      )}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('chat')}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              mode === 'chat' ? (isDark ? "bg-white text-black" : "bg-black text-white") : "opacity-50 hover:opacity-100",
              inputMode === 'tablet' && "px-8 py-4 text-2xl rounded-2xl"
            )}
          >
            <MessageSquare size={inputMode === 'tablet' ? 24 : 16} /> Chat
          </button>
          <button
            onClick={() => setMode('coding')}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              "opacity-50 hover:opacity-100",
              inputMode === 'tablet' && "px-8 py-4 text-2xl rounded-2xl"
            )}
          >
            <Code size={inputMode === 'tablet' ? 24 : 16} /> Coding
          </button>
        </div>
        <div className={clsx(
          "text-sm opacity-50 font-mono flex items-center gap-4",
          inputMode === 'tablet' && "text-xl"
        )}>
          {userAge !== undefined && (
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
              Age: {userAge > 0 ? userAge : 'Bypassed'}
            </span>
          )}
          {chat.title}
        </div>
      </header>

      <div ref={scrollRef} className={clsx(
        "flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar",
        inputMode === 'tablet' && "p-12 space-y-12"
      )}>
        {chat.messages.map((msg) => (
          <div key={msg.id} className={clsx(
            "flex flex-col max-w-[85%]",
            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start",
            inputMode === 'tablet' && "max-w-[95%]"
          )}>
            <div className={clsx(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? (isDark ? "bg-white/10" : "bg-black/10") 
                : (isDark ? "bg-[#1a1a1a] border border-white/5" : "bg-white border border-black/5"),
              inputMode === 'tablet' && "p-10 text-2xl rounded-[3rem]"
            )}>
              <div className={clsx(
                "prose prose-invert max-w-none prose-sm",
                inputMode === 'tablet' && "prose-xl"
              )}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.type === '3d' && (
                <div className="mt-4 space-y-2">
                  <ThreePreview 
                    type={msg.content.toLowerCase().includes('sphere') ? 'sphere' : msg.content.toLowerCase().includes('torus') ? 'torus' : 'box'} 
                  />
                  <p className="text-[10px] opacity-40 font-mono uppercase tracking-tighter">Interactive 3D Model Generated by Tablet AI</p>
                </div>
              )}

              {msg.type === 'package-request' && !msg.responded && (
                <div className={clsx(
                  "mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3",
                  inputMode === 'tablet' && "p-10 rounded-[2rem] space-y-8"
                )}>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Package size={inputMode === 'tablet' ? 32 : 16} />
                    <span className={clsx(
                      "font-semibold",
                      inputMode === 'tablet' && "text-3xl"
                    )}>Install packages?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePackageResponse(msg.id, true)}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all",
                        (inputMode === 'touch' || inputMode === 'tablet') && "py-6 text-2xl rounded-2xl"
                      )}
                    >
                      <Check size={inputMode === 'tablet' ? 32 : 16} /> Yes
                    </button>
                    <button
                      onClick={() => handlePackageResponse(msg.id, false)}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all",
                        (inputMode === 'touch' || inputMode === 'tablet') && "py-6 text-2xl rounded-2xl"
                      )}
                    >
                      <X size={inputMode === 'tablet' ? 32 : 16} /> No
                    </button>
                  </div>
                </div>
              )}

              {msg.error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle size={16} />
                    <span className="font-semibold">Error Detected</span>
                  </div>
                  <p className="text-xs opacity-70 font-mono">{msg.error}</p>
                  <button
                    onClick={() => handleRetry(msg.error!)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all",
                      inputMode === 'touch' && "py-4 px-6 text-lg w-full justify-center"
                    )}
                  >
                    <RefreshCw size={16} /> Retry & Fix
                  </button>
                </div>
              )}

              {msg.content.includes('[ISO File Uploaded:') && (
                <div className="mt-4 p-6 rounded-2xl bg-zinc-900 text-white space-y-4 shadow-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                      <Package size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Project Asset Added</h3>
                      <p className="text-xs opacity-80 font-mono">{msg.content.split('\n')[0].replace('[ISO File Uploaded: ', '').replace(']', '')}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span>Internal Storage</span>
                      <span className="text-blue-400">Stored</span>
                    </div>
                    <div className="text-xs font-mono opacity-60">
                      /assets/iso/ &gt; File integrated into app bundle
                    </div>
                  </div>
                </div>
              )}

              {msg.code && (
                <div className="mt-4 space-y-4">
                  <div className={clsx(
                    "rounded-xl overflow-hidden border",
                    isDark ? "border-white/10" : "border-black/10"
                  )}>
                    <div className={clsx(
                      "px-4 py-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest",
                      isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                    )}>
                      <span>{msg.language || 'html'}</span>
                      <Code size={12} />
                    </div>
                    <SyntaxHighlighter
                      language={msg.language || 'javascript'}
                      style={isDark ? atomDark : oneLight}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: inputMode === 'tablet' ? '1.5rem' : '0.75rem',
                        background: 'transparent'
                      }}
                    >
                      {msg.code}
                    </SyntaxHighlighter>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(msg.code!)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all text-sm font-bold shadow-lg shadow-green-500/20",
                        inputMode === 'touch' && "px-6 py-3 text-sm"
                      )}
                    >
                      <Download size={16} /> Download index.html
                    </button>
                    <button
                      onClick={() => onSaveProject(chat.title, msg.code!, msg.language || 'html')}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs",
                        inputMode === 'touch' && "px-6 py-3 text-sm"
                      )}
                    >
                      Save to Projects
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center opacity-50 text-xs animate-pulse">
            <div className="w-2 h-2 bg-current rounded-full" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full" />
            <span>Coding...</span>
          </div>
        )}
      </div>

      <div className={clsx(
        "p-4 border-t border-white/10",
        inputMode === 'tablet' && "p-12"
      )}>
        <div className="flex items-center justify-between mb-2 px-2">
          <div className={clsx(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
            credits < 50 ? "text-red-500" : "text-blue-500"
          )}>
            <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", credits < 50 ? "bg-red-500" : "bg-blue-500")} />
            Credits: {credits.toLocaleString()}
          </div>
          <div className="text-[10px] opacity-30 font-mono">v1.25.26</div>
        </div>
        <div className="flex items-end gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={credits < 10}
            className={clsx(
              "p-4 rounded-2xl transition-all border-2 shrink-0 flex items-center justify-center group relative",
              isDark 
                ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" 
                : "bg-blue-500 border-blue-400 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20",
              inputMode === 'tablet' && "p-8 rounded-[3rem]"
            )}
            title="Upload File"
          >
            <Plus size={inputMode === 'tablet' ? 48 : 24} strokeWidth={3} />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-tighter">
              Open File Explorer
            </div>
          </button>
          <div className={clsx(
            "flex-1 relative flex items-center rounded-2xl p-2 transition-all border-2",
            isDark ? "bg-white/5 border-white/10 focus-within:border-blue-500/50" : "bg-black/5 border-black/10 focus-within:border-blue-500/50",
            inputMode === 'tablet' && "rounded-[2rem] p-6",
            credits < 10 && "opacity-50 grayscale pointer-events-none"
          )}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={credits < 10 ? "Out of credits. Refreshing daily..." : "Type your message..."}
              className={clsx(
                "flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-4 text-sm max-h-32",
                inputMode === 'tablet' && "text-2xl py-6 px-8 max-h-64"
              )}
              rows={1}
              disabled={credits < 10}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || credits < 10}
              className={clsx(
                "p-2 rounded-xl transition-all disabled:opacity-30",
                isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90",
                inputMode === 'touch' ? "p-4 scale-110" : inputMode === 'tablet' ? "p-8 scale-125 rounded-[1.5rem]" : "p-2",
                credits < 10 && "bg-zinc-800 text-zinc-500"
              )}
            >
              {credits < 10 ? <LockIcon size={inputMode === 'tablet' ? 32 : 18} /> : <Send size={inputMode === 'tablet' ? 32 : 18} />}
            </button>
          </div>
        </div>
        {credits < 10 && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center flex items-center justify-center gap-2">
            <LockIcon size={14} /> AI CHAT LOCKED: OUT OF CREDITS. SELF-CODE OR USE PROJECTS ONLY.
          </div>
        )}
      </div>
    </div>
  );
}
