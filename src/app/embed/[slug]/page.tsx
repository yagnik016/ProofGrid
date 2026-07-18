'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Star, Film, Sparkles, AlertCircle } from 'lucide-react';

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
  created_at: string;
}

export default function EmbedWidgetPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const layout = searchParams.get('layout') || 'slider'; // 'slider' or 'masonry'
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

  // Card component structure
  const renderCard = (t: Testimonial) => (
    <div 
      key={t.id} 
      className="glass-panel p-5 flex flex-col justify-between overflow-hidden relative border border-white/5 bg-zinc-900/60 hover:border-violet-500/20 hover:shadow-lg transition-all duration-300 w-[280px] shrink-0"
      style={{ 
        height: layout === 'slider' ? '160px' : 'auto',
        borderColor: isPreview ? `${space?.theme_color}1a` : undefined 
      }}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="w-3 h-3 fill-amber-400 text-amber-400"
                style={{ color: i < t.rating ? undefined : '#4b5563' }}
              />
            ))}
          </div>
          {t.type === 'video' && (
            <Film className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          )}
        </div>

        {/* Body review text */}
        <p className={`text-xs text-slate-300 italic leading-relaxed ${layout === 'slider' ? 'line-clamp-3' : ''}`}>
          "{t.body}"
        </p>
      </div>

      <div className="border-t border-slate-800/80 pt-2 mt-3 flex items-center justify-between">
        <div className="min-w-0">
          <h5 className="font-bold text-[11px] text-white truncate">{t.reviewer_name}</h5>
          <p className="text-[9px] text-slate-500 truncate">{t.reviewer_title || 'Client'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-transparent min-h-screen overflow-hidden p-2">
      {layout === 'slider' ? (
        /* Dynamic Slider/Marquee widget structure */
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="animate-marquee flex gap-4">
            {/* Render testimonials twice to complete loop */}
            {testimonials.map(t => renderCard(t))}
            {testimonials.map(t => renderCard(t))}
          </div>
        </div>
      ) : (
        /* Vertical Masonry list widget */
        <div className="masonry-grid w-full">
          {testimonials.map(t => (
            <div key={t.id} className="masonry-item">
              <div 
                className="glass-panel p-5 flex flex-col justify-between overflow-hidden border border-white/5 bg-zinc-900/60 hover:border-violet-500/20 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          style={{ color: i < t.rating ? undefined : '#4b5563' }}
                        />
                      ))}
                    </div>
                    {t.type === 'video' && (
                      <span className="flex items-center gap-1 text-[9px] text-slate-400 uppercase font-semibold">
                        <Film className="w-3 h-3 text-pink-400" />
                        Video
                      </span>
                    )}
                  </div>

                  {t.type === 'video' && t.video_url && (
                    <div className="aspect-video w-full rounded-lg bg-black overflow-hidden mb-3 border border-slate-800/80">
                      <video src={t.video_url} controls className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{t.body}"
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white">{t.reviewer_name}</h5>
                    <p className="text-[10px] text-slate-500">{t.reviewer_title || 'Client'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
