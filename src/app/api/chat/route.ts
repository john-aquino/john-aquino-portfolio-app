import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export const maxDuration = 60;

const BASE_SYSTEM_PROMPT = `You are John Aquino's AI career assistant. You help John craft tailored cover letters and answer job-application-related questions on his behalf.

## About John

**John Aquino** is an AI systems engineer.

**Summary:** AI systems engineer with 6+ years at Vanguard building production backend and cloud systems. Currently developing multi-agent orchestration, RAG pipelines, and LLM infrastructure on AWS at enterprise scale. Python-focused. Independently shipped mobile apps to iOS and Android.

**Links:**
- GitHub: github.com/john-aquino
- LinkedIn: linkedin.com/in/john-a-aquino
- Portfolio: johnaquino.com

---

## Career

### Application Engineer III — Vanguard (Mar 2025 – Present)
Tags: AI/LLMs, RAG, LangChain, AWS Bedrock, Observability

- Engineered Python-based AI service infrastructure on AWS to support scalable agent workflows, integrating Bedrock models, retrieval pipelines, and internal APIs into production-ready systems.
- Built core components of a multi-agent AI system using LangChain and AWS Bedrock to orchestrate agents that gather, synthesize, and analyze enterprise data. Impact: Reduced research turnaround time by up to 3 weeks.
- Implemented RAG pipelines using Pinecone and Neptune GraphRAG to provide grounded, context-aware responses from internal knowledge bases and document stores.
- Designed the agent orchestration layer with tool-use patterns, enabling agents to query internal APIs, parse documents, and chain reasoning steps. Impact: Autonomously answering complex business questions.
- Shipped AI-powered call center bots that automated customer support workflows and reduced live-agent call volume.
- Built production support observability dashboards for real-time system health monitoring and faster incident triage.

### Application Engineer II — Vanguard (Mar 2023 – Mar 2025)
Tags: Angular, Spring Boot, AWS, Python, Splunk

- Designed and developed web applications using Angular, Python Lambdas, and Spring Boot for backend services and customer-facing workflows.
- Migrated legacy mainframe data to AWS cloud infrastructure serving users holding over $1 trillion in assets.
- Modernized call center infrastructure, reducing agent call volume and lowering operational costs.
- Acted as Site Reliability Champion, leading system availability, performance monitoring, and incident response.
- Mentored junior engineers, fostering professional growth and improving team productivity.
- Developed and demoed an AWS Bedrock Generative UI POC to leadership. Impact: Led directly to production AI products built from the initial POC.

### Application Engineer I — Vanguard (Jun 2020 – Mar 2023)
Tags: Angular, REST APIs, Responsive Design

- Built a high-value transactions web application with enhanced security and reliability for Vanguard's institutional and retail clients.
- Led delivery of the mobile-responsive Angular experience for the transactions platform. Impact: Enabled secure high-value transactions from mobile browsers across iOS and Android.

---

## Projects

### Inqo (inqo.io)
AI-powered daily trivia game built with Flutter, AWS, and Python. Reached Top 200 in the iOS App Store Trivia category. Automated infrastructure with CloudFormation. Reduced cloud costs by over 50%. Launched on iOS and Android.

### Stegg (stegg.io)
Solving the problem of covert communication — lets users hide any message inside any image. Built with Flutter using LSB and Spread Spectrum steganography with encryption for data integrity. Launched on iOS.

---

## Technical Skills

- **Primary Languages:** Python (primary), Java, TypeScript/JavaScript, Dart
- **AI & Data:** Pinecone, Neptune (GraphRAG), Bedrock
- **Frameworks & Libraries:** LangChain, Spring Boot, Angular, Next.js, React, Flutter
- **Cloud & DevOps:** Lambda, ECS, API Gateway, DynamoDB, S3, Cognito, EC2, Step Functions, SQS, SNS, CloudWatch, CloudFormation, CI/CD
- **Monitoring & Logging:** Sentry, Splunk, AWS CloudWatch

---

## Certifications
- AWS Certified AI Practitioner (Jan 2025)
- AWS Certified Developer – Associate (Dec 2022)
- AWS Certified Cloud Practitioner (Aug 2022)

---

## Education
- B.S. in Computer Science — University of Georgia (2016–2020)
  Relevant Coursework: Cyber Security, Linear Algebra, Evolutionary Computation

---

## John's Voice & Style

When writing cover letters or professional content for John, match his voice:
- **Direct and confident** — no hedging, no fluff. Get to the point fast.
- **Results-focused** — ties work to outcomes and real impact numbers.
- **Technically precise** — uses specific terms (multi-agent, RAG, LangChain, Bedrock) naturally, not as buzzwords to impress.
- **Entrepreneur energy** — he independently ships real products to app stores. He's a maker, not just an employee.
- **Professional but human** — reads like a sharp engineer wrote it, not a PR team.
- Avoid clichés like "I am writing to express my interest in..." or "I would be a great fit".
- Keep paragraphs tight — 3–5 sentences max. Shorter is better.
- Don't over-explain. Trust the reader to connect the dots.
- Do not sound like generic AI writing.
- Avoid buzzword stuffing, vague claims, and repetitive sentence templates.
- Avoid robotic transitions like "Furthermore", "Additionally", "Moreover" unless truly natural.
- Prefer plain, concrete wording and specifics over abstract phrasing.

---

## Your Instructions

- Help John write tailored cover letters for specific roles and companies.
- Answer career-related questions on John's behalf (e.g., "how should I answer X interview question?").
- When writing a cover letter:
  - If no company or role is provided, ask for them first.
  - If a job description is provided, extract the top 3-5 requirements and explicitly align each to John's relevant experience and outcomes.
  - If a job description is not provided, ask for one before generating a final draft.
  - Tailor the letter — emphasize the experience most relevant to the role.
  - Use concrete evidence from John's background (teams, systems, outcomes, and tools), not generic claims.
  - Do not invent companies, metrics, roles, timelines, or tools that are not in John's profile.
  - Keep it to ~4 focused paragraphs.
  - Keep each paragraph tight and skimmable.
  - Use this structure by default unless asked otherwise:
    1) Role + why John is a fit.
    2) Most relevant AI/LLM work with impact.
    3) Additional relevant backend/cloud or product depth.
    4) Confident close.
  - End with a confident, brief closing. Always end the cover letter body with a sign-off like "Sincerely,\n\nJohn Aquino" (or another appropriate closing).
  - Use real newline characters for formatting. Separate paragraphs with a blank line. Do not output literal tokens like "/n" or "\\n" in the letter text.
  - Output clean text (no markdown bullet points or headers inside the letter body) unless asked otherwise.
- Prefer this tone calibration:
  - Direct, practical, and specific.
  - Confident without sounding inflated.
  - Technical but readable by recruiting and hiring managers.
- If the user asks for alternatives, provide 2 versions:
  - Version A: concise (~180-220 words)
  - Version B: fuller (~260-340 words)
- If asked to iterate or improve a letter, do so without requiring a full re-prompt.
- NEVER use em dash or en dash characters in any field (forbidden: \`—\` and \`–\`). Use commas, parentheses, colon, or simple hyphen \`-\` instead.
- Today's date is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
- Reply naturally in text. Use the provided tools to update the cover letter preview, resume preview, or plan multi-step workflows. You can call multiple tools in a single response.
- When user asks to "write a cover letter" or "apply to this role", default to a multi-step agent flow: cover letter first, then resume tailoring, then final polish. Use plan_next_step to chain steps.
- When updating the resume, use update_resume to set fields. The resume preview shows the FULL resume (Summary, AI Systems, Skills, Experience, Projects, Education, Certifications). Fields you set override the corresponding sections in-place. Sections you don't set show the base data. The overridden sections get a subtle blue highlight.
- You can reorder resume sections via update_resume's sectionOrder. Valid IDs: "summary", "aiSystems", "skills", "experience", "highlights", "projects", "education", "certifications". Put the most role-relevant sections first.
- resume experience should follow the structure: { company, role, bullets[] }. Each entry represents a position with tailored bullet points. Rewrite John's actual experience bullets to emphasize what matters most for the target role. Keep company names and role titles factual. Only rewrite or reorder the responsibilities - never invent roles, companies, or timelines.
- resume skills should be the top 6-10 skills most relevant to the target role.
- You CAN tailor the Projects and Certifications sections via update_resume's "projects" and "certifications" fields. Setting them overrides the base entries in-place; leaving them unset keeps the base data. Projects follow { name, url (optional), description }. Certifications follow { name, date (optional) }. Only reorder, rewrite, or curate the applicant's real projects and certifications for relevance; do not invent ones the applicant does not have.
- coverLetter letter may include inline markdown emphasis like **bold** and *italic*; keep formatting tasteful and professional.
- Always end the cover letter body with a sign-off like "Sincerely,\\n\\nJohn Aquino".`;

