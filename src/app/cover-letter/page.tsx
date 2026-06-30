"use client";

import { careerTimeline, certifications, education, skills as baseSkills } from "@/data/portfolio";
import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_KEY = "cl_pw";

interface ToolUsed {
  name: string;
  label: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: ToolUsed[];
}

interface CoverLetterData {
  company?: string;
  role?: string;
  hiringManager?: string;
  tone?: string;
  headline?: string;
  letter?: string;
}

interface ResumeData {
  headline?: string;
  summary?: string;
  highlights?: string[];
  skills?: string[];
  experience?: { company: string; role: string; bullets: string[] }[];
  projects?: { name: string; url?: string; description: string }[];
  certifications?: { name: string; date?: string }[];
}

interface AgentDirective {
  shouldContinue?: boolean;
  nextPrompt?: string;
}

interface ChatApiResponse {
  chatResponse: string;
  toolsUsed?: ToolUsed[];
  coverLetter?: Partial<CoverLetterData>;
  resume?: Partial<ResumeData> & {
    skills?: string[];
    experience?: { company: string; role: string; bullets: string[] }[];
    projects?: { name: string; url?: string; description: string }[];
    certifications?: { name: string; date?: string }[];
    sectionOrder?: string[];
  };
  agent?: AgentDirective;
}

const DEFAULT_HEADLINE = "AI Systems Engineer | LLM Architectures | Cloud-Native Applications";
const DEFAULT_NAME = "John Aquino";
const LS_NAME = "cl_name";
const LS_CONTACT = "cl_contact";

interface ContactInfo {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  website: string;
}

function defaultContact(): ContactInfo {
  return {
    email: process.env.NEXT_PUBLIC_RESUME_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_RESUME_PHONE || "",
    github: "github.com/john-aquino",
    linkedin: "linkedin.com/in/john-a-aquino",
    website: "johnaquino.com",
  };
}

const CONTACT_FIELDS: { key: keyof ContactInfo; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "website", label: "Website" },
];

function joinDot(parts: (string | undefined)[]) {
  return parts.map((p) => (p || "").trim()).filter(Boolean).join(" · ");
}

function buildSignoff(name: string) {
  return `Sincerely,\n\n${name}`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Conversation persistence ────────────────────────────────────
type ResumeSection = "summary" | "aiSystems" | "skills" | "experience" | "highlights" | "projects" | "education" | "certifications";

interface SavedConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  apiMessages: Message[];
  draft: string;
  coverLetterData: CoverLetterData;
  resumeData: ResumeData;
  previewMode: "cover-letter" | "resume";
  sectionOrder: ResumeSection[];
}

const LS_CONVERSATIONS = "cl_conversations";
const LS_ACTIVE = "cl_active_id";

