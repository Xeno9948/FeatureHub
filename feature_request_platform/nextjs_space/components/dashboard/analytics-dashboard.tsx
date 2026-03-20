"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Analytics {
  totalRequests: number;
  pendingRequests: number;
  avgProcessingTime: number;
  statusCounts: { status: string; count: number }[];
  priorityCounts: { priority: string; count: number }[];
  categoryCounts: { categoryName: string; color: string; count: number }[];
  monthlyData: { month: string; count: number }[];
}

const statusColors: Record<string, string> = {
  SUBMITTED: "#3B82F6",
  UNDER_REVIEW: "#F59E0B",
  FINAL_REVIEW: "#8B5CF6",
  ACCEPTED: "#10B981",
  DECLINED: "#EF4444",
  RETURNED: "#F97316",
};

const priorityColors: Record<string, string> = {
  LOW: "#9CA3AF",
  MEDIUM: "#3B82F6",
  HIGH: "#F97316",
  CRITICAL: "#EF4444",
};

export function AnalyticsDashboard() {
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const statusData = (analytics.statusCounts || []).map((item) => ({
    name: t.status?.[item.status as keyof typeof t.status] || item.status,
    value: item.count,
    color: statusColors[item.status] || "#6B7280",
  }));

  const priorityData = (analytics.priorityCounts || []).map((item) => ({
    name: t.priority?.[item.priority as keyof typeof t.priority] || item.priority,
    value: item.count,
    color: priorityColors[item.priority] || "#6B7280",
  }));

  const categoryData = (analytics.categoryCounts || []).map((item) => ({
    name: item.categoryName,
    value: item.count,
    color: item.color,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.analytics.title}</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t.dashboard.totalRequests}</p>
            <p className="text-3xl font-bold">{analytics.totalRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t.dashboard.pendingReview}</p>
            <p className="text-3xl font-bold">{analytics.pendingRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t.analytics.avgProcessingTime}</p>
            <p className="text-3xl font-bold">
              {(analytics.avgProcessingTime ?? 0).toFixed(1)} {t.analytics.days}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.requestsByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.requestsByPriority}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.requestsByCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.requestsOverTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
