import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  LogOut, 
  Plus, 
  BarChart3, 
  Bell,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { CreateMemoryDialog } from "@/components/dashboard/CreateMemoryDialog";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      navigate("/");
    }
  };

  // const toggleTheme = () => {
  //   setTheme(theme === "dark" ? "light" : "dark");
  // };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h1 className="text-xl text-blue-500 font-bold bg-gradient-primary bg-clip-text">
                MeetAlma
              </h1>
              <p className="text-xs text-muted-foreground">Memory Companion</p>
            </div>
          </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* <Button
              variant="ghost"
              size="sm"
              // onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button> */}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-0 hover:opacity-90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Memory</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/analytics")}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/reminders")}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/50 bg-background/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MeetAlma.ai - Your AI-powered personal memory companion</p>
          <p className="mt-1">
            Welcome back, {user?.phone || user?.email}
          </p>
        </div>
      </footer>

      <CreateMemoryDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onMemoryCreated={() => {
          // Trigger a refresh of memories - this will be handled by the parent
          window.location.reload();
        }}
      />
    </div>
  );
};