const CONTEXT_FILES = [
  "src/data/portfolio.tsx",
  "src/components/Hero.tsx",
  "src/app/resume/page.tsx",
  "src/app/page.tsx",
];

const MAX_FILE_CHARS = 12000;
const MAX_CONTEXT_CHARS = 30000;

async function buildWorkspaceContext() {
  const root = process.cwd();
  let total = 0;
  const blocks: string[] = [];

  for (const relPath of CONTEXT_FILES) {
    try {
      const absPath = path.join(root, relPath);
      const raw = await readFile(absPath, "utf-8");
      const trimmed = raw.slice(0, MAX_FILE_CHARS);
      const nextBlock = `### ${relPath}\n\n${trimmed}`;

      if (total + nextBlock.length > MAX_CONTEXT_CHARS) {
        break;
      }

      blocks.push(nextBlock);
      total += nextBlock.length;
    } catch {
      // Keep request flow resilient if a file moves or is temporarily unavailable.
    }
  }

  if (blocks.length === 0) {
    return "No workspace profile files were loaded.";
  }

  return blocks.join("\n\n---\n\n");
}

function stripForbiddenDashes(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/[—–]/g, " - ").replace(/\s{2,}/g, " ").trim();
  }
  if (Array.isArray(value)) {
    return value.map(stripForbiddenDashes);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = stripForbiddenDashes(v);
    }
    return out;
  }
  return value;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const password = req.headers.get("x-cover-password");
  if (!password || password !== process.env.COVER_LETTER_PASSWORD) {
    console.warn(`[cover-chat:${requestId}] Unauthorized request`);
    return new Response("Unauthorized", { status: 401 });
  }

  if (!apiKey) {
    console.error(
      `[cover-chat:${requestId}] Missing ANTHROPIC_API_KEY; verify .env.local and restart dev server`
    );
    return new Response("Server misconfigured: missing ANTHROPIC_API_KEY", {
      status: 500,
    });
  }

  let messages: Anthropic.MessageParam[];
  let applicantName = "John Aquino";
  try {
    const body = await req.json();
    messages = body.messages;
    if (typeof body.name === "string" && body.name.trim()) {
      applicantName = body.name.trim().replace(/[—–]/g, " - ").slice(0, 80);
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn(`[cover-chat:${requestId}] Bad request: missing messages array`);
      return new Response("Bad request", { status: 400 });
    }
  } catch {
    console.warn(`[cover-chat:${requestId}] Bad request: invalid JSON body`);
    return new Response("Bad request", { status: 400 });
  }

  const workspaceContext = await buildWorkspaceContext();
  const nameOverride = `\n\n## Applicant Name (override)\n\nThe applicant's name is "${applicantName}". Refer to the applicant by this name, and sign every cover letter as "Sincerely,\n\n${applicantName}". Do not use "John Aquino" unless that is the applicant's name.`;
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n## Live Workspace Context\n\nUse this up-to-date source of truth from the portfolio codebase for tailoring and factual grounding:\n\n${workspaceContext}${nameOverride}`;

  console.info(
    `[cover-chat:${requestId}] Start: messages=${messages.length}, contextChars=${workspaceContext.length}`
  );

  const client = new Anthropic({ apiKey });

  const tools: Anthropic.Tool[] = [
    {
      name: "update_cover_letter",
      description: "Update cover letter metadata and/or the letter body in the live preview. Only include fields that should be added or changed.",
      input_schema: {
        type: "object" as const,
        properties: {
          company: { type: "string", description: "Target company name" },
          role: { type: "string", description: "Target role/position title" },
          hiringManager: { type: "string", description: "Name of the hiring manager if known" },
          tone: { type: "string", description: "Tone of the letter (e.g. confident, conversational)" },
          headline: { type: "string", description: "Professional headline/tagline for the header" },
          letter: { type: "string", description: "The full cover letter body text. May include **bold** and *italic* markdown." },
        },
        required: [],
      },
    },
    {
      name: "update_resume",
      description: "Update tailored resume sections in the live preview. Only include fields that should be changed. Unchanged sections keep their base data.",
      input_schema: {
        type: "object" as const,
        properties: {
          headline: { type: "string", description: "Professional headline for the resume header" },
          summary: { type: "string", description: "Tailored professional summary (2-3 sentences)" },
          highlights: {
            type: "array",
            items: { type: "string" },
            description: "Key highlights or achievements to feature",
          },
          skills: {
            type: "array",
            items: { type: "string" },
            description: "Top 6-10 skills most relevant to the target role",
          },
          experience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                role: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
              },
              required: ["company", "role", "bullets"],
            },
            description: "Tailored experience entries with rewritten bullets",
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string", description: "Optional project URL/domain (e.g. example.io)" },
                description: { type: "string" },
              },
              required: ["name", "description"],
            },
            description: "Tailored project entries. Overrides the base Projects section in the resume preview.",
          },
          certifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                date: { type: "string", description: "Optional date earned (e.g. Jan 2025)" },
              },
              required: ["name"],
            },
            description: "Tailored certification entries. Overrides the base Certifications section in the resume preview.",
          },
          sectionOrder: {
            type: "array",
            items: { type: "string" },
            description: "Reorder resume sections. Valid IDs: summary, aiSystems, skills, experience, highlights, projects, education, certifications",
          },
        },
        required: [],
      },
    },
    {
      name: "plan_next_step",
      description: "Signal that more work is needed. The client will auto-fire the nextPrompt to continue the workflow. Use for multi-step flows like: cover letter -> resume summary -> skills/experience.",
      input_schema: {
        type: "object" as const,
        properties: {
          nextPrompt: {
            type: "string",
            description: "The prompt to auto-send for the next step of the workflow",
          },
        },
        required: ["nextPrompt"],
      },
    },
  ];

  const TOOL_LABELS: Record<string, string> = {
    update_cover_letter: "Updated cover letter",
    update_resume: "Updated resume",
    plan_next_step: "Planning next step",
  };

  // SSE streaming tool-use loop: emit events as tools are called so the client updates in real-time
  const MAX_TOOL_ROUNDS = 3;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: string, data: unknown) {
        const sanitized = stripForbiddenDashes(data);
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(sanitized)}\n\n`)
        );
      }

      try {
        let currentMessages: Anthropic.MessageParam[] = [...messages];

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const response = await client.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 4096,
            system: systemPrompt,
            messages: currentMessages,
            tools,
          });

          // Emit text blocks as they arrive
          for (const block of response.content) {
            if (block.type === "text" && block.text.trim()) {
              emit("text", { content: block.text.trim() });
            }
          }

          // Emit each tool call individually
          const roundToolCalls = response.content.filter(
            (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
          );

          for (const call of roundToolCalls) {
            const input = call.input as Record<string, unknown>;
            const label = TOOL_LABELS[call.name] || call.name;

            switch (call.name) {
              case "update_cover_letter":
                emit("tool", { name: call.name, label, coverLetter: input });
                break;
              case "update_resume":
                emit("tool", { name: call.name, label, resume: input });
                break;
              case "plan_next_step":
                emit("tool", {
                  name: call.name,
                  label,
                  agent: { shouldContinue: true, nextPrompt: input.nextPrompt },
                });
                break;
            }
          }

          // If Claude is done (no tool calls or stop_reason is end_turn), break
          if (roundToolCalls.length === 0 || response.stop_reason === "end_turn") {
            break;
          }

          // Send tool results back so Claude can continue
          currentMessages = [
            ...currentMessages,
            { role: "assistant", content: response.content },
            {
              role: "user",
              content: roundToolCalls.map((call) => ({
                type: "tool_result" as const,
                tool_use_id: call.id,
                content: "Done.",
              })),
            },
          ];
        }

        emit("done", {});
        console.info(
          `[cover-chat:${requestId}] Complete: durationMs=${Date.now() - startedAt}`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error(`[cover-chat:${requestId}] Error:`, msg);
        emit("error", { message: msg });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
