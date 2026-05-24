import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  Star,
  Clock,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Play,
  ChevronRight,
  Sparkles,
  Award,
  Globe,
  Lock,
  Menu,
  X,
  BarChart3,
  Video,
  Map,
} from 'lucide-react';

// ── Animation Helpers ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any } },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerGroup({ children, delay = 0.1, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Pill / Badge ───────────────────────────────────────────────────────────────

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

// ── SECTION 0: Landing Navbar ─────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AscendPath</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Roadmaps', href: '/explore' },
              { label: 'Mentorship', href: '/explore' },
              { label: 'Community', href: '/forum' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-3.5 py-1.5 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/auth/login">
              <button className="px-4 py-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Sign in
              </button>
            </Link>
            <Link to="/auth/register">
              <button className="px-4 py-1.5 text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:scale-105">
                Get started free
              </button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[#0A0A0F] border-b border-white/5"
          >
            <div className="px-5 py-4 space-y-1">
              {[
                { label: 'Roadmaps', href: '/explore' },
                { label: 'Mentorship', href: '/explore' },
                { label: 'Community', href: '/forum' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-2 text-sm font-semibold border border-white/10 text-white/70 hover:text-white rounded-xl transition-all hover:bg-white/5">
                    Sign in
                  </button>
                </Link>
                <Link to="/auth/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all">
                    Get started free
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── SECTION 1: Hero ───────────────────────────────────────────────────────────

// Fake product preview: Roadmap timeline
function RoadmapPreview() {
  const steps = [
    { label: 'Foundations of Product Strategy', done: true, active: false },
    { label: 'User Research & Personas', done: true, active: false },
    { label: 'Competitive Analysis', done: false, active: true },
    { label: 'Roadmap Prioritization', done: false, active: false },
    { label: 'Go-to-Market Planning', done: false, active: false },
  ];
  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-5 space-y-3 w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Product Manager Path</span>
        <span className="ml-auto text-[11px] font-bold text-violet-400">40% complete</span>
      </div>
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="relative flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
              s.done ? 'border-emerald-500 bg-emerald-500' : s.active ? 'border-violet-500 bg-violet-500/20 shadow-sm shadow-violet-500/40' : 'border-white/15 bg-transparent'
            }`}>
              {s.done && <CheckCircle2 className="w-3 h-3 text-white" />}
              {s.active && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-4 mt-1 ${s.done ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
            )}
          </div>
          <span className={`text-xs leading-none pb-4 ${
            s.done ? 'text-white/40 line-through' : s.active ? 'text-white font-semibold' : 'text-white/35'
          }`}>
            {s.label}
          </span>
          {s.active && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/20 flex-shrink-0">
              Active
            </span>
          )}
        </div>
      ))}
      <div className="mt-2 bg-white/5 rounded-xl h-1.5 overflow-hidden">
        <div className="h-full w-2/5 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" />
      </div>
    </div>
  );
}

// Fake product preview: Mentor session card
function SessionPreviewCard() {
  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-4 w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          SR
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">Shreya Raina</p>
          <p className="text-[11px] text-white/40">Product Lead · Google</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
          Available
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        {['Product Strategy', 'UX Research', 'Agile'].map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/8">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-white">4.9</span>
          <span className="text-[11px] text-white/30">· 42 sessions</span>
        </div>
        <button className="text-[11px] font-bold px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors">
          Book Session
        </button>
      </div>
    </div>
  );
}

// Fake forum post
function ForumPreview() {
  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">
          AK
        </div>
        <span className="text-[11px] text-white/40 font-medium">Arjun Kapoor</span>
        <span className="text-[10px] text-white/20">· 2h ago</span>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Solved</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">
        How do I transition from software engineering to product management? What skills matter most?
      </p>
      <div className="flex items-center gap-3 pt-1 text-[11px] text-white/30">
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />12 replies</span>
        <span className="flex items-center gap-1">↑ 34 upvotes</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 px-5 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0F]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-violet-700/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] rounded-full bg-indigo-700/8 blur-[100px] pointer-events-none" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Pill className="text-violet-300 border-violet-500/25 bg-violet-500/10">
                <Sparkles className="w-3 h-3" />
                Guided learning ecosystem
              </Pill>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <h1 className="text-[2.8rem] sm:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.05] tracking-tight text-white">
                Learn with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  mentors.
                </span>
                <br />
                Follow structured{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  roadmaps.
                </span>
                <br />
                <span className="text-white/70">Grow with a real community.</span>
              </h1>
              <p className="text-[1.05rem] text-white/45 leading-relaxed max-w-lg">
                AscendPath connects you with expert mentors, structured career roadmaps, and a community of growth-focused learners — all in one place.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/auth/register">
                <button className="group inline-flex items-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[15px] shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link to="/explore">
                <button className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 font-semibold rounded-xl text-[15px] transition-all">
                  <Map className="w-4 h-4" />
                  Explore Roadmaps
                </button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, label: 'Verified mentors' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: '2,000+ milestones completed' },
                { icon: <Star className="w-3.5 h-3.5" />, label: '4.9 avg. mentor rating' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[12px] font-medium text-white/35">
                  <span className="text-violet-400">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Product Previews */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 lg:pl-4"
          >
            <RoadmapPreview />
            <div className="grid grid-cols-1 gap-4">
              <SessionPreviewCard />
              <ForumPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── SECTION 2: How it works ────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: <Map className="w-6 h-6" />,
      title: 'Choose your roadmap',
      description: 'Browse mentor-curated, structured learning paths aligned with real career goals. Filter by domain, difficulty, and community rating.',
      color: 'from-violet-600/20 to-violet-600/5',
      accent: 'text-violet-400',
      border: 'border-violet-500/20',
    },
    {
      number: '02',
      icon: <Users className="w-6 h-6" />,
      title: 'Learn with mentors & workshops',
      description: 'Book 1-on-1 mentorship sessions, attend public workshops, and get direct feedback from verified industry experts.',
      color: 'from-indigo-600/20 to-indigo-600/5',
      accent: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    {
      number: '03',
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track progress and grow',
      description: 'Mark milestones, track your momentum, reflect in learning logs, and watch your career trajectory take shape.',
      color: 'from-emerald-600/20 to-emerald-600/5',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
  ];

  return (
    <section className="bg-[#0A0A0F] py-28 px-5 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0C0C14] to-[#0A0A0F]" />
      <div className="relative max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16 space-y-4">
          <Pill className="text-indigo-300 border-indigo-500/25 bg-indigo-500/10">
            <Zap className="w-3 h-3" />
            Simple, structured process
          </Pill>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How AscendPath works
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto leading-relaxed">
            From day one to career breakthrough — a clear path forward.
          </p>
        </FadeIn>

        <StaggerGroup delay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className={`relative h-full rounded-2xl border ${step.border} bg-gradient-to-b ${step.color} p-7 group hover:border-white/15 transition-all`}>
                {/* Number */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center ${step.accent} group-hover:scale-105 transition-transform`}>
                    {step.icon}
                  </div>
                  <span className="text-5xl font-black text-white/5 leading-none select-none">{step.number}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>

                {/* Connector arrow for desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-[#0C0C14] border border-white/10 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-white/30" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

// ── SECTION 3: Feature Ecosystem ──────────────────────────────────────────────

function FeatureEcosystem() {
  const features = [
    {
      icon: <Map className="w-5 h-5" />,
      title: 'Structured Roadmaps',
      description: 'Expert-curated learning paths with milestones, resources, and real career goals.',
      accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: '1-on-1 Mentorship',
      description: 'Book sessions with verified mentors in your field. Direct feedback that moves you forward.',
      accent: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: 'Public Workshops',
      description: 'Join live community workshops, office hours, and expert-led group sessions.',
      accent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Community Discussions',
      description: 'Ask questions, share experiences, and learn from a global community of learners.',
      accent: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Verified Sessions',
      description: 'Every completed session is logged, reviewed, and verified for accountability.',
      accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Progress Tracking',
      description: 'Visualize your learning momentum with milestones, streaks, and completion stats.',
      accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Learning Continuity',
      description: 'Your progress is always saved. Resume right where you left off across any device.',
      accent: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Career Goal Alignment',
      description: 'Every roadmap and session is mapped to specific career transitions and outcomes.',
      accent: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    },
  ];

  return (
    <section className="bg-[#0C0C14] py-28 px-5 lg:px-8 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16 space-y-4">
          <Pill className="text-violet-300 border-violet-500/25 bg-violet-500/10">
            <Sparkles className="w-3 h-3" />
            Everything you need to grow
          </Pill>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            A complete career growth ecosystem
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            Not just a course platform. A guided system built around how people actually learn and advance.
          </p>
        </FadeIn>

        <StaggerGroup delay={0.07} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="h-full bg-[#111118] border border-white/6 rounded-2xl p-5 hover:border-white/12 hover:bg-[#131320] transition-all group">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feature.accent} group-hover:scale-105 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-[15px] mb-1.5">{feature.title}</h3>
                <p className="text-white/35 text-[13px] leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

// ── SECTION 4: Roadmap Showcase ────────────────────────────────────────────────

function RoadmapShowcase() {
  const modules = [
    {
      section: 'Foundation',
      steps: [
        { title: 'Software Development Basics', done: true },
        { title: 'Version Control with Git', done: true },
        { title: 'Data Structures & Algorithms', done: true },
      ],
    },
    {
      section: 'Core Skills',
      steps: [
        { title: 'System Design Principles', done: false, active: true },
        { title: 'Database Architecture', done: false },
        { title: 'API Design & REST', done: false },
      ],
    },
    {
      section: 'Advanced Track',
      steps: [
        { title: 'Distributed Systems', done: false, locked: true },
        { title: 'Performance Engineering', done: false, locked: true },
        { title: 'Technical Leadership', done: false, locked: true },
      ],
    },
  ];

  return (
    <section className="bg-[#0A0A0F] py-28 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <FadeIn className="space-y-6">
            <Pill className="text-violet-300 border-violet-500/25 bg-violet-500/10">
              <BookOpen className="w-3 h-3" />
              Structured learning paths
            </Pill>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Roadmaps that feel like a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                guided journey
              </span>
            </h2>
            <p className="text-white/40 leading-relaxed text-base">
              Every roadmap is a curated, milestone-driven path created by experienced practitioners. Know exactly where you are, what's next, and how far you've come.
            </p>
            <ul className="space-y-3">
              {[
                'Mentor-curated modules with clear outcomes',
                'Step-by-step milestones with completion tracking',
                'Embedded resources, notes, and video lectures',
                'Shareable progress with community momentum',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/55">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/explore">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm rounded-xl transition-all mt-2">
                Browse all roadmaps
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </FadeIn>

          {/* Right: Visual timeline */}
          <FadeIn delay={0.2}>
            <div className="bg-[#0E0E17] border border-white/8 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-bold text-base">Backend Engineering Path</h3>
                  <p className="text-white/30 text-xs mt-0.5">Senior Engineer · Curated by Rohan Mehta</p>
                </div>
                <div className="text-right">
                  <p className="text-violet-400 font-extrabold text-lg">38%</p>
                  <p className="text-white/25 text-[10px]">complete</p>
                </div>
              </div>

              <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                <div className="h-full w-[38%] bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" />
              </div>

              {modules.map((mod, mi) => (
                <div key={mi} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      mi === 0 ? 'text-emerald-400 bg-emerald-500/10' : mi === 1 ? 'text-violet-400 bg-violet-500/10' : 'text-white/20 bg-white/5'
                    }`}>
                      {mod.section}
                    </div>
                    {mi === 0 && <div className="flex-1 h-px bg-emerald-500/20" />}
                    {mi === 1 && <div className="flex-1 h-px bg-violet-500/20" />}
                    {mi === 2 && <div className="flex-1 h-px bg-white/5" />}
                  </div>
                  <div className="ml-2 space-y-2">
                    {mod.steps.map((step, si) => (
                      <div key={si} className="flex items-center gap-3">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            step.done
                              ? 'bg-emerald-500 border-emerald-500'
                              : (step as any).active
                              ? 'bg-violet-500/20 border-violet-500 shadow-sm shadow-violet-500/30'
                              : (step as any).locked
                              ? 'bg-transparent border-white/10'
                              : 'bg-transparent border-white/15'
                          }`}>
                            {step.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                            {(step as any).active && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                            {(step as any).locked && <Lock className="w-2 h-2 text-white/15" />}
                          </div>
                          {si < mod.steps.length - 1 && (
                            <div className={`w-px h-3 mt-0.5 ${step.done ? 'bg-emerald-500/30' : 'bg-white/6'}`} />
                          )}
                        </div>
                        <span className={`text-[12px] leading-none pb-3 ${
                          step.done ? 'text-white/30 line-through' : (step as any).active ? 'text-white font-semibold' : (step as any).locked ? 'text-white/18' : 'text-white/40'
                        }`}>
                          {step.title}
                        </span>
                        {(step as any).active && (
                          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 flex-shrink-0">
                            In Progress
                          </span>
                        )}
                        {(step as any).locked && (
                          <span className="ml-auto text-[10px] text-white/15 flex-shrink-0">Locked</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ── SECTION 5: Mentor Showcase ────────────────────────────────────────────────

function MentorShowcase() {
  const mentors = [
    {
      initials: 'SR',
      name: 'Shreya Raina',
      title: 'Product Lead · Google',
      domain: 'Product Strategy',
      rating: 4.9,
      sessions: 42,
      gradient: 'from-violet-600 to-indigo-600',
      tags: ['Product Management', 'UX Research', 'Agile'],
      verified: true,
    },
    {
      initials: 'RM',
      name: 'Rohan Mehta',
      title: 'Staff Eng · Stripe',
      domain: 'Backend Engineering',
      rating: 4.8,
      sessions: 67,
      gradient: 'from-indigo-600 to-blue-600',
      tags: ['System Design', 'APIs', 'Go'],
      verified: true,
    },
    {
      initials: 'AK',
      name: 'Ananya Kumar',
      title: 'ML Researcher · DeepMind',
      domain: 'Machine Learning',
      rating: 5.0,
      sessions: 28,
      gradient: 'from-emerald-600 to-teal-600',
      tags: ['ML Fundamentals', 'PyTorch', 'NLP'],
      verified: true,
    },
  ];

  return (
    <section className="bg-[#0C0C14] py-28 px-5 lg:px-8 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16 space-y-4">
          <Pill className="text-indigo-300 border-indigo-500/25 bg-indigo-500/10">
            <Award className="w-3 h-3" />
            Verified industry experts
          </Pill>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Learn from practitioners, not professors
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            Every mentor on AscendPath is verified, reviewed, and actively working in their field.
          </p>
        </FadeIn>

        <StaggerGroup delay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {mentors.map((mentor, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-[#111118] border border-white/6 rounded-2xl overflow-hidden hover:border-white/12 hover:shadow-lg hover:shadow-violet-500/5 transition-all group">
                {/* Header gradient strip */}
                <div className={`h-16 bg-gradient-to-br ${mentor.gradient} relative`}>
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
                  {mentor.verified && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                      <Shield className="w-2.5 h-2.5 text-white" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 -mt-7">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mentor.gradient} flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-[#111118] mb-3`}>
                    {mentor.initials}
                  </div>

                  <div className="mb-3">
                    <h3 className="text-white font-bold text-base">{mentor.name}</h3>
                    <p className="text-white/35 text-xs mt-0.5">{mentor.title}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/8">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-white/35">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-white">{mentor.rating}</span>
                      </span>
                      <span>{mentor.sessions} sessions</span>
                    </div>
                    <button className="text-[11px] font-bold px-3 py-1 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white transition-colors group-hover:bg-violet-600">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>

        <FadeIn className="text-center">
          <Link to="/explore">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/60 hover:text-white font-semibold text-sm rounded-xl transition-all">
              Browse all mentors <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

// ── SECTION 6: Social Proof / Stats ───────────────────────────────────────────

function SocialProof() {
  const stats = [
    { value: '2,400+', label: 'Roadmap milestones completed', icon: <CheckCircle2 className="w-5 h-5" /> },
    { value: '180+', label: 'Mentorship sessions hosted', icon: <Users className="w-5 h-5" /> },
    { value: '350+', label: 'Active learners & growing', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '4.9★', label: 'Average mentor rating', icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <section className="bg-[#0A0A0F] py-24 px-5 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <StaggerGroup delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-[#0E0E17] border border-white/6 rounded-2xl p-6 text-center group hover:border-violet-500/20 transition-all">
                <div className="text-violet-400 flex justify-center mb-3 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-white/35 leading-relaxed">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>

        {/* Testimonial */}
        <FadeIn delay={0.2} className="mt-10">
          <div className="bg-gradient-to-br from-violet-900/20 via-[#0E0E1A] to-indigo-900/15 border border-violet-500/15 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-base flex-shrink-0">
                PS
              </div>
              <div>
                <p className="text-white/70 text-base leading-relaxed mb-4 italic">
                  "AscendPath completely changed how I approached my career transition. The roadmaps gave me a clear path, and my mentor helped me course-correct at every step. Landed a PM role within 6 months."
                </p>
                <div>
                  <p className="text-white font-bold text-sm">Priya Sharma</p>
                  <p className="text-white/35 text-xs">Transitioned: Software Engineer → Product Manager</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── SECTION 7: Session & Workshop Preview ─────────────────────────────────────

function SessionWorkshopPreview() {
  const sessions = [
    {
      type: 'PRIVATE',
      typeColor: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
      title: '1-on-1 Career Transition Session',
      host: 'Shreya Raina · Product Lead @ Google',
      time: 'Tomorrow, 10:00 AM',
      icon: <Lock className="w-3 h-3" />,
      spots: null,
      action: 'Book Session',
      actionStyle: 'bg-violet-600 hover:bg-violet-500 text-white',
    },
    {
      type: 'WORKSHOP',
      typeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      title: 'System Design Fundamentals — Open to All',
      host: 'Rohan Mehta · Staff Eng @ Stripe',
      time: 'Sat, May 30 · 3:00 PM',
      icon: <Globe className="w-3 h-3" />,
      spots: '12 spots left',
      action: 'Join Workshop',
      actionStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    {
      type: 'LIVE',
      typeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
      title: 'Breaking into ML: Ask Me Anything',
      host: 'Ananya Kumar · ML Researcher @ DeepMind',
      time: 'Live now',
      icon: <Play className="w-3 h-3" />,
      spots: 'Join live',
      action: 'Join Now',
      actionStyle: 'bg-rose-600 hover:bg-rose-500 text-white',
    },
  ];

  return (
    <section className="bg-[#0C0C14] py-28 px-5 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16 space-y-4">
          <Pill className="text-emerald-300 border-emerald-500/25 bg-emerald-500/10">
            <Video className="w-3 h-3" />
            Live sessions & workshops
          </Pill>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Private mentorship to public workshops
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            One-on-one depth when you need guidance, community energy for shared learning.
          </p>
        </FadeIn>

        <StaggerGroup delay={0.1} className="space-y-4">
          {sessions.map((session, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-[#111118] border border-white/6 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/12 transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${session.typeColor}`}>
                      {session.icon}
                      {session.type}
                    </span>
                    {session.spots && (
                      <span className="text-[11px] text-white/30 font-medium">{session.spots}</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-[15px] mb-1 leading-snug">{session.title}</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-white/35">{session.host}</span>
                    <span className="flex items-center gap-1 text-xs text-white/25">
                      <Clock className="w-3 h-3" /> {session.time}
                    </span>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex-shrink-0 ${session.actionStyle} hover:scale-105`}>
                  {session.action}
                </button>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

// ── SECTION 8: Final CTA ──────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="bg-[#0A0A0F] py-28 px-5 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn className="space-y-8">
          <div className="space-y-5">
            <Pill className="text-violet-300 border-violet-500/25 bg-violet-500/10">
              <Sparkles className="w-3 h-3" />
              Your growth starts here
            </Pill>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Start your career growth journey.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Today.
              </span>
            </h2>
            <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
              Join a community of ambitious learners, connect with verified mentors, and follow a structured path to the career you want.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/register">
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-base shadow-2xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Join as Learner
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link to="/auth/register">
              <button className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 text-white/70 hover:text-white font-semibold rounded-xl text-base transition-all">
                <Users className="w-4 h-4" />
                Become a Mentor
              </button>
            </Link>
            <Link to="/explore">
              <button className="inline-flex items-center gap-2 px-8 py-4 border border-white/8 hover:border-white/15 hover:bg-white/4 text-white/50 hover:text-white/80 font-semibold rounded-xl text-base transition-all">
                <Map className="w-4 h-4" />
                Explore Roadmaps
              </button>
            </Link>
          </div>

          {/* Small assurance line */}
          <p className="text-white/20 text-xs">
            Free to join · No credit card required · Start learning in minutes
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="bg-[#070709] border-t border-white/5 py-10 px-5 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-white/40 text-sm font-semibold">AscendPath</span>
        </div>
        <div className="flex items-center gap-5">
          {['Community', 'Roadmaps', 'Mentors', 'Forum'].map((item) => (
            <Link key={item} to="/explore" className="text-xs text-white/25 hover:text-white/50 transition-colors">
              {item}
            </Link>
          ))}
        </div>
        <p className="text-xs text-white/20">© 2025 AscendPath. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ── Root Landing Page ─────────────────────────────────────────────────────────

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <HowItWorks />
      <FeatureEcosystem />
      <RoadmapShowcase />
      <MentorShowcase />
      <SocialProof />
      <SessionWorkshopPreview />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};
