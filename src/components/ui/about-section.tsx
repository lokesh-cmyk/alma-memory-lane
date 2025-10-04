import { Brain, Heart, Shield, Sparkles } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 grid-lines opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Alma</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Your Personal Memory
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Guardian
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alma is more than just a memory app—it's your AI-powered companion that helps you capture, 
              organize, and cherish every meaningful moment of your life.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent</h3>
              <p className="text-muted-foreground">
                AI-powered categorization and smart search to find any memory instantly.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal</h3>
              <p className="text-muted-foreground">
                Designed with care to make preserving your memories feel natural and meaningful.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-muted-foreground">
                Your privacy is paramount. All memories are encrypted and completely private.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-border/50 p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe that every moment matters. Alma was created to help you build a rich, 
              searchable archive of your life's experiences, so you can revisit cherished memories 
              and gain insights from your personal journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
