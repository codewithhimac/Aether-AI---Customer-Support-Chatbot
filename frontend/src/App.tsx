import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ICONS, APP_CONFIG } from "./constants";
import { Message, Conversation } from "./types";
import { storageService } from "./services/storageService";
import { sendMessage } from "./services/apiClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight } from "lucide-react";

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Initialize
  useEffect(() => {
    const stored = storageService.getConversations();
    if (stored.length > 0) {
      setConversations(stored);
      setActiveConversationId(stored[0].id);
    } else {
      createNewConversation();
    }
  }, []);

  // Persist
  useEffect(() => {
    if (conversations.length > 0) {
      storageService.saveConversations(conversations);
    }
  }, [conversations]);

  
  // Smart auto-scroll (only if user near bottom)
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  const isNearBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight < 120;

  if (isNearBottom) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }
}, [conversations, isStreaming]);

  // Show scroll button when user is not at bottom
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  const handleScroll = () => {
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 60;

    // show button while scrolling (if not at bottom)
    setShowScrollButton(!isAtBottom);

    // reset hide timer
    if (scrollHideTimer.current) {
      clearTimeout(scrollHideTimer.current);
    }

    // hide after 3 seconds of no scroll
    scrollHideTimer.current = setTimeout(() => {
      setShowScrollButton(false);
    }, 3000);
  };

  el.addEventListener("scroll", handleScroll);
  return () => el.removeEventListener("scroll", handleScroll);
}, []);


  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: "New Chat",
      lastUpdated: Date.now(),
      messages: [
        {
          id: "welcome-" + newId,
          role: "assistant",
          content:
            "Hi! I'm Aether Support. How can I assist you with your account, billing, or technical issues today?",
          timestamp: Date.now(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConversationId === id) {
      setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      if (filtered.length === 0) createNewConversation();
    }
  };

  const currentConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversationId || isStreaming) return;

    const userMessageContent = inputValue.trim();
    setInputValue("");
    setIsStreaming(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
      timestamp: Date.now(),
      status: "success",
    };

    setConversations((prev) =>
  prev.map((conv) => {
    if (conv.id === activeConversationId) {

      // Auto title logic (only if still default)
      let newTitle = conv.title;

      if (conv.title === "New Chat") {
        const cleaned = userMessageContent
          .replace(/\n/g, " ")
          .trim();

        newTitle =
          cleaned.length > 45
            ? cleaned.slice(0, 45) + "..."
            : cleaned;
      }

      return {
        ...conv,
        title: newTitle,
        messages: [...conv.messages, userMessage],
        lastUpdated: Date.now(),
      };
    }
    return conv;
  }),
);

setTimeout(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, 80);


    try {
       const history = currentConversation?.messages.map(m => ({
    role: m.role,
    content: m.content
  })) || [];

  const result = await sendMessage(userMessageContent, history);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.reply,
        timestamp: Date.now(),
        status: "success",
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversationId) {
            return { ...conv, messages: [...conv.messages, assistantMessage] };
          }
          return conv;
        }),
      );

      
      
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error connecting to my core processing unit. Please try again or escalate to human support.",
        timestamp: Date.now(),
        status: "error",
      };
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversationId) {
            return { ...conv, messages: [...conv.messages, errorMessage] };
          }
          return conv;
        }),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