function loadConversations(): SavedConversation[] {
  try {
    const raw = localStorage.getItem(LS_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveConversations(convos: SavedConversation[]) {
  localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(convos));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(msgs: Message[], cl: CoverLetterData): string {
  if (cl.company && cl.role) return `${cl.role} - ${cl.company}`;
  if (cl.company) return cl.company;
  if (cl.role) return cl.role;
  const first = msgs.find((m) => m.role === "user");
  if (first) return first.content.slice(0, 50) + (first.content.length > 50 ? "..." : "");
  return "New conversation";
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function renderChatMarkdown(text: string) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Numbered list
    const numberedLines = trimmed.split("\n").filter((l) => /^\d+[.)\s]/.test(l.trim()));
    if (numberedLines.length > 0 && numberedLines.length === trimmed.split("\n").filter(Boolean).length) {
      return (
        <ol key={bi} className="list-decimal list-inside space-y-1 my-1">
          {numberedLines.map((l, li) => (
            <li key={li}>{renderInlineFormatting(l.replace(/^\d+[.)\s]+/, ""))}</li>
          ))}
        </ol>
      );
    }

    // Bullet list
    const bulletLines = trimmed.split("\n").filter((l) => /^[-*]\s/.test(l.trim()));
    if (bulletLines.length > 0 && bulletLines.length === trimmed.split("\n").filter(Boolean).length) {
      return (
        <ul key={bi} className="list-disc list-inside space-y-1 my-1">
          {bulletLines.map((l, li) => (
            <li key={li}>{renderInlineFormatting(l.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    // Header lines (### or ##)
    if (/^#{1,3}\s/.test(trimmed)) {
      const level = (trimmed.match(/^#+/) || [""])[0].length;
      const content = trimmed.replace(/^#+\s+/, "");
      const cls = level <= 2 ? "font-semibold text-[0.94em]" : "font-medium text-[0.9em]";
      return <p key={bi} className={`${cls} mt-2 mb-1`}>{renderInlineFormatting(content)}</p>;
    }

    // Regular paragraph with line breaks
    const lines = trimmed.split("\n");
    return (
      <p key={bi} className="my-1">
        {lines.map((line, li) => (
          <span key={li}>
            {renderInlineFormatting(line)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function renderLetterParagraphs(letter: string) {
  return letter
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, paragraphIdx) => {
      const lines = paragraph.split("\n");
      return (
        <p key={paragraphIdx} className="text-sm leading-relaxed text-gray-800">
          {lines.map((line, lineIdx) => (
            <span key={`${paragraphIdx}-${lineIdx}`}>
              {renderInlineFormatting(line)}
              {lineIdx < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
}

export default function CoverLetterPage() {
  const [authed, setAuthed] = useState(false);
  const [candidateName, setCandidateName] = useState(DEFAULT_NAME);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [showContactFields, setShowContactFields] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({});
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [previewMode, setPreviewMode] = useState<"cover-letter" | "resume">("cover-letter");
  const [streaming, setStreaming] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const MAX_AGENT_STEPS = 5;

  const DEFAULT_SECTION_ORDER: ResumeSection[] = [
    "summary", "aiSystems", "skills", "experience", "highlights", "projects", "education", "certifications",
  ];
  const [sectionOrder, setSectionOrder] = useState<ResumeSection[]>(DEFAULT_SECTION_ORDER);

  // Conversation persistence state
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [showConvoList, setShowConvoList] = useState(false);
  const convoListRef = useRef<HTMLDivElement>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<ResumeSection>>(new Set());

  function removeSection(id: ResumeSection) {
    setHiddenSections((prev) => new Set(prev).add(id));
  }

  function restoreSection(id: ResumeSection) {
    setHiddenSections((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function moveSection(id: ResumeSection, dir: -1 | 1) {
    setSectionOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  const DEFAULT_SUMMARY =
    "AI systems engineer with 6+ years at Vanguard building production backend and cloud systems. Currently developing multi-agent orchestration, RAG pipelines, and LLM infrastructure on AWS at enterprise scale. Python-focused. Independently shipped mobile apps to iOS and Android.";

  function sanitizeNoEmDash(text: string) {
    return text
      .replace(/[—–]/g, " - ")
      .replace(/\r\n?/g, "\n")
      .replace(/[\t ]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function normalizeGreeting(text: string) {
    // Ensure common greetings always stand on their own line with a blank line after.
    return text
      .replace(/^(\s*(?:Dear [^\n,]+,))\s+(?=\S)/i, "$1\n\n")
      .replace(/^(\s*(?:To whom it may concern,))\s+(?=\S)/i, "$1\n\n");
  }

  function ensureParagraphBreaks(text: string) {
    const withMarkers = text
      .replace(
        /([.!?])\s+(?=(At Vanguard,|In my current role,|I also\b|Before that,|Earlier,|Beyond (?:my day job|work),|Outside work,|I independently\b|I'd welcome\b|I would welcome\b))/g,
        "$1\n\n"
      )
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const existingParagraphs = withMarkers.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    if (existingParagraphs.length >= 3) {
      return withMarkers;
    }

    // Fallback: if still one dense block, split every 2 sentences for readability.
    const sentenceMatches = withMarkers.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map((s) => s.trim()) ?? [];
    if (sentenceMatches.length < 4) {
      return withMarkers;
    }

    const chunks: string[] = [];
    for (let i = 0; i < sentenceMatches.length; i += 2) {
      chunks.push(sentenceMatches.slice(i, i + 2).join(" "));
    }
    return chunks.join("\n\n");
  }

  function normalizeSignOff(text: string) {
    // Remove any trailing sign-off variants and add a single canonical one.
    const nameEsc = escapeRegex(candidateName);
    const withoutTrailingClosings = text
      .replace(new RegExp(`\\n*(?:sincerely|best regards|regards|respectfully|thank you),?\\s*\\n*${nameEsc}\\s*$`, "gi"), "")
      .replace(new RegExp(`\\n*(?:sincerely|best regards|regards|respectfully|thank you),?\\s*${nameEsc}\\s*$`, "gi"), "")
      .trim();
    if (!withoutTrailingClosings) return buildSignoff(candidateName);
    return `${withoutTrailingClosings}\n\n${buildSignoff(candidateName)}`;
  }

  function hasSignOff(text: string) {
    const nameEsc = escapeRegex(candidateName);
    return new RegExp(`(?:sincerely|best regards|regards|respectfully|thank you)[,\\s]*\\n+\\s*${nameEsc}\\s*$`, "i").test(
      text.trim()
    );
  }

  function ensureSignOff(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return "";
    if (hasSignOff(trimmed)) return normalizeSignOff(trimmed);
    return normalizeSignOff(trimmed);
  }

  function normalizeLetterBody(text: string) {
    const cleaned = sanitizeNoEmDash(text.replace(/\\n/g, "\n").replace(/\/n/g, "\n"));
    return ensureSignOff(ensureParagraphBreaks(normalizeGreeting(cleaned)));
  }
  const [errorText, setErrorText] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [draftCopied, setDraftCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Conversation persistence helpers ────────────────────────
  const saveCurrentConvo = useCallback(() => {
    if (!activeConvoId) return;
    // Only save if there's actual content
    if (messages.length === 0 && !draft.trim()) return;
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === activeConvoId);
      const updated: SavedConversation = {
        id: activeConvoId,
        title: deriveTitle(messages, coverLetterData),
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        messages,
        apiMessages: apiMessagesRef.current,
        draft,
        coverLetterData,
        resumeData,
        previewMode,
        sectionOrder,
      };
      const next = existing
        ? prev.map((c) => (c.id === activeConvoId ? updated : c))
        : [updated, ...prev];
      saveConversations(next);
      return next;
    });
  }, [activeConvoId, messages, draft, coverLetterData, resumeData, previewMode, sectionOrder]);

  function loadConvo(convo: SavedConversation) {
    setMessages(convo.messages);
    apiMessagesRef.current = convo.apiMessages;
    setDraft(convo.draft);
    setCoverLetterData(convo.coverLetterData);
    setResumeData(convo.resumeData);
    setPreviewMode(convo.previewMode);
    setSectionOrder(convo.sectionOrder?.length ? convo.sectionOrder : DEFAULT_SECTION_ORDER);
    setActiveConvoId(convo.id);
    localStorage.setItem(LS_ACTIVE, convo.id);
    setShowConvoList(false);
    setAgentStep(0);
    setAgentStatus(null);
  }

  function startNewChat() {
    // Save whatever is active first
    saveCurrentConvo();
    // Reset state
    const newId = genId();
    setMessages([]);
    apiMessagesRef.current = [];
    setDraft("");
    setCoverLetterData({});
    setResumeData({});
    setAgentStep(0);
    setAgentStatus(null);
    setSectionOrder(DEFAULT_SECTION_ORDER);
    setHiddenSections(new Set());
    setPreviewMode("cover-letter");
    setActiveConvoId(newId);
    localStorage.setItem(LS_ACTIVE, newId);
    setShowConvoList(false);
    textareaRef.current?.focus();
  }

  function deleteConvo(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      return next;
    });
    if (activeConvoId === id) startNewChat();
  }

  // Load conversations on auth
  useEffect(() => {
    if (!authed) return;
    const convos = loadConversations();
    setConversations(convos);
    const lastId = localStorage.getItem(LS_ACTIVE);
    const last = lastId ? convos.find((c) => c.id === lastId) : null;
    if (last) {
      loadConvo(last);
    } else {
      const newId = genId();
      setActiveConvoId(newId);
      localStorage.setItem(LS_ACTIVE, newId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  // Auto-save on meaningful state changes (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!authed || !activeConvoId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCurrentConvo();
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [authed, activeConvoId, messages, draft, coverLetterData, resumeData, previewMode, sectionOrder, saveCurrentConvo]);

  // Close conversation dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (convoListRef.current && !convoListRef.current.contains(e.target as Node)) {
        setShowConvoList(false);
      }
    }
    if (showConvoList) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showConvoList]);

  // Restore session auth on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setAuthed(true);
    const savedName = localStorage.getItem(LS_NAME);
    if (savedName) setCandidateName(savedName);
    const savedContact = localStorage.getItem(LS_CONTACT);
    if (savedContact) {
      try {
        setContact({ ...defaultContact(), ...JSON.parse(savedContact) });
      } catch {
        // Ignore malformed stored contact info; fall back to defaults.
      }
    }
  }, []);

  // Persist the applicant name across sessions
  useEffect(() => {
    localStorage.setItem(LS_NAME, candidateName);
  }, [candidateName]);

  // Persist the contact details across sessions
  useEffect(() => {
    localStorage.setItem(LS_CONTACT, JSON.stringify(contact));
  }, [contact]);

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
        name: candidateName,
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
    saveCurrentConvo();
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
    setMessages([]);
    apiMessagesRef.current = [];
    setDraft("");
    setCoverLetterData({});
    setResumeData({});
    setAgentStep(0);
    setAgentStatus(null);
    setSectionOrder(DEFAULT_SECTION_ORDER);
    setHiddenSections(new Set());
    setActiveConvoId(null);
  }

  // apiMessages tracks the full conversation sent to the API (including hidden agent continuations)
  // messages tracks what appears in the UI
  const apiMessagesRef = useRef<Message[]>([]);

  async function sendMessage(explicitText?: string, isAgentContinuation = false) {
    const text = (explicitText ?? input).trim();
    if (!text || streaming) return;
    const pw = sessionStorage.getItem(SESSION_KEY) ?? "";
    setErrorText("");

    // Add the user message to the full API history
    apiMessagesRef.current = [...apiMessagesRef.current, { role: "user", content: text }];

    // Only show user messages in the UI for non-agent continuations
    if (!isAgentContinuation) {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
    }
    if (!explicitText) {
      setInput("");
    }
    setStreaming(true);

    // Helper: apply cover letter data from a tool event
    function applyCoverLetter(cl: Partial<CoverLetterData>) {
      setCoverLetterData((prev) => {
        const normalizedLetter = typeof cl.letter === "string" ? normalizeLetterBody(cl.letter) : prev.letter;
        const merged = {
          ...prev,
          ...cl,
          headline: typeof cl.headline === "string" ? sanitizeNoEmDash(cl.headline) : prev.headline,
          letter: normalizedLetter,
        };
        if (typeof merged.letter === "string" && merged.letter.trim()) {
          setDraft(merged.letter.trim());
          setPreviewMode("cover-letter");
        }
        return merged;
      });
    }

    // Helper: apply resume data from a tool event
    function applyResume(nextResume: ChatApiResponse["resume"]) {
      if (!nextResume) return;
      setResumeData((prev) => {
        const mergedHighlights = Array.isArray(nextResume.highlights)
          ? nextResume.highlights.map((item) => sanitizeNoEmDash(String(item))).filter(Boolean)
          : prev.highlights;
        const mergedSkills = Array.isArray(nextResume.skills)
          ? nextResume.skills.map((s) => sanitizeNoEmDash(String(s))).filter(Boolean)
          : prev.skills;
        const mergedExperience = Array.isArray(nextResume.experience)
          ? nextResume.experience.map((e) => ({
              company: sanitizeNoEmDash(String(e.company || "")),
              role: sanitizeNoEmDash(String(e.role || "")),
              bullets: Array.isArray(e.bullets)
                ? e.bullets.map((b: string) => sanitizeNoEmDash(String(b))).filter(Boolean)
                : [],
            }))
          : prev.experience;
        const mergedProjects = Array.isArray(nextResume.projects)
          ? nextResume.projects
              .map((p) => ({
                name: sanitizeNoEmDash(String(p.name || "")),
                url: p.url ? sanitizeNoEmDash(String(p.url)) : undefined,
                description: sanitizeNoEmDash(String(p.description || "")),
              }))
              .filter((p) => p.name || p.description)
          : prev.projects;
        const mergedCertifications = Array.isArray(nextResume.certifications)
          ? nextResume.certifications
              .map((c) => ({
                name: sanitizeNoEmDash(String(c.name || "")),
                date: c.date ? sanitizeNoEmDash(String(c.date)) : undefined,
              }))
              .filter((c) => c.name)
          : prev.certifications;
        return {
          ...prev,
          ...nextResume,
          headline: typeof nextResume.headline === "string" ? sanitizeNoEmDash(nextResume.headline) : prev.headline,
          summary: typeof nextResume.summary === "string" ? sanitizeNoEmDash(nextResume.summary) : prev.summary,
          highlights: mergedHighlights,
          skills: mergedSkills,
          experience: mergedExperience,
          projects: mergedProjects,
          certifications: mergedCertifications,
        };
      });
      setPreviewMode("resume");
      if (Array.isArray(nextResume.sectionOrder) && nextResume.sectionOrder.length > 0) {
        const valid = nextResume.sectionOrder.filter((s): s is ResumeSection =>
          DEFAULT_SECTION_ORDER.includes(s as ResumeSection)
        );
        const remaining = DEFAULT_SECTION_ORDER.filter((s) => !valid.includes(s));
        setSectionOrder([...valid, ...remaining]);
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cover-password": pw,
        },
        body: JSON.stringify({ messages: apiMessagesRef.current, name: candidateName }),
      });

      if (res.status === 401) { logout(); return; }
      if (!res.ok) {
        throw new Error((await res.text()) || `Server error ${res.status}`);
      }

      // Read SSE stream progressively
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      const toolsUsed: ToolUsed[] = [];
      let pendingAgent: AgentDirective | null = null;
      let assistantMsgAdded = false;

      const upsertAssistantMsg = (content: string, tools: ToolUsed[]) => {
        if (!assistantMsgAdded) {
          assistantMsgAdded = true;
          setMessages((prev) => [...prev, { role: "assistant", content, toolsUsed: [...tools] }]);
        } else {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return [...prev.slice(0, -1), { ...last, content, toolsUsed: [...tools] }];
            }
            return prev;
          });
        }
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE events from buffer
        while (true) {
          const eventEnd = buffer.indexOf("\n\n");
          if (eventEnd === -1) break;
          const eventBlock = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);

          let eventType = "";
          let eventData = "";
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            else if (line.startsWith("data: ")) eventData += line.slice(6);
          }
          if (!eventType || !eventData) continue;

          const data = JSON.parse(eventData);

          switch (eventType) {
            case "text":
              fullText += (fullText ? "\n\n" : "") + data.content;
              upsertAssistantMsg(fullText, toolsUsed);
              break;

            case "tool":
              toolsUsed.push({ name: data.name, label: data.label });
              upsertAssistantMsg(fullText || "Working...", toolsUsed);
              // Apply data immediately
              if (data.coverLetter) applyCoverLetter(data.coverLetter);
              if (data.resume) applyResume(data.resume);
              if (data.agent) pendingAgent = data.agent;
              break;

            case "error":
              throw new Error(data.message);

            case "done":
              break;
          }
        }
      }

      // Finalize: make sure there's a visible assistant message
      if (!fullText && !assistantMsgAdded) {
        fullText = "Done.";
        upsertAssistantMsg(fullText, toolsUsed);
      }

      // Store final text in API history
      apiMessagesRef.current = [...apiMessagesRef.current, { role: "assistant", content: fullText || "Done." }];

      // Auto-agent loop
      if (pendingAgent?.shouldContinue && pendingAgent.nextPrompt) {
        setAgentStep((prev) => {
          const next = prev + 1;
          if (next < MAX_AGENT_STEPS) {
            setAgentStatus(`Agent working - step ${next + 1}...`);
            setTimeout(() => sendMessage(pendingAgent!.nextPrompt!, true), 400);
          } else {
            setAgentStatus(null);
            setAgentStep(0);
          }
          return next;
        });
        return;
      } else {
        setAgentStep(0);
        setAgentStatus(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorText(message);
      setMessages((prev) => [...prev, { role: "assistant", content: `Something went wrong. ${message}` }]);
      console.error("[cover-chat] Request failed", err);
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

  function triggerDownload(fullHtml: string, filename: string) {
    // Use application/octet-stream so iOS Safari downloads the file
    // rather than trying to display/navigate to it as text/html
    const blob = new Blob([fullHtml], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function escHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function downloadDraft() {
    const dateSlug = new Date().toISOString().slice(0, 10);
    const nameSlug =
      candidateName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "candidate";
    const docName = escHtml(candidateName);
    const linksLine = escHtml(joinDot([contact.github, contact.linkedin, contact.website]));
    const contactLine = escHtml(joinDot([contact.email, contact.phone]));

    if (previewMode === "resume") {
      if (!hasResumeContent) return;
      const headline = escHtml((resumeData.headline || DEFAULT_HEADLINE).replace(/\*\*/g, ""));
      const summary = escHtml(resumeData.summary || "");
      const skillsHtml = resumeData.skills && resumeData.skills.length > 0
        ? `<p style="margin:0">${resumeData.skills.map(escHtml).join(" · ")}</p>`
        : baseSkills.map((g) => `<p style="margin:0 0 4px 0"><strong>${escHtml(g.category)}:</strong> ${g.items.map(escHtml).join(", ")}</p>`).join("");
      const expHtml = resumeData.experience && resumeData.experience.length > 0
        ? resumeData.experience.map((exp) => `
<div style="margin-bottom:12px">
  <strong>${escHtml(exp.role)}</strong><span style="color:#555"> — ${escHtml(exp.company)}</span>
  <ul style="margin:4px 0 0 16px;padding:0">${exp.bullets.map((b) => `<li style="margin-bottom:2px">${escHtml(b)}</li>`).join("")}</ul>
</div>`).join("")
        : careerTimeline.map((r) => `
<div style="margin-bottom:12px">
  <div style="display:flex;justify-content:space-between"><strong>${escHtml(r.position)}</strong><span style="color:#777;font-size:9pt">${escHtml(r.yearRange)}</span></div>
  <span style="color:#555">${escHtml(r.company)}</span>
  <ul style="margin:4px 0 0 16px;padding:0">${r.responsibilities.map((rr) => `<li style="margin-bottom:2px">${escHtml(rr.text)}${rr.impact ? ` — <span style="color:#666">${escHtml(rr.impact)}</span>` : ""}</li>`).join("")}</ul>
</div>`).join("");
      const highlightsHtml = resumeData.highlights && resumeData.highlights.length > 0
        ? `<section style="margin-bottom:20px">
<h2 style="font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:8px">Role-Specific Highlights</h2>
<ul style="margin:0 0 0 16px;padding:0">${resumeData.highlights.map((h) => `<li style="margin-bottom:2px;font-size:10pt">${escHtml(h)}</li>`).join("")}</ul>
</section>` : "";
      const educationHtml = education.map((edu) => `<div style="display:flex;justify-content:space-between"><span><strong>${escHtml(edu.degree)}</strong> — ${escHtml(edu.school)}</span><span style="color:#777;font-size:9pt">${escHtml(edu.years)}</span></div>`).join("");
      const projectsSource = resumeData.projects && resumeData.projects.length > 0
        ? resumeData.projects
        : [
            { name: "Inqo", url: "inqo.io", description: "AI-powered daily trivia game built with Flutter, AWS, and Python. Top 200 iOS App Store Trivia. Reduced cloud costs by over 50%. Launched on iOS and Android." },
            { name: "Stegg", url: "stegg.io", description: "Hide any message inside any image using LSB and Spread Spectrum steganography with encryption. Built with Flutter. Launched on iOS." },
          ];
      const projectsHtml = projectsSource.map((p) => `
<div style="margin-bottom:8px">
  <div style="display:flex;justify-content:space-between"><strong>${escHtml(p.name)}</strong>${p.url ? `<span style="color:#777;font-size:9pt">${escHtml(p.url)}</span>` : ""}</div>
  <p style="margin:2px 0 0">${escHtml(p.description)}</p>
</div>`).join("");
      const certSource = resumeData.certifications && resumeData.certifications.length > 0
        ? resumeData.certifications
        : certifications;
      const certHtml = certSource.map((c) => `<li><strong>${escHtml(c.name)}</strong>${c.date ? ` - <span style="color:#555">${escHtml(c.date)}</span>` : ""}</li>`).join("");

      const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Resume - ${docName}</title>
<style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;color:#1a1a1a;font-size:10pt;line-height:1.5}
header{text-align:center;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:16px}
h1{margin:0;font-size:20pt}h2{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px 0}
section{margin-bottom:16px}ul{margin:4px 0 0 16px;padding:0}li{margin-bottom:2px}
</style></head><body>
<header>
<h1>${docName}</h1>
<p style="margin:4px 0 0;color:#555;font-size:9pt">${headline}</p>
<p style="margin:2px 0 0;color:#777;font-size:9pt">${linksLine}</p>
<p style="margin:2px 0 0;color:#777;font-size:9pt">${contactLine}</p>
</header>
${summary ? `<section><h2>Summary</h2><p style="margin:0;font-size:10pt;line-height:1.6">${summary}</p></section>` : ""}
<section><h2>Technical Skills</h2>${skillsHtml}</section>
<section><h2>Experience</h2>${expHtml}</section>
${highlightsHtml}
<section><h2>Projects</h2>${projectsHtml}</section>
<section><h2>Education</h2>${educationHtml}</section>
<section><h2>Certifications</h2><ul>${certHtml}</ul></section>
</body></html>`;

      triggerDownload(fullHtml, `${nameSlug}-resume-${dateSlug}.html`);
      return;
    }

    if (!draft.trim()) return;
    const exportDraft = normalizeLetterBody(draft);
    // Convert markdown bold/italic to HTML and preserve paragraphs
    const htmlBody = exportDraft
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const html = p
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\*([^*]+)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");
        return `<p style="margin:0 0 12px 0;line-height:1.6">${html}</p>`;
      })
      .join("\n");

    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const headline = escHtml(coverLetterData.headline || DEFAULT_HEADLINE);
    const role = escHtml(coverLetterData.role || "");
    const company = escHtml(coverLetterData.company || "");

    const pills: string[] = [];
    if (company) pills.push(`<span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:3px 10px;font-size:9pt">Company: ${company}</span>`);
    if (role) pills.push(`<span style="display:inline-block;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:999px;padding:3px 10px;font-size:9pt">Role: ${role}</span>`);
    if (coverLetterData.hiringManager) pills.push(`<span style="display:inline-block;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:999px;padding:3px 10px;font-size:9pt">Hiring Manager: ${escHtml(coverLetterData.hiringManager)}</span>`);
    if (coverLetterData.tone) pills.push(`<span style="display:inline-block;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:999px;padding:3px 10px;font-size:9pt">Tone: ${escHtml(coverLetterData.tone)}</span>`);
    const pillsHtml = pills.length ? `<div style="margin-bottom:16px">${pills.join(" ")}</div>` : "";

    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cover Letter - ${docName}</title>
<style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;color:#1a1a1a;font-size:11pt;line-height:1.6}
header{text-align:center;border-bottom:1px solid #ccc;padding-bottom:16px;margin-bottom:20px}
h1{margin:0;font-size:20pt}
.sub{color:#555;font-size:9pt;margin-top:4px}
.date{font-size:10pt;color:#444;margin-bottom:16px}
</style></head><body>
<header>
<h1>${docName}</h1>
<div class="sub">${headline}</div>
<div class="sub">${contactLine}</div>
</header>
<div class="date">${dateStr}</div>
${pillsHtml}
${htmlBody}
</body></html>`;

    triggerDownload(fullHtml, `${nameSlug}-cover-letter-${dateSlug}.html`);
  }

  function copyDraft() {
    if (!draft.trim()) return;
    navigator.clipboard.writeText(normalizeLetterBody(draft)).then(() => {
      setDraftCopied(true);
      setTimeout(() => setDraftCopied(false), 1500);
    });
  }

  const hasResumeContent = !!(
    resumeData.summary ||
    (resumeData.skills && resumeData.skills.length > 0) ||
    (resumeData.experience && resumeData.experience.length > 0) ||
    (resumeData.highlights && resumeData.highlights.length > 0)
  );

  const isThinking =
    streaming;

  // ── Password gate ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
        >
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            AI Career Agent
          </h1>
          <p className="text-sm text-gray-500 mb-6">Enter password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
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
    <>
      <div className="print:hidden min-h-screen bg-gray-100 flex flex-col">
      {/* Header bar */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-sm">AI Career Agent</span>
          <span className="text-xs text-gray-400">powered by Claude</span>
          {/* Conversation picker */}
          <div className="relative" ref={convoListRef}>
            <button
              onClick={() => setShowConvoList((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="max-w-[140px] truncate">
                {conversations.find((c) => c.id === activeConvoId)?.title || "New conversation"}
              </span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showConvoList && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-200 w-72 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <button
                    onClick={startNewChat}
                    className="w-full text-left text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                  >
                    + New conversation
                  </button>
                </div>
                {conversations.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-3">No saved conversations</p>
                ) : (
                  <div className="p-1">
                    {conversations
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors group ${
                            c.id === activeConvoId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <button
                            onClick={() => {
                              saveCurrentConvo();
                              loadConvo(c);
                            }}
                            className="flex-1 text-left truncate cursor-pointer"
                          >
                            <span className="font-medium">{c.title}</span>
                            <span className="block text-[10px] text-gray-400 mt-0.5">
                              {new Date(c.updatedAt).toLocaleDateString()} · {c.messages.length} msgs
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConvo(c.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-0.5"
                            title="Delete conversation"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={startNewChat}
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

      {/* Chat + Preview */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-[90rem] mx-auto grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5 space-y-5 h-[60vh] md:h-[68vh] overflow-y-auto">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 md:p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">AI Career Agent</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Paste a job description and Claude will auto-generate a tailored cover letter,
              then adapt your resume - all in one shot. The agent works in multiple steps
              and updates both previews automatically.
            </p>
            {errorText && <p className="text-xs text-red-600">{errorText}</p>}
          </div>

          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-20 space-y-2">
              <p className="text-2xl">✉️</p>
              <p className="font-medium text-gray-500">Start a conversation</p>
              <p>Try: &quot;Write me a cover letter and tailor my resume for a Senior AI Engineer role at Anthropic&quot;</p>
              <p>or paste a job description and say &quot;apply to this&quot;</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? renderChatMarkdown(msg.content) : msg.content}
                {msg.role === "assistant" && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                    {msg.toolsUsed.map((tool, ti) => (
                      <span
                        key={ti}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${
                          tool.name === "update_cover_letter"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tool.name === "update_resume"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span>{tool.name === "update_cover_letter" ? "✉" : tool.name === "update_resume" ? "📄" : "⚡"}</span>
                        {tool.label}
                      </span>
                    ))}
                  </div>
                )}
                {msg.role === "assistant" && msg.content && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setDraft(msg.content)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                      title="Use as draft"
                    >
                      Draft
                    </button>
                    <button
                      onClick={() => copyMessage(i, msg.content)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                      title="Copy"
                    >
                      {copied === i ? "✓" : "⎘"}
                    </button>
                  </div>
                )}
                {msg.role === "assistant" && !msg.content && streaming && (
                  <span className="animate-pulse text-gray-400">▋</span>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white shadow-sm px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{agentStatus || "Claude is thinking..."}</span>
                {agentStep > 0 && (
                  <span className="text-xs text-blue-400">({agentStep}/{MAX_AGENT_STEPS})</span>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
          </section>

          <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setPreviewMode("cover-letter")}
                  className={`px-3 py-1.5 text-xs cursor-pointer ${
                    previewMode === "cover-letter"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cover Letter
                </button>
                <button
                  onClick={() => setPreviewMode("resume")}
                  className={`px-3 py-1.5 text-xs cursor-pointer ${
                    previewMode === "resume"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Resume
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {streaming
                  ? "Updating..."
                  : previewMode === "cover-letter"
                    ? draft.trim()
                      ? "Synced"
                      : "No draft yet"
                    : resumeData.summary || (resumeData.highlights && resumeData.highlights.length > 0)
                      ? "Synced"
                      : "No tailored resume yet"}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-gray-500">
                  Name on documents
                </label>
                <button
                  type="button"
                  onClick={() => setShowContactFields((v) => !v)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {showContactFields ? "Hide contact details" : "Edit contact details"}
                </button>
              </div>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Applicant name"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showContactFields && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONTACT_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-medium text-gray-400 mb-0.5">
                        {f.label}
                      </label>
                      <input
                        type="text"
                        value={contact[f.key]}
                        onChange={(e) =>
                          setContact((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        placeholder={f.label}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(coverLetterData.company ||
              coverLetterData.role ||
              coverLetterData.hiringManager ||
              coverLetterData.tone) && (
              <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                {coverLetterData.company && (
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                    Company: {coverLetterData.company}
                  </span>
                )}
                {coverLetterData.role && (
                  <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1 border border-gray-200">
                    Role: {coverLetterData.role}
                  </span>
                )}
                {coverLetterData.hiringManager && (
                  <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1 border border-gray-200">
                    Hiring Manager: {coverLetterData.hiringManager}
                  </span>
                )}
                {coverLetterData.tone && (
                  <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1 border border-gray-200">
                    Tone: {coverLetterData.tone}
                  </span>
                )}
              </div>
            )}

            <div className="border border-gray-200 rounded-xl bg-gray-50 h-[70vh] overflow-y-auto">
              <div className="bg-white min-h-full px-5 py-6">
                {previewMode === "cover-letter" ? (
                  <>
                    <header className="text-center border-b border-gray-200 pb-3 mb-4">
                      <h3 className="text-lg font-bold tracking-tight text-gray-900">{candidateName || DEFAULT_NAME}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {renderInlineFormatting(coverLetterData.headline || DEFAULT_HEADLINE)}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {joinDot([contact.email, contact.phone])}
                      </p>
                    </header>
                    <div className="text-xs text-gray-600 mb-4 space-y-1">
                      <p>
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {(coverLetterData.company || coverLetterData.role) && (
                        <p>
                          {coverLetterData.role || "Role"}
                          {coverLetterData.company ? ` - ${coverLetterData.company}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      {draft.trim() ? (
                        renderLetterParagraphs(draft)
                      ) : (
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Ask Claude to generate a cover letter. The complete formatted document
                          preview appears here.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ── Full Resume Preview ─────────────────────── */}
                    <header className="text-center border-b border-gray-200 pb-3 mb-4">
                      <h3 className="text-lg font-bold tracking-tight text-gray-900">{candidateName || DEFAULT_NAME}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {renderInlineFormatting(resumeData.headline || DEFAULT_HEADLINE)}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {joinDot([contact.github, contact.linkedin, contact.website])}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {joinDot([contact.email, contact.phone])}
                      </p>
                    </header>

                    {sectionOrder.map((sectionId, sectionIdx) => {
                      const isFirst = sectionIdx === 0;
                      const isLast = sectionIdx === sectionOrder.length - 1;
                      if (hiddenSections.has(sectionId)) return null;

                      const moveButtons = (
                        <span className="opacity-0 group-hover/sec:opacity-100 transition-opacity flex gap-0.5 ml-auto">
                          {!isFirst && (
                            <button onClick={() => moveSection(sectionId, -1)} className="text-gray-400 hover:text-gray-700 cursor-pointer text-[10px] px-1" title="Move up">▲</button>
                          )}
                          {!isLast && (
                            <button onClick={() => moveSection(sectionId, 1)} className="text-gray-400 hover:text-gray-700 cursor-pointer text-[10px] px-1" title="Move down">▼</button>
                          )}
                          <button onClick={() => removeSection(sectionId)} className="text-gray-400 hover:text-red-500 cursor-pointer text-[10px] px-1" title="Remove section">✕</button>
                        </span>
                      );

                      const edited = (key: string) => {
                        if (key === "summary") return !!resumeData.summary;
                        if (key === "skills") return !!(resumeData.skills && resumeData.skills.length > 0);
                        if (key === "experience") return !!(resumeData.experience && resumeData.experience.length > 0);
                        if (key === "highlights") return !!(resumeData.highlights && resumeData.highlights.length > 0);
                        if (key === "projects") return !!(resumeData.projects && resumeData.projects.length > 0);
                        if (key === "certifications") return !!(resumeData.certifications && resumeData.certifications.length > 0);
                        return false;
                      };
                      const editRing = edited(sectionId) ? "ring-1 ring-blue-200 bg-blue-50/30 rounded-lg p-2 -mx-2" : "";

                      switch (sectionId) {
                        case "summary":
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Summary</h4>
                                {moveButtons}
                              </div>
                              <p className="text-xs leading-relaxed text-gray-800">{resumeData.summary || DEFAULT_SUMMARY}</p>
                            </section>
                          );

                        case "aiSystems":
                          return (
                            <section key={sectionId} className="group/sec mb-4">
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">AI Systems Experience</h4>
                                {moveButtons}
                              </div>
                              <div className="text-xs flex flex-wrap gap-x-6 gap-y-0.5 text-gray-800">
                                <span>- Multi-agent orchestration</span>
                                <span>- Retrieval-augmented generation (RAG)</span>
                                <span>- Tool-use agents</span>
                                <span>- LLM reasoning chains</span>
                              </div>
                            </section>
                          );

                        case "skills":
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Technical Skills</h4>
                                {moveButtons}
                              </div>
                              {resumeData.skills && resumeData.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {resumeData.skills.map((skill, idx) => (
                                    <span key={idx} className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 border border-blue-100">{skill}</span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs space-y-0.5 text-gray-800">
                                  {baseSkills.map((group) => (
                                    <div key={group.category}>
                                      <span className="font-semibold">{group.category}:</span> {group.items.join(", ")}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </section>
                          );

                        case "experience":
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Experience</h4>
                                {moveButtons}
                              </div>
                              {resumeData.experience && resumeData.experience.length > 0 ? (
                                <div className="space-y-3">
                                  {resumeData.experience.map((exp, idx) => (
                                    <div key={idx}>
                                      <div className="flex justify-between items-baseline">
                                        <div>
                                          <span className="font-semibold text-xs text-gray-900">{exp.role}</span>
                                          <span className="text-xs text-gray-600"> - {exp.company}</span>
                                        </div>
                                      </div>
                                      <ul className="mt-0.5 space-y-0.5 list-disc list-outside ml-4">
                                        {exp.bullets.map((b, bi) => (
                                          <li key={bi} className="text-xs leading-snug text-gray-800">{renderInlineFormatting(b)}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {careerTimeline.map((role) => (
                                    <div key={role.yearRange}>
                                      <div className="flex justify-between items-baseline">
                                        <div>
                                          <span className="font-semibold text-xs">{role.position}</span>
                                          <span className="text-xs text-gray-600"> - {role.company}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-3">{role.yearRange}</span>
                                      </div>
                                      <ul className="mt-0.5 space-y-0.5 list-disc list-outside ml-4">
                                        {role.responsibilities.map((r, i) => (
                                          <li key={i} className="text-xs leading-snug">
                                            {r.text}
                                            {r.impact && <span className="text-gray-500"> - {r.impact}</span>}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </section>
                          );

                        case "highlights":
                          if (!resumeData.highlights || resumeData.highlights.length === 0) return null;
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Role-Specific Highlights</h4>
                                {moveButtons}
                              </div>
                              <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-0.5">
                                {resumeData.highlights.map((item, idx) => (
                                  <li key={idx}>{renderInlineFormatting(item)}</li>
                                ))}
                              </ul>
                            </section>
                          );

                        case "projects":
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Projects</h4>
                                {moveButtons}
                              </div>
                              {resumeData.projects && resumeData.projects.length > 0 ? (
                                <div className="space-y-2">
                                  {resumeData.projects.map((proj, idx) => (
                                    <div key={idx}>
                                      <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-xs">{proj.name}</span>
                                        {proj.url && <span className="text-[10px] text-gray-500">{proj.url}</span>}
                                      </div>
                                      <p className="text-xs leading-snug mt-0.5 text-gray-800">{renderInlineFormatting(proj.description)}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex justify-between items-baseline">
                                      <span className="font-semibold text-xs">Inqo</span>
                                      <span className="text-[10px] text-gray-500">inqo.io</span>
                                    </div>
                                    <p className="text-xs leading-snug mt-0.5 text-gray-800">
                                      AI-powered daily trivia game built with Flutter, AWS, and Python.
                                      Top 200 iOS App Store Trivia. Reduced cloud costs by over 50%. Launched on iOS and Android.
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-baseline">
                                      <span className="font-semibold text-xs">Stegg</span>
                                      <span className="text-[10px] text-gray-500">stegg.io</span>
                                    </div>
                                    <p className="text-xs leading-snug mt-0.5 text-gray-800">
                                      Hide any message inside any image using LSB and Spread Spectrum steganography with encryption. Built with Flutter. Launched on iOS.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </section>
                          );

                        case "education":
                          return (
                            <section key={sectionId} className="group/sec mb-4">
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Education</h4>
                                {moveButtons}
                              </div>
                              {education.map((edu) => (
                                <div key={edu.school} className="flex justify-between items-baseline">
                                  <div>
                                    <span className="font-semibold text-xs">{edu.degree}</span>
                                    <span className="text-xs text-gray-600"> - {edu.school}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-500 ml-3">{edu.years}</span>
                                </div>
                              ))}
                            </section>
                          );

                        case "certifications":
                          return (
                            <section key={sectionId} className={`group/sec mb-4 ${editRing}`}>
                              <div className="flex items-center">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-1 mb-2 flex-1">Certifications</h4>
                                {moveButtons}
                              </div>
                              <ul className="text-xs space-y-0.5 text-gray-800">
                                {(resumeData.certifications && resumeData.certifications.length > 0
                                  ? resumeData.certifications
                                  : certifications
                                ).map((cert, idx) => (
                                  <li key={idx}>
                                    <span className="font-semibold">{cert.name}</span>
                                    {cert.date && <span className="text-gray-500"> - {cert.date}</span>}
                                  </li>
                                ))}
                              </ul>
                            </section>
                          );

                        default:
                          return null;
                      }
                    })}
                    {hiddenSections.size > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-400 mb-1.5">Hidden sections:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(hiddenSections).map((id) => (
                            <button
                              key={id}
                              onClick={() => restoreSection(id)}
                              className="text-[10px] text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-full px-2 py-0.5 cursor-pointer transition-colors"
                            >
                              + {id}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {streaming && (
                <div className="sticky bottom-0 inset-x-0 px-3 py-2 bg-blue-50/95 border-t border-blue-100 text-[11px] text-blue-700 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {agentStatus || "Claude is updating the preview..."}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={copyDraft}
                disabled={!draft.trim()}
                className="text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {draftCopied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadDraft}
                disabled={previewMode === "cover-letter" ? !draft.trim() : !hasResumeContent}
                className="text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Download
              </button>
              <button
                onClick={() => window.print()}
                disabled={previewMode === "cover-letter" ? !draft.trim() : !hasResumeContent}
                className="text-xs rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                PDF
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={streaming}
            placeholder="Ask anything… or paste a job description"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 max-h-40 overflow-auto"
            style={{ minHeight: "42px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
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

      {/* Print-only layout */}
      <div className="hidden print:block">
        <div className="resume-page max-w-[8.5in] mx-auto bg-white text-gray-900 px-10 py-8 print:px-0 print:py-0 print:max-w-none min-h-screen">
          <header className="text-center border-b border-gray-300 pb-4 mb-5">
            <h1 className="text-3xl font-bold tracking-tight">{candidateName || DEFAULT_NAME}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {renderInlineFormatting(
                (previewMode === "cover-letter" ? coverLetterData.headline : resumeData.headline)?.trim() ||
                  DEFAULT_HEADLINE
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {joinDot([contact.github, contact.linkedin, contact.website])}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {joinDot([contact.email, contact.phone])}
            </p>
          </header>

          {previewMode === "cover-letter" ? (
            <>
              <p className="text-sm mb-4">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <div className="space-y-4">
                {draft.trim() ? renderLetterParagraphs(draft) : "No draft selected."}
              </div>
            </>
          ) : (
            <>
              <section className="mb-5">
                <h2 className="resume-section-title">Summary</h2>
                <p className="text-sm leading-relaxed">{resumeData.summary || DEFAULT_SUMMARY}</p>
              </section>

              <section className="mb-5">
                <h2 className="resume-section-title">AI Systems Experience</h2>
                <div className="text-sm flex flex-wrap gap-x-8 gap-y-0.5">
                  <span>- Multi-agent orchestration</span>
                  <span>- Retrieval-augmented generation (RAG)</span>
                  <span>- Tool-use agents</span>
                  <span>- LLM reasoning chains</span>
                </div>
              </section>

              <section className="mb-5">
                <h2 className="resume-section-title">Technical Skills</h2>
                {resumeData.skills && resumeData.skills.length > 0 ? (
                  <p className="text-sm">{resumeData.skills.join(" · ")}</p>
                ) : (
                  <div className="text-sm space-y-1">
                    {baseSkills.map((group) => (
                      <div key={group.category}>
                        <span className="font-semibold">{group.category}:</span> {group.items.join(", ")}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mb-5">
                <h2 className="resume-section-title">Experience</h2>
                {resumeData.experience && resumeData.experience.length > 0 ? (
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-semibold text-sm">{exp.role}</span>
                            <span className="text-sm text-gray-600"> - {exp.company}</span>
                          </div>
                        </div>
                        <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4">
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} className="text-sm leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {careerTimeline.map((role) => (
                      <div key={role.yearRange}>
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-semibold text-sm">{role.position}</span>
                            <span className="text-sm text-gray-600"> - {role.company}</span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{role.yearRange}</span>
                        </div>
                        <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4">
                          {role.responsibilities.map((r, i) => (
                            <li key={i} className="text-sm leading-snug">
                              {r.text}
                              {r.impact && <span className="text-gray-500"> - {r.impact}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {resumeData.highlights && resumeData.highlights.length > 0 && (
                <section className="mb-5">
                  <h2 className="resume-section-title">Role-Specific Highlights</h2>
                  <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
                    {resumeData.highlights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mb-5">
                <h2 className="resume-section-title">Projects</h2>
                {resumeData.projects && resumeData.projects.length > 0 ? (
                  <div className="space-y-3">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm">{proj.name}</span>
                          {proj.url && <span className="text-xs text-gray-500">{proj.url}</span>}
                        </div>
                        <p className="text-sm leading-snug mt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-sm">Inqo</span>
                        <span className="text-xs text-gray-500">inqo.io</span>
                      </div>
                      <p className="text-sm leading-snug mt-0.5">
                        AI-powered daily trivia game built with Flutter, AWS, and Python. Top 200 iOS App Store Trivia. Reduced cloud costs by over 50%. Launched on iOS and Android.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-sm">Stegg</span>
                        <span className="text-xs text-gray-500">stegg.io</span>
                      </div>
                      <p className="text-sm leading-snug mt-0.5">
                        Hide any message inside any image using LSB and Spread Spectrum steganography with encryption. Built with Flutter. Launched on iOS.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <section className="mb-5">
                <h2 className="resume-section-title">Education</h2>
                {education.map((edu) => (
                  <div key={edu.school} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-sm">{edu.degree}</span>
                      <span className="text-sm text-gray-600"> - {edu.school}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">{edu.years}</span>
                  </div>
                ))}
              </section>

              <section className="mb-5">
                <h2 className="resume-section-title">Certifications</h2>
                <ul className="text-sm space-y-0.5">
                  {(resumeData.certifications && resumeData.certifications.length > 0
                    ? resumeData.certifications
                    : certifications
                  ).map((cert, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{cert.name}</span>
                      {cert.date && <span className="text-gray-500"> - {cert.date}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
