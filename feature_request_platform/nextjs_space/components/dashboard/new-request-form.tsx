"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import {
  Sparkles,
  Loader2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Attachment {
  fileName: string;
  cloudStoragePath: string;
  isPublic: boolean;
  contentType: string;
  size: number;
}

export function NewRequestForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [businessJustification, setBusinessJustification] = useState("");
  const [reason, setReason] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
          const lines = chunk.split("\n");

          for (const line of lines) {
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
      toast.error(language === "nl" ? "Fout bij ophalen AI-suggestie" : "Error getting AI suggestion");
      setShowAiSuggestion(false);
    } finally {
      setAiLoading(null);
    }
  };

  const applyAiSuggestion = () => {
    if (!currentField || !aiSuggestion) return;

    switch (currentField) {
      case "title":
        setTitle(aiSuggestion.split("\n")[0].replace(/^\d+\.\s*|"|"/g, "").trim());
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
        const headers: Record<string, string> = {
          "Content-Type": file.type,
        };
        if (signedHeaders.includes("content-disposition")) {
          headers["Content-Disposition"] = "attachment";
        }

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        setAttachments((prev) => [
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
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error(t.messages.titleDescriptionRequired);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          businessJustification: businessJustification || null,
          reason: reason || null,
          categoryId: categoryId || null,
          requestedBy: requestedBy || null,
          attachments,
        }),
      });

      if (!res.ok) throw new Error("Error submitting request");

      toast.success(t.messages.submitSuccess);
      router.push("/dashboard/my-requests");
    } catch (error) {
      toast.error(t.messages.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "title": return t.form.title;
      case "description": return t.form.description;
      case "businessJustification": return t.form.businessJustification;
      case "reason": return t.form.reason;
      default: return field;
    }
  };

  return (
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
          </div>

          {/* Business Justification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="businessJustification">{t.form.businessJustification}</Label>
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
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <label
                htmlFor="file-upload"
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
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((att, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-2">
                    {att.contentType.startsWith("image/") ? (
                      <ImageIcon className="w-3 h-3" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {att.fileName}
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
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

      {/* AI Suggestion Panel */}
      {showAiSuggestion && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              {t.ai.suggestionFor} {getFieldLabel(currentField || "")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
              {aiSuggestion || (
                <span className="text-muted-foreground animate-pulse">{t.ai.generating}</span>
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
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
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
            language === "nl" ? "Verzoek Indienen" : "Submit Request"
          )}
        </Button>
      </div>
    </form>
  );
}
