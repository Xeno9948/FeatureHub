"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  User,
  Calendar,
  Tag,
  Paperclip,
  Pencil,
  History,
} from "lucide-react";

interface Attachment {
  id: string;
  fileName: string;
  cloudStoragePath: string;
  isPublic: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    role: string;
  };
}

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  finalPriority: string | null;
  businessJustification: string | null;
  reason: string | null;
  supportNotes: string | null;
  adminNotes: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: string | null;
  createdBy: { id: string; name: string | null; email: string };
  category: { id: string; name: string; color: string } | null;
  attachments: Attachment[];
  notes: any[];
  activities: ActivityLog[];
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

export function RequestDetail({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const res = await fetch(`/api/upload/url?path=${encodeURIComponent(attachment.cloudStoragePath)}&isPublic=${attachment.isPublic}`);
      if (res.ok) {
        const { url } = await res.json();
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">{t.common.noResults}</p>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = statusIcons[request.status] || FileText;
  const canEdit =
    currentUserId &&
    request.createdBy &&
    (request.createdBy as any).id === currentUserId &&
    (request.status === "SUBMITTED" || request.status === "RETURNED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge className={statusColors[request.status] || "bg-gray-100 text-gray-800"}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {t.status?.[request.status as keyof typeof t.status] || request.status}
            </Badge>
            {request.priority && (
              <Badge className={priorityColors[request.priority] || "bg-gray-100 text-gray-800"}>
                {t.priority?.[request.priority as keyof typeof t.priority] || request.priority}
              </Badge>
            )}
            {request.category && (
              <Badge style={{ backgroundColor: request.category.color }} className="text-white">
                {request.category.name}
              </Badge>
            )}
          </div>
        </div>
        {canEdit && (
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/request/${requestId}/edit`)}
            className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Pencil className="w-4 h-4" />
            {(t.common as any).editRequest}
          </Button>
        )}
      </div>

      {/* Request Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t.form.description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="whitespace-pre-wrap">{request.description}</p>

            {request.businessJustification && (
              <div>
                <h4 className="font-semibold mb-2">{t.form.businessJustification}</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {request.businessJustification}
                </p>
              </div>
            )}

            {request.reason && (
              <div>
                <h4 className="font-semibold mb-2">{t.form.reason}</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
              </div>
            )}

            {request.supportNotes && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-amber-800">{t.review.supportNotes}</h4>
                <p className="text-amber-900 whitespace-pre-wrap">{request.supportNotes}</p>
              </div>
            )}

            {request.adminNotes && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-purple-800">{t.review.adminNotes}</h4>
                <p className="text-purple-900 whitespace-pre-wrap">{request.adminNotes}</p>
              </div>
            )}

            {request.declineReason && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-red-800">{t.review.declineReason}</h4>
                <p className="text-red-900 whitespace-pre-wrap">{request.declineReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{language === "nl" ? "Details" : "Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.common.submittedBy}:</span>
                <span>{request.createdBy?.name || request.createdBy?.email || (language === "nl" ? "Onbekend" : "Unknown")}</span>
              </div>
              
              {request.requestedBy && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.common.requestedBy}:</span>
                  <span className="font-medium">{request.requestedBy}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.common.submittedOn}:</span>
                <span>{new Date(request.createdAt).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}</span>
              </div>

              {request.category && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.form.category}:</span>
                  <Badge style={{ backgroundColor: request.category.color }} className="text-white text-xs">
                    {request.category.name}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {request.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  {t.common.attachments} ({request.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.attachments.map((att) => (
                    <Button
                      key={att.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleDownload(att)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span className="truncate">{att.fileName}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg">{(t.common as any).history}</CardTitle>
        </CardHeader>
        <CardContent>
          {request.activities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">{(t.common as any).noActivity}</p>
          ) : (
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {request.activities.map((activity) => {
                let details = null;
                try {
                  details = activity.details ? JSON.parse(activity.details) : null;
                } catch (e) {
                  details = null;
                }

                return (
                  <div key={activity.id} className="relative flex items-center justify-between gap-6 pl-12 group">
                    <div className="absolute left-0 grid place-items-center w-10 h-10 bg-white border-2 border-orange-500 rounded-full shadow-sm z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{activity.user.name || "System"}</span>
                        <Badge variant="outline" className="text-[10px] px-1 h-4 uppercase font-bold text-muted-foreground">
                          {activity.user.role}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(activity.createdAt).toLocaleString(language === "nl" ? "nl-NL" : "en-GB")}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium text-orange-600">
                          {activity.action === "UPDATED" ? (language === "nl" ? "Bewerkt" : "Updated") : 
                           activity.action.startsWith("ACTION_") ? activity.action.replace("ACTION_", "").replace(/_/g, " ") : 
                           activity.action}
                        </span>
                      </p>
                      {details && Object.keys(details).length > 0 && (
                        <div className="mt-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(details).map(([field, vals]: [string, any]) => (
                            <div key={field} className="bg-slate-50 p-2 rounded border border-slate-100 italic">
                              <span className="font-bold text-slate-500">{field}:</span>{" "}
                              <span className="text-red-400 line-through opacity-70">{String(vals.from)}</span>{" "}
                              &rarr; <span className="text-green-600 font-medium">{String(vals.to)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
