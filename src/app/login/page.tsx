'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, Key, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/dashboard');
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        if (!fullName) throw new Error('Please enter your full name.');

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Signup failed.');

        // Insert profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
        });

        if (profileError) throw profileError;

        setMessage({
          type: 'success',
          text: 'Signup successful! Please check your email or log in.',
        });
        
        setTimeout(() => {
          setIsSignUp(false);
          setPassword('');
        }, 3000);

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 shadow-2xl relative overflow-hidden">
        
        {/* Neon Blur Elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? 'Create your ProofGrid' : 'Welcome to ProofGrid'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp ? 'Start collecting visual testimonials' : 'Manage your testimonial spaces'}
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 flex items-start gap-2.5 p-3 rounded-lg border text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl glow-btn-primary transition duration-200 mt-6 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-violet-950 border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              'Create Free Space'
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm">
          <span className="text-slate-400">
            {isSignUp ? 'Already have an account? ' : "Need to collect reviews? "}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage({ type: '', text: '' });
            }}
            className="text-violet-400 hover:text-violet-300 font-semibold transition"
          >
            {isSignUp ? 'Log In' : 'Sign Up Free'}
          </button>
        </div>

      </div>
    </div>
  );
}
