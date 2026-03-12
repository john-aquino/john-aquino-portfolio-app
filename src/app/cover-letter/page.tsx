"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "cl_pw";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CoverLetterPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore session auth on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setAuthed(true);
  }, []);

  // Scroll to bottom on new tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    // Probe the API with a minimal message to verify the password server-side
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cover-password": password,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    if (res.status === 401) {
      setAuthError("Incorrect password.");
      return;
    }
    await res.body?.cancel();
    sessionStorage.setItem(SESSION_KEY, password);
    setAuthed(true);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
    setMessages([]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    const pw = sessionStorage.getItem(SESSION_KEY) ?? "";

    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    // Append an empty assistant message to stream tokens into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cover-password": pw,
        },
        body: JSON.stringify({ messages: updated }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + chunk,
          };
          return next;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return next;
      });
      console.error(err);
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function copyMessage(idx: number, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  // ── Password gate ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
        >
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Cover Letter AI
          </h1>
          <p className="text-sm text-gray-500 mb-6">Enter password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          {authError && (
            <p className="text-red-500 text-xs mb-3">{authError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  // ── Chat UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header bar */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div>
          <span className="font-semibold text-gray-800 text-sm">Cover Letter AI</span>
          <span className="ml-2 text-xs text-gray-400">powered by Claude</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setMessages([]); textareaRef.current?.focus(); }}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            New chat
          </button>
          <button
            onClick={() => window.history.back()}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-20 space-y-2">
              <p className="text-2xl">✉️</p>
              <p className="font-medium text-gray-500">Start a conversation</p>
              <p>Try: "Write a cover letter for a Senior AI Engineer role at Anthropic"</p>
              <p>or: "How should I answer why do you want to leave Vanguard?"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => copyMessage(i, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
                    title="Copy"
                  >
                    {copied === i ? "✓" : "⎘"}
                  </button>
                )}
                {msg.role === "assistant" && !msg.content && streaming && (
                  <span className="animate-pulse text-gray-400">▋</span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={streaming}
            placeholder="Ask anything… or paste a job description"
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 max-h-40 overflow-auto"
            style={{ minHeight: "42px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            {streaming ? "…" : "Send"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </footer>
    </div>
  );
}
