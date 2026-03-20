"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  Clock,
  FileText,
  ChevronRight,
  Send,
  Loader2,
  User,
  CheckCircle,
  RotateCcw,
  Paperclip,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  requestedBy: string | null;
  user: { name: string | null; email: string };
  category: { name: string; color: string } | null;
  attachments: any[];
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function SupportReviewList() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [priority, setPriority] = useState("");
  const [supportNotes, setSupportNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?status=SUBMITTED");
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

  const handleSubmitReview = async (action: "support_review" | "return_to_submitter") => {
    if (!selectedRequest) return;
    if (action === "support_review" && !priority) {
      toast.error(t.review.selectPriority);
      return;
    }
    if (action === "return_to_submitter" && !supportNotes.trim()) {
      toast.error(language === "nl" ? "Korte uitleg vereist in Notities-veld" : "Brief explanation required in Notes field");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action,
          priority: action === "support_review" ? priority : undefined,
          supportNotes: supportNotes || null,
        }),
      });

      if (!res.ok) throw new Error("Error updating request");

      toast.success(action === "support_review" 
        ? (language === "nl" ? "Verzoek doorgestuurd naar admin" : "Request forwarded to admin") 
        : (language === "nl" ? "Teruggestuurd naar indiener" : "Returned to submitter"));
        
      setSelectedRequest(null);
      setPriority("");
      setSupportNotes("");
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
        <h2 className="text-lg font-semibold">{t.review.openRequests} ({requests.length})</h2>
        {requests.map((request) => (
          <Card
            key={request.id}
            className={`cursor-pointer transition-all ${
              selectedRequest?.id === request.id
                ? "ring-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedRequest(request)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-orange-100 text-orange-800">{t.review.new}</Badge>
                    <h3 className="font-semibold truncate">{request.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {request.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {request.user?.name || request.user?.email || (language === "nl" ? "Onbekend" : "Unknown")}
                    </span>
                    {request.requestedBy && (
                      <span>• {t.common.requestedBy}: {request.requestedBy}</span>
                    )}
                    <span>• {new Date(request.createdAt).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Panel */}
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

              {selectedRequest.category && (
                <div>
                  <Label className="text-muted-foreground">{t.form.category}</Label>
                  <Badge
                    style={{ backgroundColor: selectedRequest.category.color }}
                    className="text-white mt-1"
                  >
                    {selectedRequest.category.name}
                  </Badge>
                </div>
              )}

              {selectedRequest.attachments?.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    {language === "nl" ? "Bijlagen" : "Attachments"} ({selectedRequest.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.attachments.map((att: any) => (
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

              <div className="border-t pt-4">
                <Label htmlFor="priority">{language === "nl" ? "Prioriteit Toekennen" : "Assign Priority"} *</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                >
                  <option value="">{t.review.selectPriority}</option>
                  {Object.keys(priorityColors).map((p) => (
                    <option key={p} value={p}>
                      {t.priority?.[p as keyof typeof t.priority] || p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="supportNotes">{t.review.supportNotes}</Label>
                <Textarea
                  id="supportNotes"
                  value={supportNotes}
                  onChange={(e) => setSupportNotes(e.target.value)}
                  placeholder={language === "nl" ? "Voeg notities toe voor de admin..." : "Add notes for the admin..."}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => handleSubmitReview("support_review")}
                  disabled={submitting || !priority}
                  className="w-full"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {t.review.submitToAdmin}
                </Button>
                <Button
                  onClick={() => handleSubmitReview("return_to_submitter")}
                  disabled={submitting || !supportNotes.trim()}
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full"
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
