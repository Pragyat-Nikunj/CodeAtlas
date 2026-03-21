'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DocumentationNode,
  SecurityFinding,
  StructuralManifest,
} from '@codeatlas/shared-schema';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import env from '@/lib/env';
// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

interface DocsChatProps {
  manifest: StructuralManifest;
  nodes: DocumentationNode[];
  findings: SecurityFinding[];
}

// ─── Context builder ──────────────────────────────────────────────────────────

function buildSystemContext(
  manifest: StructuralManifest,
  nodes: DocumentationNode[],
  findings: SecurityFinding[]
): string {
  const pillarDocs = manifest.pillars
    .map(p => `### ${p.name}\n${p.description}`)
    .join('\n\n');

  const fileDocs = nodes
    .filter(n => n.type === 'FILE_DOC' && n.content)
    .map(n => `### ${n.title}\n${n.content}`)
    .join('\n\n');

  const securityDocs =
    findings.length === 0
      ? 'No security findings.'
      : findings
          .map(
            f =>
              `- [${f.severity}] ${f.file_path}${f.line_number ? `:${f.line_number}` : ''} — ${f.description}${f.suggested_fix ? ` Fix: ${f.suggested_fix}` : ''}`
          )
          .join('\n');

  return `You are an expert code assistant for the repository "${manifest.projectName}".
You have full knowledge of this codebase based on the documentation below.
Answer questions clearly and concisely. If asked about code, be specific.
If something is not covered in the docs, say so honestly — do not hallucinate.

## Project Summary
${manifest.highLevelSummary}

## Quick Start
${manifest.quickStart}

## Architecture Pillars
${pillarDocs}

${fileDocs ? `## File Documentation\n${fileDocs}` : ''}

## Security Findings
${securityDocs}`;
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function askGemini(
  systemContext: string,
  history: Message[],
  userMessage: string
): Promise<string> {
  const apiKey = env.geminiApiKey;
  if (!apiKey) throw new Error('Gemini API key not configured.');

  // Build conversation history for Gemini
  const contents = [
    // Inject system context as first user turn (Gemini Flash Lite doesn't have system role)
    {
      role: 'user',
      parts: [
        {
          text: `[SYSTEM CONTEXT — do not repeat this back]\n${systemContext}`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Understood. I have full context of this codebase. Ask me anything.',
        },
      ],
    },
    // Previous messages
    ...history
      .filter(m => !m.loading)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    // Current message
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from model.'
  );
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Summarize this project',
  'What are the main architecture pillars?',
  'Are there any critical security issues?',
  'How do I get started?',
];

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'h-7 w-7 rounded-full shrink-0 flex items-center justify-center mt-0.5',
          isUser ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-indigo-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
        )}
      >
        {message.loading ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DocsChat({ manifest, nodes, findings }: DocsChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const systemContext = useRef(buildSystemContext(manifest, nodes, findings));

  // Rebuild context if data changes
  useEffect(() => {
    systemContext.current = buildSystemContext(manifest, nodes, findings);
  }, [manifest, nodes, findings]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError('');
      setInput('');

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      };

      const loadingMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        loading: true,
      };

      setMessages(prev => [...prev, userMsg, loadingMsg]);
      setLoading(true);

      try {
        const reply = await askGemini(
          systemContext.current,
          [...messages, userMsg],
          trimmed
        );

        setMessages(prev =>
          prev.map(m =>
            m.id === loadingMsg.id
              ? { ...m, content: reply, loading: false }
              : m
          )
        );
      } catch (err: unknown) {
        setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
        setError((err as Error)?.message ?? 'Something went wrong.');
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <aside
      className={cn(
        'hidden xl:flex flex-col border-l border-slate-800 bg-slate-950/60 sticky top-16 transition-all duration-300',
        collapsed ? 'w-12' : 'w-80',
        'h-[calc(100vh-4rem)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">Ask AI</span>
            <span className="text-[10px] text-slate-600 font-mono">Gemini</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1 rounded text-slate-600 hover:text-slate-300 transition-colors"
        >
          {collapsed ? (
            <Sparkles className="h-4 w-4 text-indigo-400" />
          ) : (
            <ChevronDown className="h-4 w-4 rotate-90" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="h-10 w-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-slate-300">
                    Ask anything about this repo
                  </p>
                  <p className="text-xs text-slate-600">
                    Architecture, security, usage — I know it all.
                  </p>
                </div>

                {/* Suggestions */}
                <div className="w-full space-y-1.5 pt-1">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs text-slate-400 border border-slate-800 bg-slate-900/40 rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(m => <MessageBubble key={m.id} message={m} />)
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-xs text-red-400 flex-1">{error}</p>
                <button onClick={() => setError('')}>
                  <X className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 p-3 shrink-0">
            <div className="flex items-end gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 focus-within:border-slate-700 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this repo…"
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none outline-none min-h-[20px] max-h-[120px] leading-5 disabled:opacity-50"
                style={{ height: 'auto' }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
              <Button
                size="icon"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="h-7 w-7 shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-700 text-center">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
