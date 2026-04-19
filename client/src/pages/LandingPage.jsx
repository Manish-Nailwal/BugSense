import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Search, Brain, BarChart3, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950 transition-colors duration-300 scroll-smooth pt-32">
      {/* Hero Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-8 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            V1.0 High-Precision Beta
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
            Solve logic, <br />
            <span className="text-emerald-500 dark:text-emerald-400">Not just errors.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            The Socratic debugging platform for modern engineering teams. 
            Build mental models while resolving critical production failures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register">
              <Button className="w-full sm:w-auto px-10 py-6 text-sm font-bold uppercase tracking-widest shadow-xl shadow-emerald-500/10">Get Started</Button>
            </Link>
            <Link to="/library">
              <Button variant="outline" className="w-full sm:w-auto px-10 py-6 text-sm font-bold uppercase tracking-widest border-2">Browse Library</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 border-y border-zinc-100 dark:border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: "Pattern Detection",
                desc: "Analyze logs locally without exposing source code. Our engine operates purely on diagnostic pattern recognition."
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Socratic Engine",
                desc: "Don't just copy-paste. Build deep system understanding through guided, multi-step diagnostic inquiry."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Skill Growth",
                desc: "Quantify your debugging efficiency and identify recurring technical blind spots in your development workflow."
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col gap-6">
                <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{feature.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm font-medium">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-16 text-center overflow-hidden relative border-none shadow-2xl shadow-emerald-500/5 dark:shadow-none bg-zinc-50 dark:bg-zinc-900">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
            <h2 className="text-4xl font-extrabold mb-4 tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">Master the machine.</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-lg max-w-xl mx-auto font-medium">
              Join the elite tier of developers who debug with precision and purpose.
            </p>
            <Link to="/auth/register" className="inline-flex items-center gap-2">
              <Button className="px-12 py-7 text-xs font-bold uppercase tracking-widest">
                Create Account <ChevronRight size={16} />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-zinc-100 dark:border-zinc-900 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 bg-white rounded-xs rotate-45" />
            </div>
            <span className="font-black text-lg tracking-tighter text-zinc-900 dark:text-zinc-100">BUGSENSE</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            © 2026 BUGSENSE — THE SYSTEM ANALYSIS PLATFORM.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

