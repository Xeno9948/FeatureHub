"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Globe, Menu } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { SidebarLinks } from "./sidebar";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isSimulatingUser, setIsSimulatingUser] = useState(false);
  const router = useRouter();

  // Check if we are simulating the USER role on mount
  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("simulateUserRole="))
      ?.split("=")[1];
    setIsSimulatingUser(cookieValue === "true");
  }, []);

  const roleColors: Record<string, string> = {
    USER: "bg-orange-100 text-orange-800",
    SUPPORT: "bg-amber-100 text-amber-800",
    ADMIN: "bg-orange-200 text-orange-900",
    VIEWER: "bg-gray-100 text-gray-800",
  };

  const toggleLanguage = () => {
    setLanguage(language === "nl" ? "en" : language === "en" ? "de" : "nl");
  };

  const toggleSimulateUserRole = () => {
    const newValue = !isSimulatingUser;
    
    // Set a document cookie to expire quickly or end of session
    document.cookie = `simulateUserRole=${newValue}; path=/; max-age=86400`;
    setIsSimulatingUser(newValue);
    
    // Force a full page reload so Next.js server components read the cookie
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                    <Image src="/logo.jpg" alt="Logo" fill className="object-contain" />
                  </div>
                  <span>FeatureHub</span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <SheetClose asChild>
                  <div>
                    <SidebarLinks role={(user?.role === "ADMIN" && isSimulatingUser) ? "USER" : user?.role} />
                  </div>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/logo.jpg" alt="Klantenvertellen logo" fill className="object-contain" />
          </div>
          <span className="font-semibold text-lg hidden xs:block sm:block text-gray-800">{t.appName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
            title={language === "nl" ? "Switch to English" : language === "en" ? "Wechseln zu Deutsch" : "Schakel naar Nederlands"}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{{ nl: "🇳🇱 NL", en: "🇬🇧 EN", de: "🇩🇪 DE" }[language as "nl"|"en"|"de"] || "🇳🇱 NL"}</span>
          </Button>

          <div className="flex items-center gap-2">
            
            {user?.role === "ADMIN" && (
              <Button
                variant={isSimulatingUser ? "default" : "outline"}
                size="sm"
                onClick={toggleSimulateUserRole}
                className="hidden sm:flex"
              >
                {isSimulatingUser ? "Exit User View" : "User View"}
              </Button>
            )}

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
