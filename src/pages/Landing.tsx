import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Sparkles, Brain, Clock, Shield, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
      description: "Your personal memory companion that understands and organizes your thoughts"
    },
    {
      icon: Clock,
      title: "Timeline View",
      description: "Beautiful kanban-style organization of your memories across time"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your memories are encrypted and only accessible to you"
    },
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Real-time synchronization across all your devices"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex gap-2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 border shadow-lg">
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTheme("light")}
          className="rounded-full h-9 w-9"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTheme("dark")}
          className="rounded-full h-9 w-9"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTheme("system")}
          className="rounded-full h-9 w-9"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-3xl flex items-center justify-center shadow-glow mx-auto mb-8"
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Meet Alma
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Your AI-powered personal memory companion.<br />
            Never forget the moments that matter.
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Sign Up
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </motion.div>

        {/* Bento Grid Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`
                  group relative overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm p-8
                  hover:shadow-elevated transition-all duration-300 hover:-translate-y-1
                  ${index === 0 ? 'md:col-span-2' : ''}
                `}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                      linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20 text-muted-foreground"
        >
          <p className="text-sm">
            © 2025 MeetAlma.ai • Your memories, beautifully organized
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
