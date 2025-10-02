import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Calendar, Zap, Smile } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

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
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">memories created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week}</div>
            <p className="text-xs text-muted-foreground">memories this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.month}</div>
            <p className="text-xs text-muted-foreground">memories this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMood}/10</div>
            <p className="text-xs text-muted-foreground">average mood score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Your memory activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="memories" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="memories">Memories</TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
            </TabsList>

            <TabsContent value="memories" className="space-y-4 mt-4">
              <div className="space-y-2">
                {analytics.slice(0, 7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMM d")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min((item.memory_count / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.memory_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mood" className="space-y-4 mt-4">
              <div className="space-y-2">
                {analytics.filter(a => a.mood_score !== null).slice(0, 7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMM d")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary rounded-full transition-all"
                          style={{ width: `${(item.mood_score! / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.mood_score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="energy" className="space-y-4 mt-4">
              <div className="space-y-2">
                {analytics.filter(a => a.energy_level !== null).slice(0, 7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMM d")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary rounded-full transition-all"
                          style={{ width: `${(item.energy_level! / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.energy_level}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
