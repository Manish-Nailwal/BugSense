import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../features/landing/Footer';
import {
  MANISH_LABS_URL,
  PORTFOLIO_URL,
  CREATOR,
  SOCIAL_LINKS,
  ECOSYSTEM,
} from '../config/links';
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Library,
  Brain,
  BarChart3,
  ShieldCheck,
  Zap,
  Sparkles,
  Cpu,
  Boxes,
  Github,
  Linkedin,
  Twitter,
  Mail,
} from 'lucide-react';

const SOCIAL_ICON = { github: Github, linkedin: Linkedin, twitter: Twitter, mail: Mail };

const FEATURES = [
  { icon: Brain, title: 'AI stack-trace diagnostics', body: 'Paste a raw error, log, or stack trace and Trace explains what is actually going wrong — in plain English, not jargon.' },
  { icon: Sparkles, title: 'Socratic guidance', body: 'Instead of dumping a fix, Trace guides you with questions and mental models, so the lesson sticks long after the bug is gone.' },
  { icon: BarChart3, title: 'Growth analytics & skill gaps', body: 'Your dashboard surfaces recurring error patterns and the exact skills — with official docs — to close each gap.' },
  { icon: Library, title: 'Shared knowledge library', body: 'Turn a solved bug into a clean, SEO-friendly write-up that other developers can learn from.' },
  { icon: Zap, title: 'Deep Mode', body: 'When a bug is gnarly, switch on Deep Mode for an exhaustive, multi-hypothesis root-cause analysis.' },
  { icon: ShieldCheck, title: 'Privacy-first', body: 'Your logs are processed to help you debug — never sold. You stay in control of your data.' },
];

const STEPS = [
  { n: '01', title: 'Paste your error', body: 'Drop a stack trace or log, or just describe the behaviour you are seeing.' },
  { n: '02', title: 'Understand the cause', body: 'Trace breaks it down Socratically with mental models and the most likely root cause.' },
  { n: '03', title: 'Confirm your fix', body: 'Mark what worked. It quietly feeds your growth analytics and skill recommendations.' },
  { n: '04', title: 'Share the lesson', body: 'Optionally publish a polished write-up to the shared Library for the next developer.' },
];

const STATS = [
  { value: '450ms', label: 'Avg scan speed' },
  { value: '98.4%', label: 'Root-cause accuracy' },
  { value: '1.2k+', label: 'Developers' },
];

const SectionLabel = ({ children, className = '' }) => (
  <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-violet-400 ${className}`}>
    {children}
  </span>
);

const AboutPage = () => {
  return (
    <div className="w-full bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-500">

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-28 md:pt-36 pb-16 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/40 dark:bg-violet-900/10 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mb-6">
          <Cpu size={13} className="text-indigo-600 dark:text-violet-400" />
          <span className="text-[11px] font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">About Trace</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Debugging that teaches you,{' '}
          <span className="text-zinc-400 dark:text-zinc-500">not just fixes you.</span>
        </h1>
        <p className="mt-6 text-[15px] md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Trace is an interactive, Socratic debugging platform. It turns cryptic exceptions and runtime
          stack traces into clear mental models — so you not only fix the bug, you understand why it
          happened and grow as an engineer.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Start debugging <ArrowRight size={15} />
          </Link>
          <Link
            to="/guide"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-violet-700 transition-all"
          >
            <BookOpen size={15} /> Read the Guide
          </Link>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-violet-700 transition-all"
          >
            <Library size={15} /> Browse the Library
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{s.value}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is Trace — features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-100 dark:border-zinc-900/80">
        <div className="max-w-2xl mb-10">
          <SectionLabel>What is Trace</SectionLabel>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Built for understanding, not copy-paste.</h2>
          <p className="mt-3 text-[14.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Most tools hand you a fix and move on. Trace is designed to make you a better debugger every
            time you use it — combining instant AI diagnostics with a teaching-first approach.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 hover:border-indigo-300/60 dark:hover:border-violet-800/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-violet-500/10 flex items-center justify-center text-indigo-600 dark:text-violet-400 mb-4">
                <f.icon size={19} />
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-100 dark:border-zinc-900/80">
        <div className="max-w-2xl mb-10">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">From error to insight in four steps.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="p-6 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="text-[11px] font-bold tracking-widest text-indigo-600 dark:text-violet-400 mb-3">{s.n}</div>
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Quick links to Guide + Library */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Link to="/guide" className="group flex items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 hover:border-indigo-300/60 dark:hover:border-violet-800/60 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-violet-400"><BookOpen size={20} /></div>
              <div>
                <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">The System Guide</p>
                <p className="text-[12px] text-zinc-500">Learn how to get the most out of Trace.</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-all" />
          </Link>
          <Link to="/library" className="group flex items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 hover:border-indigo-300/60 dark:hover:border-violet-800/60 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-violet-400"><Library size={20} /></div>
              <div>
                <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">The Shared Library</p>
                <p className="text-[12px] text-zinc-500">Browse real fixes written by the community.</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-all" />
          </Link>
        </div>
      </section>

      {/* Part of Manish Labs */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-100 dark:border-zinc-900/80">
        <div className="max-w-2xl mb-10">
          <SectionLabel>The bigger picture</SectionLabel>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Part of Manish Labs.</h2>
          <p className="mt-3 text-[14.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Trace is one node of <span className="font-medium text-zinc-700 dark:text-zinc-200">Manish Labs</span> — a digital
            laboratory and ecosystem by {CREATOR.name}, built to design, deploy, and benchmark fast,
            beautifully-crafted web products. Each project under the lab is a distinct experiment in
            performance, UI, and architecture.
          </p>
          <a
            href={MANISH_LABS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-violet-400 hover:gap-2.5 transition-all"
          >
            Explore the ecosystem <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ECOSYSTEM.map((node) => (
            <a
              key={node.name}
              href={node.url}
              target="_blank"
              rel="noreferrer"
              className="group p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 hover:border-indigo-300/60 dark:hover:border-violet-800/60 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-violet-400"><Boxes size={17} /></div>
                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-400">{node.status}</span>
              </div>
              <p className="text-[14px] font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                {node.name}
                <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-60 -translate-y-0.5 transition-all" />
              </p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{node.tagline}</p>
            </a>
          ))}
        </div>
      </section>

      {/* The creator */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-100 dark:border-zinc-900/80">
        <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-2xl font-black">
              {CREATOR.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
          </div>
          <div className="flex-1">
            <SectionLabel>Who builds Trace</SectionLabel>
            <h2 className="mt-2 text-xl md:text-2xl font-bold tracking-tight">{CREATOR.name}</h2>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mt-1">{CREATOR.role}</p>
            <p className="mt-3 text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">{CREATOR.bio}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[13px] font-semibold hover:opacity-90 transition-all"
              >
                View portfolio <ArrowUpRight size={14} />
              </a>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = SOCIAL_ICON[s.icon] || Mail;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.icon === 'mail' ? undefined : '_blank'}
                      rel="noreferrer"
                      aria-label={s.label}
                      data-tooltip={s.label}
                      className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 hover:text-indigo-600 dark:hover:text-violet-400 hover:border-indigo-300 dark:hover:border-violet-700 transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
