import { ShieldCheck, BrainCircuit, GitBranch } from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Code Understanding',
    description:
      'Instantly understand unfamiliar repositories with AI generated explanations and summaries.',
  },
  {
    icon: ShieldCheck,
    title: 'Security Signals',
    description:
      'Detect risky patterns and potential vulnerabilities across your project.',
  },
  {
    icon: GitBranch,
    title: 'Architecture Mapping',
    description:
      'Explore project structure, dependencies, and relationships visually.',
  },
];

export default function Features() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-14">
          Built for developers
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <div
                key={i}
                className="group rounded-xl border border-slate-800 bg-black/40 p-6 hover:border-indigo-500/40 hover:bg-slate-900 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
