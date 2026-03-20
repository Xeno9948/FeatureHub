"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

export default function SettingsPage() {
  const { language } = useLanguage();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [globalEmails, setGlobalEmails] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [res, sysRes, sessionRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/settings/system").catch(() => null),
          fetch("/api/auth/session")
        ]);
        
        if (res.ok) {
          const data = await res.json();
          setEmailNotifications(data.emailNotifications);
        }
        
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          const adminCheck = session?.user?.role === "ADMIN";
          setIsAdmin(adminCheck);
          
          if (adminCheck && sysRes && sysRes.ok) {
            const sysData = await sysRes.json();
            setGlobalEmails(sysData.notificationEmails || "");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setEmailNotifications(checked);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: checked })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(language === "nl" ? "Instellingen opgeslagen" : "Settings saved");
    } catch (error) {
      toast.error(language === "nl" ? "Fout bij opslaan" : "Error saving settings");
      setEmailNotifications(!checked); // revert
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalSubmit = async () => {
    setGlobalSaving(true);
    try {
      const res = await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEmails: globalEmails })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(language === "nl" ? "Systeeminstellingen opgeslagen" : "System settings saved");
    } catch (error) {
      toast.error(language === "nl" ? "Fout bij opslaan" : "Error saving settings");
    } finally {
      setGlobalSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{language === "nl" ? "Instellingen" : "Settings"}</h1>
        <p className="text-muted-foreground">
          {language === "nl" ? "Beheer uw accountvoorkeuren." : "Manage your account preferences."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            {language === "nl" ? "Notificaties" : "Notifications"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                {language === "nl" ? "E-mail Notificaties" : "Email Notifications"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === "nl" 
                  ? "Ontvang e-mails over belangrijke updates voor uw account."
                  : "Receive emails about important updates for your account."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={emailNotifications}
                onCheckedChange={handleToggle}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              {language === "nl" ? "Systeem Instellingen (Admin)" : "System Settings (Admin)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base text-gray-900 border-b pb-2">
                {language === "nl" ? "Verstuur 'Nieuw Verzoek' E-mails Naar:" : "Send 'New Request' Emails To:"}
              </Label>
              <p className="text-sm text-muted-foreground pb-2">
                {language === "nl" 
                  ? "Voer een door komma's gescheiden lijst van e-mailadressen in om te wijzigen wie automatische alerts ontvangt wanneer nieuwe webtickets worden ingediend."
                  : "Enter a comma-separated list of targeted email addresses to configure exactly who receives automated email alerts when new web tickets are submitted."}
              </p>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={globalEmails}
                  onChange={(e) => setGlobalEmails(e.target.value)}
                  placeholder="admin1@domain.com, admin2@domain.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-w-xl"
                />
                <Button onClick={handleGlobalSubmit} disabled={globalSaving} variant="default" className="w-[120px]">
                  {globalSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === "nl" ? "Opslaan" : "Save")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
