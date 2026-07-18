'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Star, Film, Sparkles } from 'lucide-react';

interface Space {
  id: string;
  name: string;
  theme_color: string;
}

interface Testimonial {
  id: string;
  type: string;
  rating: number;
  body: string;
  video_url: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_title: string;
  is_verified?: boolean;
  social_platform?: string;
  created_at: string;
}

export default function EmbedWidgetPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  
  // Customization URL Params
  const layout = searchParams.get('layout') || 'slider'; // 'slider', 'masonry', or 'single'
  const theme = searchParams.get('theme') || 'dark'; // 'dark', 'light', or 'glass'
  const starColor = searchParams.get('starColor') || '#f59e0b'; // VPA rating fill color
  const isPreview = searchParams.get('preview') === 'true';

  const [space, setSpace] = useState<Space | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchEmbedData();
    }
  }, [slug]);

  const fetchEmbedData = async () => {
    try {
      setLoading(true);

      const { data: spaceData } = await supabase
        .from('spaces')
        .select('id, name, theme_color')
        .eq('slug', slug)
        .single();

      if (!spaceData) return;
      setSpace(spaceData);

      // Fetch approved testimonials
      const { data: testData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('space_id', spaceData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (testData) {
        setTestimonials(testData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <span className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback if no testimonials are approved yet
  if (testimonials.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center bg-transparent">
        <Sparkles className="w-8 h-8 text-violet-400 mb-2 animate-pulse" />
        <h4 className="text-white text-xs font-bold">ProofGrid Widgets Active</h4>
        <p className="text-[10px] text-slate-500 mt-0.5">Testimonials will display here once approved in dashboard.</p>
      </div>
    );
  }

  // Theme Style classes map
  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          wrapper: 'bg-white text-zinc-900',
          card: 'bg-zinc-50 border border-zinc-200 text-zinc-900',
          text: 'text-zinc-700',
          muted: 'text-zinc-500 border-zinc-200',
          name: 'text-zinc-900',
        };
      case 'glass':
        return {
          wrapper: 'bg-transparent text-white',
          card: 'glass-panel bg-white/5 border border-white/5 text-white',
          text: 'text-slate-200',
          muted: 'text-slate-400 border-white/10',
          name: 'text-white',
        };
      case 'dark':
      default:
        return {
          wrapper: 'bg-zinc-950 text-white',
          card: 'bg-zinc-900 border border-zinc-800 text-white',
          text: 'text-slate-300',
          muted: 'text-slate-500 border-slate-800',
          name: 'text-white',
        };
    }
  };

  const style = getThemeClasses();

  // Render a Single Testimonial Card (Common builder)
  const renderCardContent = (t: Testimonial, isSingle = false) => (
    <>
      <div>
        <div className="flex justify-between items-center mb-3">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="w-3.5 h-3.5"
                style={{ 
                  fill: i < t.rating ? starColor : 'transparent',
                  color: i < t.rating ? starColor : '#4b5563' 
                }}
              />
            ))}
          </div>
          {t.type === 'video' && (
            <Film className="w-4 h-4 text-pink-500 shrink-0" />
          )}
        </div>

        {/* Video Player (Masonry or Single layout only) */}
        {t.type === 'video' && t.video_url && !isSingle && layout !== 'slider' && (
          <div className="aspect-video w-full rounded-lg bg-black overflow-hidden mb-3 border border-white/5">
            <video src={t.video_url} controls className="w-full h-full object-cover" />
          </div>
        )}

        {/* Body Text */}
        <p className={`${isSingle ? 'text-sm md:text-base' : 'text-xs'} ${style.text} italic leading-relaxed`}>
          "{t.body}"
        </p>
      </div>

      <div className={`border-t ${style.muted} pt-3 mt-4 flex items-center justify-between`}>
        <div className="min-w-0 flex-1 mr-2">
          <h5 className={`font-bold ${isSingle ? 'text-sm' : 'text-xs'} ${style.name} truncate flex items-center gap-1`}>
            {t.reviewer_name}
            {t.is_verified && (
              <span className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold rounded-full flex items-center justify-center scale-90 select-none shrink-0" title="Verified review">✓</span>
            )}
          </h5>
          <p className="text-[10px] text-slate-500 truncate">{t.reviewer_title || 'Verified Client'}</p>
        </div>

        {t.social_platform && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 font-semibold select-none capitalize shrink-0">
            via {t.social_platform}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className={`w-full min-h-screen overflow-hidden p-3 ${isPreview ? 'bg-transparent' : style.wrapper}`}>
      
      {/* 1. SLIDER LAYOUT */}
      {layout === 'slider' && (
        <div className="relative w-full overflow-hidden flex items-center min-h-[170px]">
          <div className="animate-marquee flex gap-4">
            {testimonials.map(t => (
              <div 
                key={t.id} 
                className={`p-5 flex flex-col justify-between overflow-hidden rounded-xl w-[280px] shrink-0 transition-all duration-300 ${style.card}`}
                style={{ height: '150px' }}
              >
                {renderCardContent(t)}
              </div>
            ))}
            {/* Double mapping to complete the marquee seamless loop */}
            {testimonials.map(t => (
              <div 
                key={`${t.id}-duplicate`} 
                className={`p-5 flex flex-col justify-between overflow-hidden rounded-xl w-[280px] shrink-0 transition-all duration-300 ${style.card}`}
                style={{ height: '150px' }}
              >
                {renderCardContent(t)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MASONRY GRID LAYOUT */}
      {layout === 'masonry' && (
        <div className="masonry-grid w-full">
          {testimonials.map(t => (
            <div key={t.id} className="masonry-item">
              <div className={`p-5 flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-300 ${style.card}`}>
                {renderCardContent(t)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SINGLE HIGHLIGHT LAYOUT */}
      {layout === 'single' && testimonials.length > 0 && (
        <div className="flex justify-center items-center w-full min-h-[220px]">
          <div className={`p-6 max-w-xl w-full flex flex-col justify-between rounded-2xl relative shadow-xl border border-white/5 transition-all duration-300 ${style.card}`}>
            
            {/* Glowing Accent Ring */}
            <div 
              className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-xl opacity-30 pointer-events-none" 
              style={{ backgroundColor: space?.theme_color || '#8b5cf6' }}
            />
            
            {renderCardContent(testimonials[0], true)}
          </div>
        </div>
      )}

    </div>
  );
}
