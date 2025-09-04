import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

export type ViewMode = "daily" | "weekly" | "monthly";

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewModeConfig = {
  daily: {
    label: "Daily",
    icon: Calendar,
    description: "Today, Yesterday, This Week..."
  },
  weekly: {
    label: "Weekly", 
    icon: CalendarDays,
    description: "This Week, Last Week, 2 Weeks Ago..."
  },
  monthly: {
    label: "Monthly",
    icon: CalendarRange,
    description: "This Month, Last Month, 2 Months Ago..."
  }
};

export const ViewModeSelector = ({ viewMode, onViewModeChange }: ViewModeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
      {(Object.keys(viewModeConfig) as ViewMode[]).map((mode) => {
        const config = viewModeConfig[mode];
        const Icon = config.icon;
        const isActive = viewMode === mode;

        return (
          <Button
            key={mode}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange(mode)}
            className={`flex items-center gap-2 transition-all ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-soft" 
                : "hover:bg-background/80"
            }`}
            title={config.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
};