'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, Star, User, Mail, Briefcase, Video, 
  FileText, Camera, Square, RefreshCw, Send, CheckCircle, AlertCircle
} from 'lucide-react';

interface Space {
  id: string;
  name: string;
  title: string;
  message: string;
  theme_color: string;
}

export default function ReviewCollectorPage() {
  const { slug } = useParams();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Review Form States
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerTitle, setReviewerTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewType, setReviewType] = useState<'text' | 'video'>('text');

  // Video recording states
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Refs
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (slug) fetchSpaceDetails();
  }, [slug]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  const fetchSpaceDetails = async () => {
    try {
      setLoading(true);
      setError(false);

      const { data, error: spaceError } = await supabase
        .from('spaces')
        .select('id, name, title, message, theme_color')
        .eq('slug', slug)
        .single();

      if (spaceError || !data) {
        setError(true);
        return;
      }
      setSpace(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Turn webcam camera ON
  const startCameraStream = async () => {
    try {
      setFeedback({ type: '', text: '' });
      stopCameraStream(); // clear any previous streams
      setVideoBlob(null);
      setVideoPreviewUrl('');
      recordedChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });

      setCameraStream(stream);

      // Play camera stream inside the HTML video element
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.muted = true; // prevent voice echo feedback
        videoElementRef.current.play().catch(e => console.error(e));
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Camera access denied. Please grant webcam and mic permissions.' });
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Start recording WebRTC chunks
  const startRecording = () => {
    if (!cameraStream) return;
    
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    // Check fallback formats if VP9 is not supported (e.g. safari/mobile)
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(cameraStream, options);
    } catch (e) {
      recorder = new MediaRecorder(cameraStream);
    }

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoPreviewUrl(URL.createObjectURL(blob));

      // Display recorded playback in HTML video tag
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
        videoElementRef.current.src = URL.createObjectURL(blob);
        videoElementRef.current.muted = false; // play sound
        videoElementRef.current.controls = true;
      }
    };

    recorder.start();
    setRecording(true);
  };

  // Stop recording WebRTC stream
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCameraStream();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space) return;

    setFeedback({ type: '', text: '' });
    setSubmitting(true);

    try {
      let finalVideoUrl = '';

      // Upload recorded video if type is 'video'
      if (reviewType === 'video') {
        if (!videoBlob) {
          throw new Error('Please record your video review first.');
        }

        const fileName = `${space.id}/${Math.random()}.webm`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('video-testimonials')
          .upload(filePath, videoBlob, { 
            contentType: 'video/webm',
            upsert: true 
          });

        if (uploadError) {
          throw new Error('Could not upload video. Make sure to create a public storage bucket named "video-testimonials" in your Supabase dashboard.');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('video-testimonials')
          .getPublicUrl(filePath);
        
        finalVideoUrl = publicUrl;
      }

      // Save submission database records
      const { error: dbError } = await supabase
        .from('testimonials')
        .insert({
          space_id: space.id,
          type: reviewType,
          rating: rating,
          body: reviewBody || (reviewType === 'video' ? 'Video Testimonial' : ''),
          video_url: finalVideoUrl || null,
          reviewer_name: reviewerName,
          reviewer_email: reviewerEmail,
          reviewer_title: reviewerTitle,
        });

      if (dbError) throw dbError;

      setSubmitted(true);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error submitting review.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Space Not Found</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          The collection link is invalid or the space has been deleted by the owner.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 animate-bounce">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Thank You!</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Your feedback has been successfully submitted to <strong>{space.name}</strong>. We appreciate your time!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl glass-panel p-6 md:p-8 shadow-2xl relative">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Submit Review for {space.name}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">{space.title}</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{space.message}</p>
        </div>

        {feedback.text && (
          <div className={`mb-6 p-3 rounded-lg border text-sm flex gap-2 ${
            feedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Reviewer Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Patel"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title / Company (Optional)</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="CEO at TechCorp"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs"
                  value={reviewerTitle}
                  onChange={(e) => setReviewerTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => setRating(stars)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      stars <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Type Selection (Text or Video) */}
          <div className="flex gap-4 border-b border-slate-800 pb-4">
            <button
              type="button"
              onClick={() => {
                setReviewType('text');
                stopCameraStream();
              }}
              className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                reviewType === 'text'
                  ? 'bg-violet-500/10 border-violet-500/40 text-white'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Write Text Review
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewType('video');
                startCameraStream();
              }}
              className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                reviewType === 'video'
                  ? 'bg-violet-500/10 border-violet-500/40 text-white'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Record Video Review
            </button>
          </div>

          {/* Text Review Box */}
          {reviewType === 'text' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Review</label>
              <textarea
                required
                rows={4}
                placeholder="Write your honest review here..."
                className="w-full glass-input px-3 py-2 text-xs"
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
              />
            </div>
          )}

          {/* Video Recording Interface */}
          {reviewType === 'video' && (
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Video Testimonial</label>
              
              <div className="aspect-video w-full max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
                <video
                  ref={videoElementRef}
                  className="w-full h-full object-cover"
                />
                
                {/* No stream active helper overlay */}
                {!cameraStream && !videoBlob && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-center space-y-3">
                    <Video className="w-10 h-10 text-slate-600" />
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="px-4 py-2 rounded-lg glow-btn-primary text-xs flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-violet-950" />
                      Enable Camera
                    </button>
                  </div>
                )}

                {/* Recording indicator */}
                {recording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                    RECORDING
                  </div>
                )}
              </div>

              {/* Recorder actions */}
              <div className="flex justify-center gap-3">
                {cameraStream && !recording && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Video className="w-4 h-4" />
                    Start Record
                  </button>
                )}

                {recording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Square className="w-4 h-4" />
                    Stop Record
                  </button>
                )}

                {videoBlob && !recording && (
                  <button
                    type="button"
                    onClick={startCameraStream}
                    className="px-5 py-2 rounded-lg glow-btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Re-Record
                  </button>
                )}
              </div>

              {/* Text context details for video submission */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Add a Short Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., ProofGrid saved us days of manual review collection!"
                  className="w-full glass-input px-3 py-2 text-xs"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl glow-btn-primary text-xs font-bold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-violet-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-violet-950" />
                Submit Testimonial
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
