import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RemindersPanel } from "@/components/dashboard/RemindersPanel";

const Reminders = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Manage your upcoming events and reminders</p>
        </div>
        <RemindersPanel />
      </div>
    </DashboardLayout>
  );
};

export default Reminders;
