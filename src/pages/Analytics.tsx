import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your memory activity and insights</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
