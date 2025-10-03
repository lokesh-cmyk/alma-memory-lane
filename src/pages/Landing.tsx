import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Sparkles, Brain, Clock, Shield, Zap, ArrowRight, Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Navbar animations based on scroll
  const navbarPadding = useTransform(scrollY, [0, 100], ["1.5rem", "0.75rem"]);
  const navbarScale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const navbarBlur = useTransform(scrollY, [0, 100], [8, 16]);
  
  // Mascot animations based on scroll
  const mascotY = useTransform(scrollY, [0, 300, 600, 900], [100, -20, 100, -20]);
  const mascotRotate = useTransform(scrollY, [0, 300, 600], [0, 10, -10]);
  const mascotOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return null;
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Memory",
      description: "Your personal memory companion that understands and organizes your thoughts intelligently"
    },
    {
      icon: Clock,
      title: "Timeline View",
      description: "Beautiful kanban-style organization of your memories across time"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Bank-level encryption. Your memories are completely private and secure"
    },
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Real-time synchronization across all your devices seamlessly"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 animate-gradient pointer-events-none" />
      
      {/* Grid Lines Background */}
      <div className="fixed inset-0 grid-lines opacity-40 pointer-events-none" />
      
      {/* Floating Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="fixed top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="fixed bottom-20 left-20 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* iPhone Style Island Navigation */}
      <motion.nav
        style={{
          padding: navbarPadding,
          scale: navbarScale,
        }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
      >
        <motion.div 
          className="glassmorphism rounded-full shadow-2xl px-6 py-3 flex items-center justify-between"
          style={{
            backdropFilter: useTransform(navbarBlur, (value) => `blur(${value}px)`),
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">MeetAlma</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#cta" className="text-sm font-medium hover:text-primary transition-colors">Get Started</a>
            
            {/* Theme Toggle */}
            <div className="flex gap-1 bg-background/50 rounded-full p-1">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("light")}
                className="rounded-full h-7 w-7"
              >
                <Sun className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("dark")}
                className="rounded-full h-7 w-7"
              >
                <Moon className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("system")}
                className="rounded-full h-7 w-7"
              >
                <Monitor className="h-3 w-3" />
              </Button>
            </div>

            {!user ? (
              <Button onClick={() => navigate("/auth")} className="rounded-full">
                Sign In
              </Button>
            ) : (
              <Button onClick={() => navigate("/dashboard")} className="rounded-full">
                Dashboard
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-full"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </motion.div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-3xl mt-2 p-4 flex flex-col gap-3"
          >
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2">Features</a>
            <a href="#cta" className="text-sm font-medium hover:text-primary transition-colors py-2">Get Started</a>
            
            <div className="flex gap-2 justify-center py-2">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("light")}
                className="rounded-full h-8 w-8"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("dark")}
                className="rounded-full h-8 w-8"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme("system")}
                className="rounded-full h-8 w-8"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>

            {!user ? (
              <Button onClick={() => navigate("/auth")} className="rounded-full w-full">
                Sign In
              </Button>
            ) : (
              <Button onClick={() => navigate("/dashboard")} className="rounded-full w-full">
                Dashboard
              </Button>
            )}
          </motion.div>
        )}
      </motion.nav>

      {/* Mascot Character */}
      <motion.div
        style={{
          y: mascotY,
          rotate: mascotRotate,
          opacity: mascotOpacity,
        }}
        className="fixed right-8 top-1/2 z-40 pointer-events-none hidden lg:block"
      >
        <div className="relative">
          {/* Speech Bubble */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-48 top-0 glassmorphism rounded-2xl px-4 py-3 shadow-lg"
          >
            <p className="text-sm font-medium">Your memories are safe! 🛡️</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-3 h-3 glassmorphism" />
          </motion.div>
          
          {/* Mascot */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-glow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-5xl mx-auto mb-32"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-3xl flex items-center justify-center shadow-glow mx-auto mb-8"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
            Meet Alma
          </h1>
          
          <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed font-light">
            Your AI-powered personal memory companion.<br />
            <span className="font-medium bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Never forget the moments that matter.
            </span>
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 rounded-full border-2 hover:bg-primary/5"
              >
                Watch Demo
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </motion.div>

        {/* Bento Grid Features */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-32"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`
                  group relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm p-8
                  hover:shadow-elevated hover:border-primary/30 transition-all duration-300
                  ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}
                  ${index === 3 ? 'md:col-span-2 lg:col-span-1' : ''}
                `}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Grid Lines */}
                <div className="absolute inset-0 grid-lines opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow"
                  >
                    <Icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          id="cta"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto mb-32 overflow-hidden rounded-[3rem] border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 md:p-16"
        >
          {/* Texture Overlay */}
          <div className="absolute inset-0 texture-overlay opacity-30" />
          
          {/* Grid Lines */}
          <div className="absolute inset-0 grid-lines opacity-20" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to preserve your memories?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Alma to keep their precious moments safe and organized.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Decorative Elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 border border-primary/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-40 h-40 border border-primary-glow/20 rounded-full"
          />
        </motion.div>

        {/* Pulsating Gradient Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border/30"
        >
          {/* Pulsating Background */}
          <motion.div
            animate={{
              background: [
                "linear-gradient(135deg, hsl(215 70% 60% / 0.1), hsl(215 85% 75% / 0.1))",
                "linear-gradient(135deg, hsl(215 85% 75% / 0.15), hsl(215 70% 60% / 0.15))",
                "linear-gradient(135deg, hsl(215 70% 60% / 0.1), hsl(215 85% 75% / 0.1))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
          />
          
          {/* Grid Lines */}
          <div className="absolute inset-0 grid-lines opacity-20" />
          
          <div className="relative z-10 p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">MeetAlma</span>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Your memories, beautifully organized
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 MeetAlma.ai • Made with ❤️ for your memories
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Landing;
