import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, Video, MessageSquare, 
  Code, ShieldCheck, Heart, Zap, Star 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden relative">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-violet-500/15 rounded-xl flex items-center justify-center border border-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">ProofGrid</span>
        </div>
        
        <Link 
          href="/login" 
          className="px-5 py-2.5 text-xs rounded-xl glow-btn-primary transition font-bold"
        >
          Get Started Free
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 md:py-24 flex-1 flex flex-col items-center text-center relative z-10">
        
        {/* Glow Tagline Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          Collect Video & Text Reviews Free
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Turn Client Testimonials Into Your Best <span className="text-violet-400">Sales Machine</span>
        </h1>
        
        <p className="text-slate-400 text-base md:text-lg max-w-xl mt-6 leading-relaxed">
          Collect beautiful text and browser-recorded video testimonials from your clients. Embed them in interactive, auto-sliding marquee or masonry widgets on your landing page.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl glow-btn-primary text-sm font-bold flex items-center justify-center gap-2"
          >
            Create Your Free Space
            <ArrowRight className="w-4 h-4 text-violet-950" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl glow-btn-secondary text-sm font-semibold flex items-center justify-center"
          >
            See Feature Showcase
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-28 text-left">
          
          <div className="glass-panel p-6 space-y-3 relative group overflow-hidden">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-md font-bold text-white">In-Browser Recording</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No apps or downloads required. Clients record high-quality video reviews directly inside their browser with one click.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 relative group overflow-hidden">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
              <Code className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="text-md font-bold text-white">No-Code Iframe Embed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy and paste a simple code snippet to render dynamic masonry walls or animated horizontal loop sliders on any website builder.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 relative group overflow-hidden">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
              <MessageSquare className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-md font-bold text-white">Interactive Customizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Match your brand identity. Adjust colors, layout configurations, and filter testimonials directly from your admin panel.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-8 bg-zinc-950/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-violet-500" />
            <span>ProofGrid. Built for modern creators and builders.</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 shrink-0" />
            <span>for maximum conversion.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
