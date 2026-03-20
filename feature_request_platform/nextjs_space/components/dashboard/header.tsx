"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const roleColors: Record<string, string> = {
    USER: "bg-orange-100 text-orange-800",
    SUPPORT: "bg-amber-100 text-amber-800",
    ADMIN: "bg-orange-200 text-orange-900",
    VIEWER: "bg-gray-100 text-gray-800",
  };

  const toggleLanguage = () => {
    setLanguage(language === "nl" ? "en" : "nl");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/logo.jpg" alt="Klantenvertellen logo" fill className="object-contain" />
          </div>
          <span className="font-semibold text-lg hidden sm:block text-gray-800">{t.appName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
            title={language === "nl" ? "Switch to English" : "Schakel naar Nederlands"}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === "nl" ? "🇬🇧 UK" : "🇳🇱 NL"}</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <Badge className={`text-xs ${roleColors[user?.role ?? ""] || ""}`}>
                {t.roles[user?.role as keyof typeof t.roles] || user?.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
