"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

export default function SettingsPage() {
  const { language } = useLanguage();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setEmailNotifications(data.emailNotifications);
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
    </div>
  );
}
