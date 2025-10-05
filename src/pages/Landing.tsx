import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Home, User, Briefcase, FileText } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Tiles } from "@/components/ui/tiles";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Features } from "@/components/ui/features-11";
import { AboutSection } from "@/components/ui/about-section";
import { MinimalFooter } from "@/components/ui/minimal-footer";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
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

  const navItems = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'Features', url: '#features', icon: Briefcase },
    { name: 'About', url: '#about', icon: User },
    { name: user ? 'Dashboard' : 'Sign In', url: user ? '/dashboard' : '/auth', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Tubelight Navigation */}
      <NavBar items={navItems} />

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
            className="glassmorphism rounded-2xl px-4 py-3 shadow-lg absolute -left-48 top-0"
          >
            <p className="text-sm font-medium">Your memories are safe! 🛡️</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-3 h-3 glassmorphism" />
          </motion.div>
          
          {/* Mascot */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Tiles Background */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        {/* Tiles Background - Lowest z-index, no pointer events */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Tiles 
            rows={50} 
            cols={15}
            tileSize="md"
            className="opacity-40"
          />
        </div>
        
        {/* Subtle overlay for better text visibility - no pointer events */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 z-[1] pointer-events-none" />

        {/* Hero Content - High z-index for clickable buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-[100] text-center max-w-5xl mx-auto px-4 py-20 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8 border-2 border-primary"
          >
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
            Meet Alma
          </h1>
          
          <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed font-light max-w-3xl mx-auto">
            Your AI-powered personal memory companion.<br />
            <span className="font-medium bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Never forget the moments that matter.
            </span>
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-[110]">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer shadow-primary pointer-events-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 rounded-full border-2 border-border hover:bg-accent transition-all duration-300 hover:scale-105 cursor-pointer shadow-md pointer-events-auto"
              >
                Watch Demo
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer shadow-primary relative z-[110] pointer-events-auto"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </motion.div>
      </div>

      {/* Bento Grid Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* About Section */}
      <div id="about">
        <AboutSection />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* CTA Banner */}
        <motion.div
          id="cta"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto mb-20 overflow-hidden rounded-[3rem] border-2 border-border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 md:p-16 shadow-lg"
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 grid-lines opacity-10" />
          
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
              className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer z-[50] relative shadow-primary pointer-events-auto"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Decorative Elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 border-2 border-primary/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-40 h-40 border-2 border-primary/20 rounded-full"
          />
        </motion.div>
      </div>

      {/* Minimal Footer */}
      <MinimalFooter />
    </div>
  );
};

export default Landing;
