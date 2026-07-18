'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, Plus, Trash2, Edit, Save, LogOut, Copy, Check,
  ExternalLink, Settings, MessageSquare, Code, Layout, Paintbrush,
  CheckCircle, AlertCircle, Eye, EyeOff, Film, Star
} from 'lucide-react';

interface Space {
  id: string;
  slug: string;
  name: string;
  title: string;
  message: string;
  theme_color: string;
  logo_url: string;
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
  is_approved: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Spaces
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);

  // Space Form
  const [isEditingSpace, setIsEditingSpace] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [spaceSlug, setSpaceSlug] = useState('');
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceMessage, setSpaceMessage] = useState('');
  const [spaceThemeColor, setSpaceThemeColor] = useState('#8b5cf6');

  // Testimonials list
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'widget'>('reviews');

  // UI Feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      // Spaces
      fetchSpaces(user.id);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaces = async (userId: string) => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setSpaces(data);
      if (data.length > 0 && !activeSpace) {
        selectSpace(data[0]);
      }
    }
  };

  const selectSpace = async (space: Space) => {
    setActiveSpace(space);
    // Fetch testimonials
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false });
    
    if (data) setTestimonials(data);
  };

  // Create or Update Space
  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    const cleanSlug = spaceSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!spaceName || !cleanSlug || !spaceTitle || !spaceMessage) {
      setFeedback({ type: 'error', text: 'All settings fields are required.' });
      return;
    }

    try {
      const spacePayload = {
        owner_id: user.id,
        name: spaceName,
        slug: cleanSlug,
        title: spaceTitle,
        message: spaceMessage,
        theme_color: spaceThemeColor,
      };

      let response;
      if (activeSpace) {
        // Update
        response = await supabase
          .from('spaces')
          .update(spacePayload)
          .eq('id', activeSpace.id)
          .select()
          .single();
      } else {
        // Insert
        response = await supabase
          .from('spaces')
          .insert(spacePayload)
          .select()
          .single();
      }

      if (response.error) throw response.error;

      setFeedback({ type: 'success', text: 'Space saved successfully!' });
      setIsEditingSpace(false);
      
      // Reload spaces
      fetchSpaces(user.id);
      selectSpace(response.data);

    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Slug is already taken.' });
    }
  };

  // Toggle Testimonial approval status
  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_approved: !currentStatus } : t
      ));
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Delete Testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleCreateNewSpace = () => {
    setActiveSpace(null);
    setSpaceName('');
    setSpaceSlug('');
    setSpaceTitle('Share your experience with us!');
    setSpaceMessage('We value your feedback. Let us know how we did!');
    setSpaceThemeColor('#8b5cf6');
    setIsEditingSpace(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const copyCollectionLink = () => {
    if (!activeSpace) return;
    const link = `${window.location.origin}/collect/${activeSpace.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyEmbedCode = () => {
    if (!activeSpace) return;
    const code = `<iframe src="${window.location.origin}/embed/${activeSpace.slug}" width="100%" height="600" style="border:none;" scrolling="no"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8 glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ProofGrid Spaces Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome, {profile?.full_name || 'Creator'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Spaces List & Configuration */}
        <div className="space-y-6">
          
          {/* Active Spaces List */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Spaces</h2>
              <button
                onClick={handleCreateNewSpace}
                className="p-1 rounded bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 transition"
                title="Create new Space"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {spaces.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No spaces created yet.</p>
            ) : (
              <div className="space-y-2">
                {spaces.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setIsEditingSpace(false);
                      selectSpace(s);
                    }}
                    className={`w-full text-left p-3 rounded-lg text-xs font-semibold border transition flex items-center justify-between ${
                      activeSpace?.id === s.id && !isEditingSpace
                        ? 'bg-violet-500/10 border-violet-500/35 text-white' 
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                      /{s.slug}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Space Configuration form */}
          {(isEditingSpace || activeSpace) && (
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  {isEditingSpace ? 'New Space Settings' : 'Space Configuration'}
                </h2>
                {!isEditingSpace && (
                  <button
                    onClick={() => {
                      setSpaceName(activeSpace!.name);
                      setSpaceSlug(activeSpace!.slug);
                      setSpaceTitle(activeSpace!.title);
                      setSpaceMessage(activeSpace!.message);
                      setSpaceThemeColor(activeSpace!.theme_color);
                      setIsEditingSpace(true);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {feedback.text && (
                <div className={`p-3 rounded-lg border text-xs flex gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {isEditingSpace ? (
                <form onSubmit={handleSaveSpace} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Space Name</label>
                    <input
                      type="text"
                      required
                      placeholder="My SaaS App"
                      className="w-full glass-input px-3 py-2 text-xs"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">URL Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="my-saas"
                      className="w-full glass-input px-3 py-2 text-xs"
                      value={spaceSlug}
                      onChange={(e) => setSpaceSlug(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Collector Heading</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Share your experience with us!"
                      className="w-full glass-input px-3 py-2 text-xs"
                      value={spaceTitle}
                      onChange={(e) => setSpaceTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Collector Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe what kind of feedback you are looking for..."
                      className="w-full glass-input px-3 py-2 text-xs"
                      value={spaceMessage}
                      onChange={(e) => setSpaceMessage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Theme Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        value={spaceThemeColor}
                        onChange={(e) => setSpaceThemeColor(e.target.value)}
                      />
                      <span className="text-xs text-slate-300 font-mono uppercase">{spaceThemeColor}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSpace(false)}
                      className="flex-1 py-2 rounded-lg glow-btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-2 rounded-lg glow-btn-primary text-xs">
                      Save Settings
                    </button>
                  </div>
                </form>
              ) : (
                /* Saved State Display */
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Slug Link</span>
                    <div className="flex gap-2">
                      <button
                        onClick={copyCollectionLink}
                        className="flex-1 p-2 rounded bg-slate-900 border border-slate-800 text-left text-slate-300 font-mono truncate flex items-center justify-between"
                      >
                        <span className="truncate">/collect/{activeSpace?.slug}</span>
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" /> : <Copy className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </button>
                      <a
                        href={`/collect/${activeSpace?.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Collector Heading</span>
                    <p className="text-white font-semibold">{activeSpace?.title}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Collector Message</span>
                    <p className="text-slate-400">{activeSpace?.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Theme Color</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeSpace?.theme_color }} />
                      <span className="font-mono text-white text-[10px] uppercase">{activeSpace?.theme_color}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Columns: Submissions and widgets */}
        <div className="lg:col-span-2 space-y-6">
          {!activeSpace ? (
            <div className="glass-panel p-12 text-center flex flex-col items-center">
              <MessageSquare className="w-12 h-12 text-violet-400 mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Select or Create a Space</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                You can create multiple spaces representing different projects, brands, or pages to manage your social proof pipelines.
              </p>
            </div>
          ) : (
            <>
              {/* Tab Selector Header */}
              <div className="flex border-b border-slate-800 justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-3 px-1 border-b-2 text-sm font-semibold transition flex items-center gap-1.5 ${
                      activeTab === 'reviews' 
                        ? 'border-violet-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Review Inbox ({testimonials.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('widget')}
                    className={`py-3 px-1 border-b-2 text-sm font-semibold transition flex items-center gap-1.5 ${
                      activeTab === 'widget' 
                        ? 'border-violet-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Embed Widget
                  </button>
                </div>
              </div>

              {/* Tab 1: Submissions review manager */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {testimonials.length === 0 ? (
                    <div className="glass-panel p-12 text-center flex flex-col items-center">
                      <Layout className="w-12 h-12 text-slate-700 mb-3" />
                      <h4 className="text-white font-medium">Inbox is empty</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Copy your collection link on the left and share it with clients to start receiving reviews!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonials.map(t => (
                        <div key={t.id} className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
                          
                          {/* Rating and Type */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                              {t.type === 'video' ? <Film className="w-3 h-3 text-pink-400" /> : null}
                              {t.type} Review
                            </span>
                          </div>

                          {/* Review Content */}
                          <div className="flex-1 mb-4">
                            {t.type === 'video' && t.video_url ? (
                              <div className="aspect-video w-full rounded-lg bg-black overflow-hidden mb-3 border border-slate-800">
                                <video src={t.video_url} controls className="w-full h-full object-cover" />
                              </div>
                            ) : null}
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{t.body}"</p>
                          </div>

                          {/* Footer details */}
                          <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-white truncate max-w-[120px]">{t.reviewer_name}</h5>
                              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{t.reviewer_title || 'Client'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Approve/Reject Toggle button */}
                              <button
                                onClick={() => handleToggleApproval(t.id, t.is_approved)}
                                className={`p-1.5 rounded transition ${
                                  t.is_approved 
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                }`}
                                title={t.is_approved ? 'Hide from widget' : 'Display on widget'}
                              >
                                {t.is_approved ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Widget Iframe Embed customizable settings */}
              {activeTab === 'widget' && (
                <div className="glass-panel p-6 space-y-6">
                  
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                      <Code className="w-4.5 h-4.5 text-violet-400" />
                      Add Testimonials to Your Website
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Copy the iframe embed code below and paste it anywhere in your website code (HTML, Webflow, Shopify, WordPress, etc.).
                    </p>

                    <div className="flex gap-2">
                      <div className="flex-1 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] select-all overflow-x-auto whitespace-nowrap">
                        {`<iframe src="${window.location.origin}/embed/${activeSpace.slug}" width="100%" height="600" style="border:none;" scrolling="no"></iframe>`}
                      </div>
                      <button
                        onClick={copyEmbedCode}
                        className="px-4 py-2.5 rounded-lg glow-btn-primary text-xs font-semibold shrink-0 flex items-center gap-1.5"
                      >
                        {copiedEmbed ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                        {copiedEmbed ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  </div>

                  {/* Widget Live Preview */}
                  <div className="pt-6 border-t border-slate-800">
                    <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-1">
                      <Paintbrush className="w-4 h-4 text-violet-400" />
                      Live Widget Preview (Slider layout)
                    </h4>
                    
                    {/* Embedded preview wrapper */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 min-h-[220px] flex items-center justify-center overflow-hidden">
                      <iframe 
                        src={`/embed/${activeSpace.slug}?preview=true`}
                        className="w-full h-[180px] border-none overflow-hidden" 
                        scrolling="no"
                      />
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
}
