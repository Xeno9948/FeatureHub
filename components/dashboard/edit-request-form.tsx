"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import {
  Sparkles,
  Loader2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Download,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ExistingAttachment {
  id: string;
  fileName: string;
  cloudStoragePath: string;
  isPublic: boolean;
  contentType: string;
  size: number;
}

interface NewAttachment {
  fileName: string;
  cloudStoragePath: string;
  isPublic: boolean;
  contentType: string;
  size: number;
}

interface RequestData {
  id: string;
  title: string;
  description: string;
  businessJustification: string | null;
  reason: string | null;
  requestedBy: string | null;
  status: string;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
  attachments: ExistingAttachment[];
  supportNotes: string | null;
  adminNotes: string | null;
}

export function EditRequestForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RequestData | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [businessJustification, setBusinessJustification] = useState("");
  const [reason, setReason] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Attachment state
  const [keepAttachments, setKeepAttachments] = useState<ExistingAttachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchRequest(), fetchCategories()]).finally(() =>
      setLoading(false)
    );
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      if (!res.ok) return;
      const data: RequestData = await res.json();
      setRequest(data);
      setTitle(data.title);
      setDescription(data.description);
      setBusinessJustification(data.businessJustification ?? "");
      setReason(data.reason ?? "");
      setCategoryId(data.categoryId ?? "");
      setRequestedBy(data.requestedBy ?? "");
      setKeepAttachments(data.attachments);
    } catch (error) {
      console.error("Error fetching request:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ── AI assist ──────────────────────────────────────────────────────────────

  const handleAiAssist = async (field: string) => {
    setAiLoading(field);
    setCurrentField(field);
    setAiSuggestion("");
    setShowAiSuggestion(true);

    const fieldValues: Record<string, string> = {
      title,
      description,
      businessJustification,
      reason,
    };

    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue: fieldValues[field],
          context: `${t.form.title}: ${title}\n${t.form.description}: ${description}`,
        }),
      });

      if (!res.ok) throw new Error("AI assistance failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let suggestion = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  suggestion += parsed.content;
                  setAiSuggestion(suggestion);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      toast.error(
        language === "nl"
          ? "Fout bij ophalen AI-suggestie"
          : "Error getting AI suggestion"
      );
      setShowAiSuggestion(false);
    } finally {
      setAiLoading(null);
    }
  };

  const applyAiSuggestion = () => {
    if (!currentField || !aiSuggestion) return;
    switch (currentField) {
      case "title":
        setTitle(
          aiSuggestion
            .split("\n")[0]
            .replace(/^\d+\.\s*|"|"/g, "")
            .trim()
        );
        break;
      case "description":
        setDescription(aiSuggestion);
        break;
      case "businessJustification":
        setBusinessJustification(aiSuggestion);
        break;
      case "reason":
        setReason(aiSuggestion);
        break;
    }
    setShowAiSuggestion(false);
    setAiSuggestion("");
    setCurrentField(null);
    toast.success(t.ai.applied);
  };

  // ── Attachment handling ────────────────────────────────────────────────────

  const removeExistingAttachment = (id: string) => {
    setKeepAttachments((prev) => prev.filter((a) => a.id !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const presignRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: false,
          }),
        });
        if (!presignRes.ok) throw new Error("Error getting upload URL");
        const { uploadUrl, cloudStoragePath } = await presignRes.json();

        const url = new URL(uploadUrl);
        const signedHeaders = url.searchParams.get("X-Amz-SignedHeaders") || "";
        const headers: Record<string, string> = { "Content-Type": file.type };
        if (signedHeaders.includes("content-disposition")) {
          headers["Content-Disposition"] = "attachment";
        }

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        setNewAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            cloudStoragePath,
            isPublic: false,
            contentType: file.type,
            size: file.size,
          },
        ]);
      }
      toast.success(t.upload.uploadSuccess);
    } catch (error) {
      toast.error(t.upload.uploadError);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleDownloadExisting = async (att: ExistingAttachment) => {
    try {
      const res = await fetch(
        `/api/upload/url?path=${encodeURIComponent(att.cloudStoragePath)}&isPublic=${att.isPublic}`
      );
      if (res.ok) {
        const { url } = await res.json();
        const a = document.createElement("a");
        a.href = url;
        a.download = att.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error(t.messages.titleDescriptionRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          businessJustification: businessJustification || null,
          reason: reason || null,
          categoryId: categoryId || null,
          requestedBy: requestedBy || null,
          newAttachments,
          removedAttachmentIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error updating request");
      }

      toast.success((t.messages as any).updateSuccess);
      router.push(`/dashboard/request/${requestId}`);
    } catch (error: any) {
      toast.error((t.messages as any).updateError);
    } finally {
      setSubmitting(false);
    }
  };

  // ── AI suggestion render helper ────────────────────────────────────────────

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "title": return t.form.title;
      case "description": return t.form.description;
      case "businessJustification": return t.form.businessJustification;
      case "reason": return t.form.reason;
      default: return field;
    }
  };

  const renderAiSuggestion = (field: string) => {
    if (!showAiSuggestion || currentField !== field) return null;
    return (
      <Card className="border-purple-200 bg-purple-50 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {t.ai.suggestionFor} {getFieldLabel(currentField || "")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto w-full">
            {aiSuggestion || (
              <span className="text-muted-foreground animate-pulse">
                {t.ai.generating}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              onClick={applyAiSuggestion}
              disabled={!aiSuggestion || aiLoading !== null}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {t.ai.applySuggestion}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAiSuggestion(false);
                setAiSuggestion("");
                setCurrentField(null);
              }}
            >
              {t.ai.close}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── Loading / guard ────────────────────────────────────────────────────────

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

  const isReturned = request.status === "RETURNED";
  const returnedNote = isReturned
    ? request.supportNotes || request.adminNotes
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Pencil className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">
            {(t.common as any).editRequest}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{request.title}</p>
        </div>
      </div>

      {/* Returned banner */}
      {isReturned && (
        <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-orange-800">
              {(t.common as any).returnedNote}
            </p>
            {returnedNote && (
              <p className="text-sm text-orange-700 whitespace-pre-wrap">
                {returnedNote}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              {language === "nl" ? "Verzoek Details" : "Request Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">{t.form.title} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAiAssist("title")}
                  disabled={aiLoading !== null}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {aiLoading === "title" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {t.ai.suggestion}
                </Button>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.form.titlePlaceholder}
                required
              />
              {renderAiSuggestion("title")}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">{t.form.description} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAiAssist("description")}
                  disabled={aiLoading !== null}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {aiLoading === "description" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {t.ai.improve}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.form.descriptionPlaceholder}
                rows={5}
                required
              />
              {renderAiSuggestion("description")}
            </div>

            {/* Business Justification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="businessJustification">
                  {t.form.businessJustification}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAiAssist("businessJustification")}
                  disabled={aiLoading !== null}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {aiLoading === "businessJustification" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {t.ai.improve}
                </Button>
              </div>
              <Textarea
                id="businessJustification"
                value={businessJustification}
                onChange={(e) => setBusinessJustification(e.target.value)}
                placeholder={t.form.businessJustificationPlaceholder}
                rows={4}
              />
              {renderAiSuggestion("businessJustification")}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reason">{t.form.reason}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAiAssist("reason")}
                  disabled={aiLoading !== null}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {aiLoading === "reason" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {t.ai.improve}
                </Button>
              </div>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t.form.reasonPlaceholder}
                rows={3}
              />
              {renderAiSuggestion("reason")}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{t.form.category}</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">{t.form.selectCategory}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested By */}
            <div className="space-y-2">
              <Label htmlFor="requestedBy">{t.form.requestedByField}</Label>
              <Input
                id="requestedBy"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder={t.form.requestedByPlaceholder}
              />
              <p className="text-sm text-muted-foreground">
                {t.form.requestedByHelp}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>{t.upload.attachments}</Label>

              {/* Existing attachments */}
              {keepAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {language === "nl"
                      ? "Bestaande bijlagen"
                      : "Existing attachments"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keepAttachments.map((att) => (
                      <Badge
                        key={att.id}
                        variant="secondary"
                        className="flex items-center gap-2 pr-1"
                      >
                        {att.contentType.startsWith("image/") ? (
                          <ImageIcon className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadExisting(att)}
                          className="hover:underline text-left"
                        >
                          {att.fileName}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(att.id)}
                          className="hover:text-red-500 ml-1"
                          title={language === "nl" ? "Verwijderen" : "Remove"}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload zone for new attachments */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-edit"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <label
                  htmlFor="file-upload-edit"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-orange-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {t.upload.clickToUpload}
                  </span>
                </label>
              </div>

              {/* New attachments preview */}
              {newAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newAttachments.map((att, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="flex items-center gap-2 border-orange-300 bg-orange-50 text-orange-800"
                    >
                      {att.contentType.startsWith("image/") ? (
                        <ImageIcon className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {att.fileName}
                      <button
                        type="button"
                        onClick={() => removeNewAttachment(i)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/request/${requestId}`)}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t.common.loading}
              </>
            ) : (
              t.common.save
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
