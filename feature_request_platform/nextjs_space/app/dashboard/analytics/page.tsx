import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse</h1>
        <p className="text-muted-foreground">Bekijk inzichten en trends voor functieverzoeken.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
