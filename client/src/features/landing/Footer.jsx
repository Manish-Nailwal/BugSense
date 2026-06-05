import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Twitter, Mail, Cpu } from 'lucide-react';
import { MANISH_LABS_URL, SOCIAL_LINKS } from '../../config/links';

const SOCIAL_ICON = { github: Github, linkedin: Linkedin, twitter: Twitter, mail: Mail };
const githubLink = SOCIAL_LINKS.find((s) => s.icon === 'github');

const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-zinc-200/60 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#09090b] w-full text-zinc-650 dark:text-zinc-450 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-10 bottom-0 w-80 h-80 bg-zinc-100 dark:bg-zinc-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 text-left">

        {/* Brand Column (Spans 4 cols) */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 text-white dark:text-zinc-950" />
            </div>
            <span className="font-bold text-sm tracking-wider text-zinc-900 dark:text-white uppercase">Trace</span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm">
            Interactive, Socratic diagnostic platform that turns exceptions and complex runtime stacks into structured mental learning maps. Created by{' '}
            <a
              href={MANISH_LABS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors"
            >
              Manish Labs
            </a>.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2.5 pt-1">
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
                  className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 hover:text-indigo-600 dark:hover:text-violet-400 hover:border-indigo-300 dark:hover:border-violet-700 transition-all"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Spacing spacer (Spans 1 col on desktop) */}
        <div className="hidden md:block md:col-span-1" />

        {/* Product Column (Spans 2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">Product</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center group/item"
              >
                <span className="transition-transform group-hover/item:translate-x-1">Debugger Engine</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center group/item"
              >
                <span className="transition-transform group-hover/item:translate-x-1">Analytics Engine</span>
              </Link>
            </li>
            <li>
              <Link
                to="/library"
                className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center group/item"
              >
                <span className="transition-transform group-hover/item:translate-x-1">Shared Library</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources Column (Spans 2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">Resources</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/about"
                className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center group/item"
              >
                <span className="transition-transform group-hover/item:translate-x-1">About Trace</span>
              </Link>
            </li>
            <li>
              <Link
                to="/guide"
                className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center group/item"
              >
                <span className="transition-transform group-hover/item:translate-x-1">System Guide</span>
              </Link>
            </li>
            {githubLink && (
              <li>
                <a
                  href={githubLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-all duration-200 flex items-center gap-1 group/item"
                >
                  <span className="transition-transform group-hover/item:translate-x-1 flex items-center gap-1">
                    GitHub <ArrowUpRight size={12} className="opacity-60" />
                  </span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Labs Column (Spans 3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">Manish Labs</h4>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Trace is one node of a wider lab building automation tools, developer productivity stacks, and debugging runtimes.
          </p>
          <a
            href={MANISH_LABS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors group/labs"
          >
            <span className="transition-transform group-hover/labs:translate-x-0.5">Explore the ecosystem</span>
            <ArrowUpRight size={13} className="opacity-60 group-hover/labs:-translate-y-0.5 group-hover/labs:translate-x-0.5 transition-transform" />
          </a>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center border-t border-zinc-200/40 dark:border-zinc-800/80 pt-8 gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-450 dark:text-zinc-500">
          © {new Date().getFullYear()} TRACE — DEVELOPED BY{' '}
          <a
            href={MANISH_LABS_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            MANISH LABS
          </a>.
        </p>
        <div className="flex gap-6 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-650">
          <Link to="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