const scrollToBottom = () => {
  if (!scrollRef.current) return;

  scrollRef.current.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: "smooth",
  });
};


  return (
    <div className="flex h-[100dvh] w-full bg-black grid-bg relative overflow-hidden">


      {/* Sidebar */}
      <motion.aside
  initial={false}
  animate={{
  width: window.innerWidth >= 768 ? (isSidebarOpen ? 300 : 80) : 300,
}}
  transition={{
    duration: 0.28,
    ease: [0.4, 0, 0.2, 1],
  }}
  className={`
  glass-panel h-full border-r border-white/10 flex flex-col z-40 overflow-hidden

  fixed top-0 left-0

  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}

  transition-transform duration-300

  w-[85vw] max-w-[300px]

  md:relative md:translate-x-0 md:w-auto
`}
>

{isSidebarOpen && (
  <div
    className="fixed inset-0 bg-black/10 z-30 md:hidden"
    onClick={() => setIsSidebarOpen(false)}
  />
)}


  {/* TOP BAR */}
  <div className={`p-4 flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"}`}>

    {/* Left Section */}
    <div className="flex items-center gap-4">

          {/* Bot icon = toggle when CLOSED */}
    <button
      onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
      className={`
        w-9 h-9 rounded-xl
        flex items-center justify-center shrink-0
        border transition-all duration-200

        ${isSidebarOpen
          ? "bg-brand-primary/20 border-brand-primary/30 cursor-default"
          : "bg-brand-primary/20 border-brand-primary/30 hover:border-brand-primary/70 hover:shadow-[0_0_10px_rgba(99,102,241,0.35)]"
        }
      `}
    >
      <ICONS.Bot />
    </button>

    {isSidebarOpen && (
      <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent whitespace-nowrap">
        Aether AI
      </span>
    )}
  </div>

  {/* Toggle arrow ONLY when sidebar open */}
  {isSidebarOpen && (
    <button
      onClick={() => setIsSidebarOpen(false)}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/10 hover:border-brand-primary/60 transition"
    >
      <ChevronLeft size={18}/>
    </button>
  )}
  </div>

  {/* NEW CHAT */}
  <button
    onClick={createNewConversation}
    className="mx-3 mb-5 flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-primary/50 transition-all"
  >
    <ICONS.Plus />

    {isSidebarOpen && (
      <span className="text-sm font-medium">New Chat</span>
    )}
  </button>

  {/* CONVERSATIONS */}
  <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2 pb-40">
    {isSidebarOpen && (
      <>
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <ICONS.History />
          History
        </div>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            title={conv.title}
            onClick={() => setActiveConversationId(conv.id)}
            className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all border ${
              activeConversationId === conv.id
                ? "bg-brand-primary/10 border-brand-primary/30 text-white"
                : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-sm font-medium truncate flex-1 pr-2">
              {conv.title}
            </span>

            <button
              onClick={(e) => deleteConversation(conv.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
              <ICONS.Trash />
            </button>

            {/* RAIL DOT */}
            {!isSidebarOpen && (
              <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
            )}
          </div>
        ))}
      </>
    )}
  </div>

  {/* PROFILE */}
  <div className="p-4 border-t border-white/10 bg-black/20">
    <div className={`flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}>
      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
        <img src="https://picsum.photos/seed/aether/40" alt="avatar" />
      </div>

      {isSidebarOpen && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">
            System Admin
          </span>
          <span className="text-xs text-zinc-500">
            Enterprise Plan
          </span>
        </div>
      )}
    </div>
  </div>
</motion.aside>


      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative z-10">
        {/* Header */}
        <header className="h-16 sm:h-20 glass-panel border-b border-white/10 px-3 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"
              >
                <ICONS.History />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-white truncate max-w-[200px] md:max-w-md">
                {currentConversation?.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  Aether Core Online
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
           
          </div>
        </header>

        {/* Message Window */}
        <div
  ref={scrollRef}
  className="
    flex-1 overflow-y-auto custom-scrollbar
    px-3 sm:px-6
    py-6
    space-y-10
    pb-40
  "
>
          <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-10 sm:space-y-12">
            <AnimatePresence mode="popLayout">
              {currentConversation?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-3 sm:gap-6 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                      msg.role === "assistant"
                        ? "bg-brand-primary/20 border-brand-primary/40 text-brand-primary"
                        : "bg-zinc-800 border-white/10 text-zinc-400"
                    }`}
                  >
                    {msg.role === "assistant" ? <ICONS.Bot /> : <ICONS.User />}
                  </div>
                  <div
  className={`
    flex flex-col gap-2
    w-fit
    max-w-[92%]
    sm:max-w-[75%]
    lg:max-w-[60%]
    ${msg.role === "user" ? "items-end ml-auto" : ""}
  `}
>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
      msg.role === "assistant"
      ? "bg-white/[0.04] border border-white/15 text-zinc-100 backdrop-blur-sm rounded-tl-none"
      : "bg-brand-primary text-white rounded-tr-none"
  }`}
>
                     <div className="prose prose-invert max-w-none break-words
    prose-p:my-2
    prose-headings:font-semibold
    prose-strong:text-white
    prose-a:text-indigo-400
    prose-pre:bg-transparent
    prose-code:bg-transparent
  ">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {msg.content}
    </ReactMarkdown>
  </div>

  {msg.status === "sending" && (
    <span className="inline-block w-1.5 h-4 bg-brand-primary/50 ml-1 animate-pulse align-middle"></span>
  )}

                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-tighter px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking Indicator */}
            {isStreaming &&
              !currentConversation?.messages.find(
                (m) => m.status === "sending",
              ) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-6"
                >
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary flex items-center justify-center">
                    <ICONS.Bot />
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              )}
          </div>

           {/* Scroll To Bottom Button */}
          {showScrollButton && (
<button
  onClick={scrollToBottom}
  className={`
    absolute left-1/2 -translate-x-1/2
    bottom-[calc(120px+env(safe-area-inset-bottom))]
    z-30 w-11 h-11 rounded-full

    bg-white/5 backdrop-blur-xl
    border border-white/10
    flex items-center justify-center
    text-zinc-300

    transition-all duration-300
    ${showScrollButton ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
  `}
>
  ▼
</button>

          )}

        </div>

       {/* Input Bar */}
<div
  className="
    absolute bottom-0 left-0 right-0
    px-3 sm:px-8
    pb-[calc(env(safe-area-inset-bottom)+16px)]
    pt-0
    bg-gradient-to-t from-black via-black/80 to-transparent
  "
>

  <div className="max-w-4xl mx-auto">

    {/* Glow Container */}
    <div className="relative group">
  {/* PREMIUM GLOW LAYER — DO NOT TOUCH AGAIN */}
  <div className="absolute -inset-1 rounded-[28px] 
                  bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20
                  blur-2xl opacity-70
                  group-focus-within:opacity-100
                  transition duration-500">
  </div>

      {/* Glow */}
      <div className="
        absolute -inset-[3px]
  rounded-3xl
  opacity-60
  group-focus-within:opacity-100
  blur-xl
  transition duration-300

      " />

      {/* MAIN INPUT */}
      <div className="
relative
rounded-3xl
bg-zinc-900/80
backdrop-blur-xl

border border-indigo-500/70
focus-within:border-indigo-600


shadow-[0_0_10px_rgba(99,102,241,0.10)]
focus-within:shadow-[0_0_20px_rgba(99,102,241,0.20)]
transition-all duration-300

flex items-center gap-3
px-4 py-3
"
>

        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
  setInputValue(e.target.value)

  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"
}}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={isStreaming}
          placeholder="Ask about your order, pricing, or report an issue..."

          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
           el.style.height = Math.min(el.scrollHeight, 180) + "px";
          }}

          className="
flex-1
bg-transparent
outline-none
border-none
text-white
placeholder-zinc-500
text-sm

resize-none
overflow-hidden

min-h-[24px]
max-h-[180px]
"

        />

        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isStreaming}
          className="
            w-11 h-11
            rounded-2xl
            bg-brand-primary
            hover:bg-brand-primary/80
            disabled:bg-white/5
            flex items-center justify-center
            text-white
            transition
            active:scale-95
          "
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <ICONS.Send />
          )}
        </button>

      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 px-2 sm:px-4 text-center sm:text-left">
        <p className="text-[10px] text-zinc-500 tracking-wide">
          Aether AI can make mistakes. Verify important info.
        </p>

        <div className="hidden sm:flex items-center gap-4 text-[10px] text-zinc-600 font-semibold uppercase">
          <button className="hover:text-zinc-400 transition-colors">
            Documentation
          </button>
          <button className="hover:text-zinc-400 transition-colors">
            Contact Human
          </button>
          <button className="hover:text-zinc-400 transition-colors">
            System Status
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

      </main>
    </div>
  );
};

export default App;

function listAvailableModels() {
  throw new Error("Function not implemented.");
}
