import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">View your memory insights and activity patterns</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
