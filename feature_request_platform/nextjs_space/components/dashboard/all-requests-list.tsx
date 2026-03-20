"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  User,
} from "lucide-react";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  createdAt: string;
  requestedBy: string | null;
  user: { name: string | null; email: string };
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

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function AllRequestsList() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
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

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.description.toLowerCase().includes(search.toLowerCase()) ||
      (req.requestedBy && req.requestedBy.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || req.status === statusFilter;
    const matchesPriority = !priorityFilter || req.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.common.search + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">{t.common.allStatuses}</option>
          {Object.keys(statusColors).map((status) => (
            <option key={status} value={status}>
              {t.status?.[status as keyof typeof t.status] || status}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">{t.common.allPriorities}</option>
          {Object.keys(priorityColors).map((priority) => (
            <option key={priority} value={priority}>
              {t.priority?.[priority as keyof typeof t.priority] || priority}
            </option>
          ))}
        </select>
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {t.common.noResults}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
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
                        {request.priority && (
                          <Badge className={priorityColors[request.priority] || "bg-gray-100 text-gray-800"}>
                            {t.priority?.[request.priority as keyof typeof t.priority] || request.priority}
                          </Badge>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.user?.name || request.user?.email || (language === "nl" ? "Onbekend" : "Unknown")}
                        </span>
                        {request.requestedBy && (
                          <span className="text-muted-foreground">
                            {t.common.requestedBy}: {request.requestedBy}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}
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
      )}
    </div>
  );
}
