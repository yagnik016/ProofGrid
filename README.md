# ProofGrid 🌟

ProofGrid is a zero-cost, high-performance, and visually stunning testimonial and video review collection platform. It enables startups, creators, and freelancers to collect text and browser-recorded video reviews from clients for free, generating embeddable widgets that look premium and engage visitors.

---

## 🌟 Key Features

*   **Zero-Cost Stack:** Uses Vercel (free hosting), Supabase (free PostgreSQL + Storage), and client-side browser recording (free media encoding).
*   **In-Browser Video Recorder:** Clients can record high-quality video reviews directly from their webcam/phone browser using the native HTML5 MediaRecorder API. No external paid APIs.
*   **Live Customizer Dashboard:** Merchants can manage spaces, approve/reject reviews, and customize widget themes, layout structures, and HSL colors in real-time.
*   **Embeddable Iframe Widgets:** Prevents styling conflicts with client websites using responsive, fast-loading dynamic `/embed` routes (masonry wall, animated carousels, and infinite marquee sliders).
*   **Glassmorphic Design:** Sleek UI panels, 3D hover effects, and modern responsive layouts.

---

## 🛠️ Tech Stack

*   **Frontend & Dynamic Routing:** Next.js (App Router, TypeScript)
*   **Backend Database & Storage:** Supabase (PostgreSQL, Auth, Storage Buckets)
*   **Styling:** Modern CSS (Tailwind CSS v4 & custom CSS variables)

---

## 🚀 Local Quick Start

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 📂 Database Schema Setup

Run the following SQL commands in your Supabase SQL Editor:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.spaces (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  title text not null,
  message text not null,
  theme_color text default '#10b981' not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  type text default 'text' not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  body text not null,
  video_url text,
  reviewer_name text not null,
  reviewer_email text not null,
  reviewer_title text,
  reviewer_avatar_url text,
  is_approved boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 🤝 Contributing
Open issues and pull requests are welcome!