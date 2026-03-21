import { DocumentationNode, Pillar } from '@codeatlas/shared-schema';
import { Layers, BookOpen, Terminal, Zap, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// ─── Content parsing helpers ──────────────────────────────────────────────────

/**
 * Splits description into bullet responsibilities by looking for sentence
 * boundaries, numbered lists, or dash-prefixed lines.
 */
function extractResponsibilities(content: string): string[] {
  // Try splitting on numbered list: "1. foo 2. bar"
  const numbered = content.match(/\d+\.\s+([^0-9.][^.]+\.?)/g);
  if (numbered && numbered.length >= 2) {
    return numbered.map(s => s.replace(/^\d+\.\s+/, '').trim()).slice(0, 5);
  }

  // Try dash/bullet lines
  const dashed = content.match(/[-•]\s+([^\n\-•]+)/g);
  if (dashed && dashed.length >= 2) {
    return dashed.map(s => s.replace(/^[-•]\s+/, '').trim()).slice(0, 5);
  }

  // Fall back: split on ". " and take meaningful sentences
  return content
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 160)
    .slice(0, 4)
    .map(s => (s.endsWith('.') ? s : `${s}.`));
}

/**
 * Extracts tech/tool keywords from the description text.
 * Looks for capitalized words, known framework names, and acronyms.
 */
const TECH_PATTERNS = [
  // Known frameworks/tools
  /\b(React|Next\.?js|Vue|Angular|Svelte|Tailwind|TypeScript|JavaScript|Node\.?js|Express|Fastify|Prisma|Supabase|PostgreSQL|MySQL|MongoDB|Redis|GraphQL|REST|tRPC|Zod|Vite|Webpack|ESLint|Jest|Vitest|Docker|Kubernetes|AWS|Vercel|Stripe|OAuth|JWT|WebSocket|Gemini|OpenAI|Langchain)\b/gi,
  // Capitalized multi-word tech terms
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g,
  // ALL_CAPS acronyms 2-6 chars
  /\b([A-Z]{2,6})\b/g,
];

function extractTechTags(content: string): string[] {
  const found = new Set<string>();
  for (const pattern of TECH_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const word = (match[1] ?? match[0]).trim();
      // Filter out common non-tech caps words
      if (
        ![
          'The',
          'This',
          'That',
          'With',
          'From',
          'And',
          'For',
          'Are',
          'Has',
        ].includes(word)
      ) {
        found.add(word);
      }
    }
  }
  return Array.from(found).slice(0, 8);
}

// ─── Components ───────────────────────────────────────────────────────────────

interface OverviewProps {
  summary: string;
  quickStart: string;
  pillars: Pillar[];
  onSelectPillar: (index: number) => void;
}

export function OverviewSection({
  summary,
  quickStart,
  pillars,
  onSelectPillar,
}: OverviewProps) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <section>
        <SectionHeader
          icon={<BookOpen className="h-5 w-5" />}
          title="Project Summary"
        />
        <p className="mt-3 text-slate-300 leading-relaxed text-[15px]">
          {summary}
        </p>
      </section>

      <Separator className="bg-slate-800" />

      {/* Quick Start */}
      <section>
        <SectionHeader
          icon={<Terminal className="h-5 w-5" />}
          title="Quick Start"
        />
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-4 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {quickStart}
        </div>
      </section>

      <Separator className="bg-slate-800" />

      {/* Pillars grid */}
      {pillars.length > 0 && (
        <section>
          <SectionHeader
            icon={<Layers className="h-5 w-5" />}
            title="Architecture Pillars"
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((pillar, i) => {
              const tags = extractTechTags(pillar.description);
              return (
                <Card
                  key={i}
                  onClick={() => onSelectPillar(i)}
                  className="cursor-pointer border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all group"
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {pillar.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <CardDescription className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {pillar.description}
                    </CardDescription>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 4).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

interface PillarDetailProps {
  pillar: Pillar;
  nodes: DocumentationNode[];
}

export function PillarDetail({ pillar, nodes }: PillarDetailProps) {
  const responsibilities = extractResponsibilities(pillar.description);
  const tags = extractTechTags(pillar.description);
  const childNodes = nodes.filter(n => n.type === 'FILE_DOC');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <SectionHeader
          icon={<Layers className="h-5 w-5" />}
          title={pillar.name}
        />
        <p className="mt-2 text-slate-400 leading-relaxed text-[15px]">
          {pillar.description}
        </p>
      </div>

      <Separator className="bg-slate-800" />

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Responsibilities
            </h3>
          </div>
          <ul className="space-y-2">
            {responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">{r}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tech tags */}
      {tags.length > 0 && (
        <>
          <Separator className="bg-slate-800" />
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Technologies
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {/* FILE_DOC child nodes */}
      {childNodes.length > 0 && (
        <>
          <Separator className="bg-slate-800" />
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Documentation
            </h3>
            {childNodes.map(node => (
              <div
                key={node.id}
                className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-4 space-y-1.5"
              >
                <p className="text-sm font-semibold text-white">{node.title}</p>
                {node.content && (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {node.content}
                  </p>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-indigo-400">{icon}</span>
      <h2 className="text-lg font-semibold text-white tracking-tight">
        {title}
      </h2>
    </div>
  );
}
