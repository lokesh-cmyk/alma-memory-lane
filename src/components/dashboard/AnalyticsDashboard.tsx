import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Zap, Smile, Brain, Heart, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { motion } from "framer-motion";

interface AnalyticsData {
  date: string;
  mood_score: number | null;
  energy_level: number | null;
  memory_count: number;
}

interface Stats {
  today: number;
  week: number;
  month: number;
  avgMood: number;
  avgEnergy: number;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0, avgMood: 0, avgEnergy: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      if (error) throw error;

      setAnalytics(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: AnalyticsData[]) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const today = data.filter(d => new Date(d.date) >= todayStart).reduce((sum, d) => sum + d.memory_count, 0);
    const week = data.filter(d => new Date(d.date) >= weekStart).reduce((sum, d) => sum + d.memory_count, 0);
    const month = data.filter(d => new Date(d.date) >= monthStart).reduce((sum, d) => sum + d.memory_count, 0);

    const moodScores = data.filter(d => d.mood_score !== null).map(d => d.mood_score!);
    const energyLevels = data.filter(d => d.energy_level !== null).map(d => d.energy_level!);

    const avgMood = moodScores.length > 0 ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length) : 0;
    const avgEnergy = energyLevels.length > 0 ? Math.round(energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length) : 0;

    setStats({ today, week, month, avgMood, avgEnergy });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 shadow-lg bg-transparent backdrop-blur-sm">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 mx-auto mb-6 p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl"
                >
                  <Brain className="w-full h-full text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">No analytics data yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start creating memories to see beautiful insights about your journey! Your analytics will appear here automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-transparent backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Today</CardTitle>
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-black mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.today}
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  memories created
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-transparent backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">This Week</CardTitle>
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-black mb-1 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {stats.week}
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  memories this week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-transparent backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">This Month</CardTitle>
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-black mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.month}
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  memories this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-transparent backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Avg Mood</CardTitle>
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-black mb-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.avgMood}<span className="text-2xl">/10</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  average mood score
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 shadow-lg bg-transparent backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Activity Overview</CardTitle>
                  <CardDescription className="text-base">Your memory journey over the last 30 days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="memories" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 mb-6">
                  <TabsTrigger value="memories" className="text-sm font-bold">📝 Memories</TabsTrigger>
                  <TabsTrigger value="mood" className="text-sm font-bold">😊 Mood</TabsTrigger>
                  <TabsTrigger value="energy" className="text-sm font-bold">⚡ Energy</TabsTrigger>
                </TabsList>

              <TabsContent value="memories" className="space-y-4">
                <div className="space-y-3">
                  {analytics.slice(0, 7).map((item, index) => (
                    <motion.div
                      key={item.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-foreground min-w-[80px]">
                        {format(new Date(item.date), "MMM d, yyyy")}
                      </span>
                      <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((item.memory_count / 10) * 100, 100)}%` }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                        <span className="text-base font-black w-10 text-right bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {item.memory_count}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mood" className="space-y-4">
                <div className="space-y-3">
                  {analytics.filter(a => a.mood_score !== null).slice(0, 7).map((item, index) => (
                    <motion.div
                      key={item.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-foreground min-w-[80px]">
                        {format(new Date(item.date), "MMM d, yyyy")}
                      </span>
                      <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.mood_score! / 10) * 100}%` }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                          />
                        </div>
                        <span className="text-base font-black w-12 text-right bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          {item.mood_score}/10
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="energy" className="space-y-4">
                <div className="space-y-3">
                  {analytics.filter(a => a.energy_level !== null).slice(0, 7).map((item, index) => (
                    <motion.div
                      key={item.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-foreground min-w-[80px]">
                        {format(new Date(item.date), "MMM d, yyyy")}
                      </span>
                      <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.energy_level! / 10) * 100}%` }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          />
                        </div>
                        <span className="text-base font-black w-12 text-right bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {item.energy_level}/10
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};