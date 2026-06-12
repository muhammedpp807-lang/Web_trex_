'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MessageSquare,
  Globe,
  Sparkles,
  Send,
  Bot,
  User,
  Code,
  Eye,
  Copy,
  Check,
  Loader2,
  Zap,
  Brain,
  Palette,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Trash2,
  RotateCcw,
  Download,
  ArrowDown,
  ExternalLink,
  Swords,
  Cpu,
  Rocket,
  Shield,
  Trophy,
  Star,
  Flame,
  Target,
  TrendingUp,
  Crown,
  Home as HomeIcon,
  LogOut,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { auth, googleProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

type ActiveSection = 'arena' | 'chat' | 'website';

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 300, damping: 25 },
};

const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(16, 185, 129, 0.1)',
      '0 0 40px rgba(16, 185, 129, 0.3)',
      '0 0 20px rgba(16, 185, 129, 0.1)',
    ],
  },
  transition: { duration: 2, repeat: Infinity },
};

// ==================== SIGN IN SECTION ====================
function SignInSection({ onSignIn }: { onSignIn: (user: FirebaseUser) => void }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if running on mobile
  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Handle redirect result on page load (for mobile sign-in)
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        onSignIn(result.user);
      }
    }).catch((err) => {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    });
  }, [onSignIn]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      if (isMobile()) {
        // On mobile, use redirect so it opens the device's Google account picker
        await signInWithRedirect(auth, googleProvider);
      } else {
        // On desktop, use popup
        const result = await signInWithPopup(auth, googleProvider);
        onSignIn(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add it in Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Google sign-in is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        onSignIn(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onSignIn(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Email/Password sign-in is not enabled yet. Please enable it in Firebase Console: Authentication > Sign-in method > Email/Password > Enable.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <MeshGradient />
      <FloatingParticles count={15} />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Logo */}
        <motion.div variants={scaleIn} className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-500/30"
            />
            <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <Swords className="h-8 w-8 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h1 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Web_Trex_
            </span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">AI Arena</p>
        </motion.div>

        {/* Sign In Card */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl p-8"
        >
          {!showEmailForm ? (
            <>
              <h2 className="text-xl font-bold text-center mb-6">Welcome to Web_Trex_</h2>

              {/* Google Sign In Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span className="text-zinc-700 dark:text-zinc-200">Continue with Google</span>
                </button>
              </motion.div>

              {/* OR Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-xs text-muted-foreground font-medium uppercase">or</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {/* Email Sign In Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => { setShowEmailForm(true); setError(''); }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all text-sm font-medium shadow-sm text-white dark:text-zinc-900"
                >
                  <Mail className="h-5 w-5" />
                  Continue with email
                </button>
              </motion.div>

              {/* Disclaimer */}
              <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
                By continuing, you acknowledge Web_Trex_&apos;s Privacy Policy and agree to the Terms of Service.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-2">
                {isSignUp ? 'Create Account' : 'Sign In with Email'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                {isSignUp ? 'Enter your email and create a password' : 'Enter your email and password'}
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="border-border/40 focus:border-emerald-500/50"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSignIn(); }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="border-border/40 focus:border-emerald-500/50"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSignIn(); }}
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-5">
                <Button
                  onClick={handleEmailSignIn}
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 py-6 text-base font-semibold"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </motion.div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => { setShowEmailForm(false); setError(''); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to options
                </button>
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p variants={fadeInUp} className="text-center text-[11px] text-muted-foreground mt-6">
          Web_Trex_ Arena &middot; Powered by AI &middot; Built with Next.js
        </motion.p>
      </motion.div>
    </div>
  );
}

// ==================== ANIMATED COUNTER ====================
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 1500;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setCount(start);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ==================== FLOATING PARTICLES ====================
function FloatingParticles({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-500/10"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 60, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ==================== MESH GRADIENT BACKGROUND ====================
function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-emerald-500/5 blur-[120px]"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-teal-500/5 blur-[120px]"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-cyan-500/3 blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ==================== SCROLL TO BOTTOM ====================
function ScrollToBottom({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
      className="absolute bottom-24 right-6 z-10 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:shadow-emerald-500/50 hover:shadow-xl transition-all"
    >
      <ArrowDown className="h-5 w-5" />
    </motion.button>
  );
}

// ==================== ARENA HOME SECTION ====================
function ArenaHomeSection({ onNavigate }: { onNavigate: (section: ActiveSection) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

  const features = [
    { icon: <Swords className="h-6 w-6" />, title: 'AI Arena', desc: 'Battle-test your ideas with the most powerful AI. Ask anything, get instant answers.', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', action: 'chat' as ActiveSection },
    { icon: <Globe className="h-6 w-6" />, title: 'Website Forge', desc: 'Generate complete websites from a single description. Preview, edit, and download instantly.', color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20', action: 'website' as ActiveSection },
    { icon: <Brain className="h-6 w-6" />, title: 'Deep Knowledge', desc: 'From coding to philosophy, get thorough explanations with examples and context.', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20', action: 'chat' as ActiveSection },
    { icon: <Zap className="h-6 w-6" />, title: 'Lightning Fast', desc: 'Powered by cutting-edge AI with optimized response times under 2 seconds.', color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20', action: 'chat' as ActiveSection },
  ];

  const leaderboard = [
    { rank: 1, name: 'Web_Trex_ AI', score: 2847, badge: <Crown className="h-4 w-4 text-amber-500" /> },
    { rank: 2, name: 'Code Expert', score: 2634, badge: <Trophy className="h-4 w-4 text-gray-400" /> },
    { rank: 3, name: 'Creative Pro', score: 2421, badge: <Star className="h-4 w-4 text-amber-700" /> },
  ];

  const stats = [
    { label: 'Chats Served', value: 12847, suffix: '+', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Websites Built', value: 3421, suffix: '+', icon: <Globe className="h-5 w-5" /> },
    { label: 'Uptime', value: 99, suffix: '.9%', icon: <Shield className="h-5 w-5" /> },
    { label: 'Avg Response', value: 1, suffix: '.8s', icon: <Cpu className="h-5 w-5" /> },
  ];

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      <div className="relative">
        {/* Hero Section */}
        <motion.section style={{ y: heroY, opacity: heroOpacity }} className="relative min-h-[85vh] flex items-center justify-center px-6 py-20 overflow-hidden">
          <MeshGradient />
          <FloatingParticles count={20} />

          <motion.div
            className="text-center max-w-4xl mx-auto relative z-10"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Animated Logo */}
            <motion.div variants={scaleIn} className="relative w-28 h-28 mx-auto mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-500/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-xl border border-emerald-500/20"
              />
              <div className="absolute inset-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <Swords className="h-10 w-10 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-teal-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Web_Trex_
              </span>
            </motion.h1>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-500">Arena</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
            </motion.div>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered arena for answers, code, and creativity.
              <span className="text-emerald-500 font-semibold"> Battle-tested intelligence.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onNavigate('chat')}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all px-8 py-6 text-lg font-semibold"
                >
                  <Rocket className="h-5 w-5" />
                  Enter Arena
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onNavigate('website')}
                  variant="outline"
                  className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 px-8 py-6 text-lg"
                >
                  <Globe className="h-5 w-5" />
                  Build Website
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground/50"
            >
              <ArrowDown className="h-5 w-5 mx-auto" />
              <span className="text-xs">Scroll to explore</span>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <section className="px-6 py-16 border-t border-border/20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative p-5 rounded-2xl border border-border/20 bg-muted/10 backdrop-blur-sm text-center group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="text-emerald-500 mx-auto w-fit mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black mb-3">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  Arena Features
                </span>
              </h2>
              <p className="text-muted-foreground">Everything you need, powered by AI</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNavigate(feat.action)}
                  className={`group cursor-pointer relative p-6 rounded-2xl border border-border/20 bg-muted/5 backdrop-blur-sm overflow-hidden transition-all hover:border-emerald-500/30 hover:shadow-xl ${feat.shadow}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shadow-lg ${feat.shadow}`}>
                      {feat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="px-6 py-16 border-t border-border/20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-black mb-3">
                <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
                  Arena Leaderboard
                </span>
              </h2>
              <p className="text-muted-foreground">Top performing AI models ranked by users</p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-lg mx-auto space-y-3"
            >
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    entry.rank === 1
                      ? 'border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                      : 'border-border/20 bg-muted/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                    entry.rank === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
                    entry.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                    'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold">
                      {entry.name}
                      {entry.badge}
                    </div>
                    <div className="text-xs text-muted-foreground">Arena Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-500">{entry.score.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500">
                      <TrendingUp className="h-3 w-3" />
                      +12
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center relative"
          >
            <FloatingParticles count={8} />
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <Flame className="h-16 w-16 text-orange-500" />
              </motion.div>
              <h2 className="text-3xl font-black mb-4">Ready to Enter the Arena?</h2>
              <p className="text-muted-foreground mb-8">Start chatting with AI or build your dream website in seconds.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => onNavigate('chat')} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 px-8 py-6 text-base font-semibold">
                    <Swords className="h-5 w-5" />
                    Start Chatting
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => onNavigate('website')} variant="outline" className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10 px-8 py-6 text-base">
                    <Globe className="h-5 w-5" />
                    Create Website
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">
            Web_Trex_ Arena &middot; Powered by AI &middot; Built with Next.js
          </p>
        </footer>
      </div>
    </div>
  );
}

// ==================== CHAT SECTION ====================
function ChatSection() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const createNewChat = () => {
    const newConv: ChatConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let convId = activeConvId;

    if (!convId) {
      const newConv: ChatConversation = {
        id: Date.now().toString(),
        title: input.slice(0, 40) + (input.length > 40 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConvId(convId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 ? input.slice(0, 40) + (input.length > 40 ? '...' : '') : c.title }
          : c
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      const currentConv = conversations.find((c) => c.id === convId);
      const chatHistory = [
        ...(currentConv?.messages || []).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: input },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.',
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, aiMessage] } : c))
      );
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error connecting to the AI. Please try again.',
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, errorMessage] } : c))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r border-border/30 bg-muted/10 backdrop-blur-sm flex flex-col shrink-0">
        <div className="p-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={createNewChat} className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              New Chat
            </Button>
          </motion.div>
        </div>
        <ScrollArea className="flex-1 px-2">
          <motion.div className="space-y-1" variants={staggerContainer} initial="initial" animate="animate">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                variants={staggerItem}
                whileHover={{ x: 2 }}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all text-sm ${
                  activeConvId === conv.id
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20'
                    : 'hover:bg-muted/30 border border-transparent'
                }`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {activeConv ? (
          <>
            <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
              <div className="max-w-3xl mx-auto space-y-4">
                {activeConv.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
                      >
                        <Bot className="h-4 w-4" />
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-muted/80 backdrop-blur-sm border border-border/30'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </motion.div>
                    {msg.role === 'user' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20"
                      >
                        <User className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted/80 backdrop-blur-sm border border-border/30 rounded-2xl px-5 py-3">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} className="w-2 h-2 rounded-full bg-emerald-500"
                            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <ScrollToBottom scrollRef={scrollRef} />

            {/* Input */}
            <div className="border-t border-border/30 p-4 bg-background/80 backdrop-blur-lg">
              <div className="max-w-3xl mx-auto flex gap-3 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask me anything... (Press Enter to send)"
                  className="resize-none min-h-[48px] max-h-[200px] border-emerald-500/20 focus:border-emerald-500/50 transition-colors"
                  rows={1}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon"
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                    <Send className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8 relative">
            <FloatingParticles />
            <motion.div className="text-center max-w-lg relative z-10" initial="initial" animate="animate" variants={staggerContainer}>
              <motion.div variants={scaleIn} className="relative w-24 h-24 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-500/30" />
                <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Swords className="h-10 w-10 text-white" />
                </div>
                <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </motion.div>

              <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Chat with Web_Trex_</span>
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-muted-foreground mb-8">
                Your AI-powered arena for answers, code, and creativity.
              </motion.p>

              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3 text-sm mb-8">
                {[
                  { icon: <Code className="h-5 w-5" />, text: 'Coding Help', color: 'from-blue-500 to-cyan-500' },
                  { icon: <Brain className="h-5 w-5" />, text: 'Explain Topics', color: 'from-purple-500 to-pink-500' },
                  { icon: <Palette className="h-5 w-5" />, text: 'Creative Ideas', color: 'from-orange-500 to-amber-500' },
                  { icon: <Zap className="h-5 w-5" />, text: 'Quick Answers', color: 'from-emerald-500 to-teal-500' },
                ].map((item, i) => (
                  <motion.button key={i} variants={staggerItem} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setInput(item.text); createNewChat(); }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all text-left shadow-md">
                    <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.button>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={createNewChat} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 px-8 py-6 text-base">
                    <Rocket className="h-5 w-5" />
                    Start New Chat
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== WEBSITE CREATOR SECTION ====================
function WebsiteCreatorSection() {
  const [description, setDescription] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const loadingSteps = [
    'Understanding your requirements...',
    'Designing the layout...',
    'Adding styles and animations...',
    'Generating final code...',
  ];

  const generateWebsite = async () => {
    if (!description.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedHtml('');
    setErrorMsg('');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 8000);

    try {
      const res = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      clearInterval(stepInterval);
      const data = await res.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        setActiveTab('preview');
      } else {
        setErrorMsg(data.error || 'Failed to generate. Please try again.');
      }
    } catch {
      clearInterval(stepInterval);
      setErrorMsg('Failed to connect to server. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = description.trim().slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'website';
    a.download = `${safeName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPreview = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const templates = [
    { name: 'Portfolio', desc: 'A personal portfolio website showcasing projects and skills', icon: <User className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Business', desc: 'A professional business website with services and contact', icon: <Globe className="h-5 w-5" />, color: 'from-emerald-500 to-teal-500' },
    { name: 'Restaurant', desc: 'A restaurant website with food menu and reservations', icon: <Palette className="h-5 w-5" />, color: 'from-orange-500 to-amber-500' },
    { name: 'Landing Page', desc: 'A product landing page with features and pricing', icon: <Zap className="h-5 w-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Blog', desc: 'A clean personal blog website with article listings', icon: <Code className="h-5 w-5" />, color: 'from-rose-500 to-red-500' },
    { name: 'E-Commerce', desc: 'An online shop storefront with product cards and cart', icon: <Sparkles className="h-5 w-5" />, color: 'from-teal-500 to-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top Input Area */}
      <div className="border-b border-border/30 p-4 bg-muted/10 backdrop-blur-sm shrink-0">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
            Website Creator
          </motion.h2>
          <div className="flex gap-2">
            <Input value={description} onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generateWebsite(); }}
              placeholder="Describe the website you want to create... (e.g., 'A modern coffee shop website with menu and contact page')"
              className="flex-1 border-emerald-500/20 focus:border-emerald-500/50 transition-colors" />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={generateWebsite} disabled={!description.trim() || isGenerating}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
            </motion.div>
          </div>

          {/* Template Quick Picks */}
          <motion.div className="mt-3 flex gap-2 flex-wrap" variants={staggerContainer} initial="initial" animate="animate">
            {templates.map((t, i) => (
              <motion.button key={i} variants={staggerItem} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDescription(t.desc)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border/30 bg-background/50 backdrop-blur-sm hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 transition-all shadow-sm">
                {t.icon} {t.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Result Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {generatedHtml ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-full">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')} className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/20 backdrop-blur-sm">
                <TabsList>
                  <TabsTrigger value="preview" className="gap-1.5"><Eye className="h-3.5 w-3.5" />Preview</TabsTrigger>
                  <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" />Code</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5">
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={downloadHtml} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />Download
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={openPreview} className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />Open in New Tab
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={generateWebsite} disabled={isGenerating} className="gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" />Regenerate
                    </Button>
                  </motion.div>
                </div>
              </div>
              <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-auto">
                <iframe srcDoc={generatedHtml} className="w-full border-0" style={{ minHeight: '600px', height: '100%' }} title="Website Preview" sandbox="allow-scripts" />
              </TabsContent>
              <TabsContent value="code" className="flex-1 m-0 p-0 overflow-auto">
                <div className="h-full bg-zinc-950 text-green-400 p-4 overflow-y-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                    <code>{generatedHtml}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <motion.div className="text-center max-w-sm" initial="initial" animate="animate" variants={staggerContainer}>
              <motion.div variants={scaleIn} className="relative w-24 h-24 mx-auto mb-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Sparkles className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                </div>
              </motion.div>
              <motion.p variants={fadeInUp} className="text-lg font-semibold mb-2">Creating your website</motion.p>
              <motion.div variants={fadeInUp} className="space-y-2 mt-4">
                {loadingSteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                    className={`flex items-center gap-2 text-sm transition-all duration-500 ${
                      i <= loadingStep ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/40'
                    }`}>
                    {i < loadingStep ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-4 w-4 shrink-0" /></motion.div> :
                     i === loadingStep ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> :
                     <div className="h-4 w-4 shrink-0 rounded-full border border-current" />}
                    <span>{step}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-xs mt-6">Usually takes 15-30 seconds</motion.p>
            </motion.div>
          </div>
        ) : errorMsg ? (
          <div className="h-full flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-bold mb-2">Generation Failed</h3>
              <p className="text-muted-foreground mb-4 text-sm">{errorMsg}</p>
              <Button onClick={generateWebsite} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />Try Again
              </Button>
            </motion.div>
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex items-center justify-center p-8 relative">
            <FloatingParticles />
            <motion.div className="text-center max-w-md relative z-10" initial="initial" animate="animate" variants={staggerContainer}>
              <motion.div variants={scaleIn} className="relative w-24 h-24 mx-auto mb-6">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-500/30" />
                <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Globe className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <motion.h3 variants={fadeInUp} className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Create a Website</span>
              </motion.h3>
              <motion.p variants={fadeInUp} className="text-muted-foreground mb-6">
                Type a description above and click <strong>Generate</strong> — or pick a template below!
              </motion.p>
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3 text-sm">
                {templates.map((t, i) => (
                  <motion.button key={i} variants={staggerItem} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setDescription(t.desc)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all text-left shadow-sm">
                    <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white`}>
                      {t.icon}
                    </div>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{t.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { id: 'arena' as ActiveSection, label: 'Arena Home', icon: HomeIcon, desc: 'Explore', badge: '' },
    { id: 'chat' as ActiveSection, label: 'AI Chat', icon: MessageSquare, desc: 'Ask anything', badge: 'LIVE' },
    { id: 'website' as ActiveSection, label: 'Website Creator', icon: Globe, desc: 'Build websites', badge: 'NEW' },
  ];

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl border-4 border-emerald-500/20 border-t-emerald-500"
          />
          <p className="text-muted-foreground text-sm">Loading Web_Trex_...</p>
        </motion.div>
      </div>
    );
  }

  // Show sign-in screen if not authenticated
  if (!currentUser) {
    return <SignInSection onSignIn={setCurrentUser} />;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = currentUser.displayName || currentUser.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="border-r border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden shrink-0 flex flex-col"
      >
        {sidebarOpen && (
          <div className="w-[260px] flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-border/20">
              <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                <motion.div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                  <Swords className="h-5 w-5 text-white" />
                  <motion.div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                </motion.div>
                <div>
                  <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    Web_Trex_
                  </h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Arena</p>
                </div>
              </motion.div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-2">
              {navItems.map((item, idx) => (
                <motion.button key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }} onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left group relative overflow-hidden ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'hover:bg-muted/30 border border-transparent'
                  }`}>
                  {activeSection === item.id && (
                    <motion.div layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                  )}
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-muted/50 text-muted-foreground group-hover:text-foreground'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs ${activeSection === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {item.desc}
                    </div>
                  </div>
                  {activeSection === item.id && <ChevronRight className="h-4 w-4 shrink-0 text-emerald-500" />}
                  {item.badge && activeSection !== item.id && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Stats */}
            <div className="px-4 pb-2">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Cpu className="h-3 w-3" /> Arena Stats
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-500">99.9%</div>
                    <div className="text-[10px] text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-500">&lt;2s</div>
                    <div className="text-[10px] text-muted-foreground">Response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile + Bottom */}
            <div className="p-3 border-t border-border/20">
              {/* User Info */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-muted/20 border border-border/10">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={getUserDisplayName()} className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold border-2 border-emerald-500/30">
                    {getUserInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{getUserDisplayName()}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/30 transition-all text-xs">
                  <motion.div key={isDark ? 'dark' : 'light'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                    {isDark ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                  </motion.div>
                  {isDark ? 'Light' : 'Dark'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border/30 flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
            <div className="flex items-center gap-2">
              {navItems.map((item) =>
                activeSection === item.id ? (
                  <motion.div key={item.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <item.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </motion.div>
                ) : null
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User avatar in header */}
            <div className="flex items-center gap-2">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {getUserInitials()}
                </div>
              )}
              <span className="text-xs text-muted-foreground hidden sm:inline">{getUserDisplayName()}</span>
            </div>
            <motion.div animate={glowPulse.animate} transition={glowPulse.transition}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              Online
            </motion.div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 text-[10px] text-muted-foreground border border-border/20">
              <Shield className="h-3 w-3" /> Secure
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0 relative overflow-y-auto">
          <div className={`h-full ${activeSection === 'arena' ? '' : 'hidden'}`}>
            <ArenaHomeSection onNavigate={setActiveSection} />
          </div>
          <div className={`h-full ${activeSection === 'chat' ? '' : 'hidden'}`}>
            <ChatSection />
          </div>
          <div className={`h-full ${activeSection === 'website' ? '' : 'hidden'}`}>
            <WebsiteCreatorSection />
          </div>
        </div>
      </main>
    </div>
  );
}
