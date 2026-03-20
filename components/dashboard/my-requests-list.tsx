"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  createdAt: string;
  requestedBy: string | null;
  category: { name: string; color: string } | null;
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

export function MyRequestsList() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?mine=true");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.dashboard.noRequestsYet}</h3>
          <p className="text-muted-foreground mb-4">
            {language === "nl" 
              ? "Begin met het indienen van uw eerste functieverzoek"
              : "Start by submitting your first feature request"}
          </p>
          <Link href="/dashboard/new-request">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t.sidebar.newRequest}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const StatusIcon = statusIcons[request.status] || FileText;
        return (
          <Card
            key={request.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/dashboard/request/${request.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{request.title}</h3>
                    {request.category && (
                      <Badge
                        style={{ backgroundColor: request.category.color }}
                        className="text-white text-xs"
                      >
                        {request.category.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {request.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge className={statusColors[request.status] || "bg-gray-100 text-gray-800"}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {t.status?.[request.status as keyof typeof t.status] || request.status}
                    </Badge>
                    {request.requestedBy && (
                      <span className="text-muted-foreground">
                        {t.common.requestedBy}: {request.requestedBy}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {t.common.submittedOn} {new Date(request.createdAt).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
