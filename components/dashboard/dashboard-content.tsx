"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  TrendingUp,
} from "lucide-react";

interface DashboardContentProps {
  role?: string;
  userId?: string;
}

interface Analytics {
  totalRequests: number;
  pendingRequests: number;
  statusCounts: { status: string; count: number }[];
  priorityCounts: { priority: string; count: number }[];
  categoryCounts: { categoryName: string; color: string; count: number }[];
}

const statusIcons: Record<string, any> = {
  SUBMITTED: FileText,
  UNDER_REVIEW: Clock,
  FINAL_REVIEW: AlertCircle,
  ACCEPTED: CheckCircle,
  DECLINED: XCircle,
  RETURNED: AlertCircle,
};

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  FINAL_REVIEW: "bg-purple-100 text-purple-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
};

export function DashboardContent({ role, userId }: DashboardContentProps) {
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

  const getWelcomeMessage = () => {
    switch (role) {
      case "ADMIN":
        return language === "nl" 
          ? "Beoordeel en neem definitieve beslissingen over functieverzoeken."
          : "Review and make final decisions on feature requests.";
      case "SUPPORT":
        return language === "nl"
          ? "Beoordeel ingediende verzoeken en bereid ze voor op admin-goedkeuring."
          : "Review submitted requests and prepare them for admin approval.";
      case "VIEWER":
        return language === "nl"
          ? "Bekijk alle functieverzoeken en hun voortgang."
          : "View all feature requests and their progress.";
      default:
        return language === "nl"
          ? "Dien functieverzoeken in en volg ze voor het KV-platform."
          : "Submit feature requests and track them for the platform.";
    }
  };

  const getQuickActions = () => {
    switch (role) {
      case "ADMIN":
        return [
          { href: "/dashboard/admin-review", label: language === "nl" ? "Verzoeken Beoordelen" : "Review Requests", icon: AlertCircle },
          { href: "/dashboard/all-requests", label: t.sidebar.allRequests, icon: FileText },
          { href: "/dashboard/categories", label: language === "nl" ? "Categorieën Beheren" : "Manage Categories", icon: Lightbulb },
        ];
      case "SUPPORT":
        return [
          { href: "/dashboard/review", label: t.sidebar.reviewQueue, icon: Clock },
          { href: "/dashboard/all-requests", label: t.sidebar.allRequests, icon: FileText },
          { href: "/dashboard/analytics", label: language === "nl" ? "Analyse Bekijken" : "View Analytics", icon: TrendingUp },
        ];
      case "VIEWER":
        return [
          { href: "/dashboard/all-requests", label: t.sidebar.allRequests, icon: FileText },
          { href: "/dashboard/analytics", label: language === "nl" ? "Analyse Bekijken" : "View Analytics", icon: TrendingUp },
        ];
      default:
        return [
          { href: "/dashboard/new-request", label: t.sidebar.newRequest, icon: Lightbulb },
          { href: "/dashboard/my-requests", label: t.sidebar.myRequests, icon: FileText },
          { href: "/dashboard/analytics", label: language === "nl" ? "Analyse Bekijken" : "View Analytics", icon: TrendingUp },
        ];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {language === "nl" ? "Welkom bij FeatureHub" : "Welcome to FeatureHub"}
        </h1>
        <p className="text-orange-100">{getWelcomeMessage()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.dashboard.totalRequests}</p>
                <p className="text-3xl font-bold">{analytics?.totalRequests ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.dashboard.pendingReview}</p>
                <p className="text-3xl font-bold">{analytics?.pendingRequests ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.dashboard.acceptedRequests}</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {analytics?.statusCounts?.find((s) => s.status === "ACCEPTED")?.count ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.dashboard.declinedRequests}</p>
                <p className="text-3xl font-bold text-red-600">
                  {analytics?.statusCounts?.find((s) => s.status === "DECLINED")?.count ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            {language === "nl" ? "Snelle Acties" : "Quick Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
                  >
                    <Icon className="w-8 h-8 text-orange-500" />
                    <span>{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t.analytics.requestsByStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {analytics?.statusCounts?.map((item) => {
              const Icon = statusIcons[item.status] || FileText;
              const color = statusColors[item.status] || "bg-gray-100 text-gray-800";
              const label = t.status?.[item.status as keyof typeof t.status] || item.status;
              return (
                <div
                  key={item.status}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {item.count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
