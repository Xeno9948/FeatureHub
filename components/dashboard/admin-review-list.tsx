"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  User,
  RotateCcw,
  Paperclip,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface Request {
  id: string;
  title: string;
  description: string;
  businessJustification: string | null;
  reason: string | null;
  status: string;
  priority: string | null;
  supportNotes: string | null;
  createdAt: string;
  requestedBy: string | null;
  createdBy: { name: string | null; email: string };
  category: { name: string; color: string } | null;
  attachments: any[];
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function AdminReviewList() {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [finalPriority, setFinalPriority] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?status=SUBMITTED,UNDER_REVIEW,FINAL_REVIEW,RETURNED");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      const res = await fetch("/api/upload/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudStoragePath: attachment.cloudStoragePath,
          isPublic: attachment.isPublic || false,
        }),
      });

      if (!res.ok) throw new Error("Failed to get download URL");
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (error) {
      toast.error(language === "nl" ? "Fout bij openen bestand" : "Error opening file");
    }
  };

  const handleDecision = async (decision: "ACCEPTED" | "DECLINED" | "RETURNED" | "SUBMITTED") => {
    if (!selectedRequest) return;
    if (decision === "DECLINED" && !declineReason.trim()) {
      toast.error(language === "nl" ? "Geef een reden voor afwijzing" : "Please provide a reason for declining");
      return;
    }

    setSubmitting(true);

    try {
      const actionMap = {
        ACCEPTED: "accept",
        DECLINED: "decline",
        RETURNED: "return_to_support",
        SUBMITTED: "return_to_submitter"
      };

      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[decision],
          finalPriority: finalPriority || null,
          adminNotes: adminNotes || null,
          declineReason: decision === "DECLINED" ? declineReason : null,
        }),
      });

      if (!res.ok) throw new Error("Error updating request");

      const messages: Record<string, string> = {
        ACCEPTED: t.review.accepted,
        DECLINED: t.review.declined,
        RETURNED: t.review.returnedToSupport,
        SUBMITTED: language === "nl" ? "Teruggestuurd naar indiener" : "Returned to Submitter",
      };
      toast.success(messages[decision]);
      setSelectedRequest(null);
      setAdminNotes("");
      setDeclineReason("");
      fetchRequests();
    } catch (error) {
      toast.error(language === "nl" ? "Fout bij bijwerken verzoek" : "Error updating request");
    } finally {
      setSubmitting(false);
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
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.review.noRequestsPending}</h3>
          <p className="text-muted-foreground">{t.review.allProcessed}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Request List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t.review.waitingForDecision} ({requests.length})</h2>
        {requests.map((request) => (
          <Card
            key={request.id}
            className={`cursor-pointer transition-all ${
              selectedRequest?.id === request.id
                ? "ring-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
            onClick={() => {
              setSelectedRequest(request);
              setAdminNotes("");
              setDeclineReason("");
              setFinalPriority(request.priority || "");
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {request.priority && (
                      <Badge className={priorityColors[request.priority] || "bg-gray-100 text-gray-800"}>
                        {t.priority?.[request.priority as keyof typeof t.priority] || request.priority}
                      </Badge>
                    )}
                    <h3 className="font-semibold truncate">{request.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {request.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {request.createdBy?.name || request.createdBy?.email || (language === "nl" ? "Onbekend" : "Unknown")}
                    </span>
                    {request.requestedBy && (
                      <span>• {t.common.requestedBy}: {request.requestedBy}</span>
                    )}
                  </div>
                </div>
                {(selectedRequest?.attachments?.length || 0) > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      {language === "nl" ? "Bijlagen" : "Attachments"} ({selectedRequest?.attachments?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest?.attachments?.map((att: any) => (
                        <Button
                          key={att.id}
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => handleDownload(att)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          <span className="max-w-[200px] truncate">{att.fileName}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision Panel */}
      <div>
        {selectedRequest ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{selectedRequest.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t.form.description}</Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
              </div>

              {selectedRequest.businessJustification && (
                <div>
                  <Label className="text-muted-foreground">{t.form.businessJustification}</Label>
                  <p className="text-sm mt-1">{selectedRequest.businessJustification}</p>
                </div>
              )}

              {selectedRequest.supportNotes && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <Label className="text-amber-800">{t.review.supportNotes}</Label>
                  <p className="text-sm mt-1 text-amber-900">{selectedRequest.supportNotes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label htmlFor="finalPriority">{language === "nl" ? "Definitieve Prioriteit" : "Final Priority"}</Label>
                <select
                  id="finalPriority"
                  value={finalPriority}
                  onChange={(e) => setFinalPriority(e.target.value)}
                  className="w-full h-10 px-3 mt-2 mb-4 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">{language === "nl" ? "Selecteer prioriteit..." : "Select priority..."}</option>
                  <option value="LOW">{t.priority?.LOW || "Low"}</option>
                  <option value="MEDIUM">{t.priority?.MEDIUM || "Medium"}</option>
                  <option value="HIGH">{t.priority?.HIGH || "High"}</option>
                  <option value="CRITICAL">{t.priority?.CRITICAL || "Critical"}</option>
                </select>

                <Label htmlFor="adminNotes">{t.review.adminNotes}</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={language === "nl" ? "Optionele notities..." : "Optional notes..."}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="declineReason">{t.review.declineReason}</Label>
                <Textarea
                  id="declineReason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder={language === "nl" ? "Vereist bij afwijzing..." : "Required when declining..."}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleDecision("ACCEPTED")}
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {t.review.accept}
                </Button>
                <Button
                  onClick={() => handleDecision("DECLINED")}
                  disabled={submitting}
                  variant="destructive"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {t.review.decline}
                </Button>
                <Button
                  onClick={() => handleDecision("RETURNED")}
                  disabled={submitting}
                  variant="outline"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  {t.review.returnToSupport}
                </Button>
                <Button
                  onClick={() => handleDecision("SUBMITTED")}
                  disabled={submitting || !adminNotes.trim()}
                  variant="outline"
                  className="mt-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  title={language === "nl" ? "Verwacht Notities" : "Requires Note"}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  {language === "nl" ? "Terug naar Indiener" : "Return to User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === "nl" ? "Selecteer een verzoek om te beoordelen" : "Select a request to review"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
