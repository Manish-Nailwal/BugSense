import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../features/landing/Footer';
import { ArrowLeft } from 'lucide-react';

/**
 * Shared shell for static legal pages (Terms, Privacy). Public — renders under
 * the global Navbar and reuses the marketing Footer.
 */
const LegalLayout = ({ title, intro, updated, children }) => {
  return (
    <div className="w-full bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-6 pt-28 md:pt-36 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group mb-8"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {updated && (
          <p className="mt-3 text-[12px] font-medium uppercase tracking-wider text-zinc-400">Last updated · {updated}</p>
        )}
        {intro && (
          <p className="mt-5 text-[14.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{intro}</p>
        )}

        <div className="mt-10 space-y-9">{children}</div>
      </div>

      <Footer />
    </div>
  );
};

/** A single legal section with a heading and body. */
export const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
    <div className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 [&_a]:text-indigo-600 dark:[&_a]:text-violet-400 [&_a]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:marker:text-zinc-300 dark:[&_li]:marker:text-zinc-700">
      {children}
    </div>
  </section>
);

export default LegalLayout;
