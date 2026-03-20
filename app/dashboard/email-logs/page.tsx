"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { Loader2, Mail, CheckCircle, XCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: string;
  error: string | null;
  createdAt: string;
}

export default function EmailLogsPage() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/email-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/settings/test-email", { method: "POST" });
      if (!res.ok) throw new Error("Test failed");
      toast.success(language === "nl" ? "Test e-mail verzonden!" : "Test email sent!");
      
      const logsRes = await fetch("/api/email-logs");
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (e) {
      toast.error(language === "nl" ? "Fout bij verzenden test" : "Error sending test email");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{language === "nl" ? "E-mail Logboeken" : "Email Logs"}</h1>
          <p className="text-muted-foreground">
            {language === "nl" ? "Bekijk alle verzonden e-mails vanuit het systeem." : "View all dispatched emails from the system."}
          </p>
        </div>
        <Button onClick={handleTestEmail} disabled={testing} variant="outline" className="gap-2">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {language === "nl" ? "Test E-mail" : "Test Email"}
        </Button>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === "nl" ? "Geen e-mails gevonden." : "No emails found."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  {log.status === "SENT" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{log.recipientEmail}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(log.createdAt).toLocaleString(language === "nl" ? "nl-NL" : "en-GB")}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-gray-800">{log.subject}</h4>
                  {log.error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded"> Error: {log.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
