"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  ClipboardCheck,
  BarChart3,
  Settings,
  FolderKanban,
  Users,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  role?: string;
  onItemClick?: () => void;
}

export function SidebarLinks({ role, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const allLinks = [
    {
      href: "/dashboard",
      label: t.sidebar.dashboard,
      icon: LayoutDashboard,
      roles: ["USER", "SUPPORT", "ADMIN", "VIEWER"],
    },
    {
      href: "/dashboard/new-request",
      label: t.sidebar.newRequest,
      icon: PlusCircle,
      roles: ["USER", "SUPPORT"],
    },
    {
      href: "/dashboard/my-requests",
      label: t.sidebar.myRequests,
      icon: ListTodo,
      roles: ["USER", "SUPPORT"],
    },
    {
      href: "/dashboard/review",
      label: t.sidebar.reviewQueue,
      icon: ClipboardCheck,
      roles: ["SUPPORT"],
    },
    {
      href: "/dashboard/admin-review",
      label: t.sidebar.finalReview,
      icon: ClipboardCheck,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/all-requests",
      label: t.sidebar.allRequests,
      icon: FolderKanban,
      roles: ["SUPPORT", "ADMIN", "VIEWER"],
    },
    {
      href: "/dashboard/analytics",
      label: t.sidebar.analytics,
      icon: BarChart3,
      roles: ["USER", "SUPPORT", "ADMIN", "VIEWER"],
    },
    {
      href: "/dashboard/categories",
      label: t.sidebar.categories,
      icon: Settings,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/users",
      label: t.sidebar.users,
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/email-logs",
      label: language === "nl" ? "E-mail Logboeken" : "Email Logs",
      icon: ListTodo,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/settings",
      label: language === "nl" ? "Instellingen" : "Settings",
      icon: Settings,
      roles: ["USER", "SUPPORT", "ADMIN", "VIEWER"],
    },
    {
      href: "/dashboard/help",
      label: t.sidebar.help,
      icon: HelpCircle,
      roles: ["USER", "SUPPORT", "ADMIN", "VIEWER"],
    },
  ];

  const links = allLinks.filter((link) => link.roles.includes(role || "USER"));

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-orange-50 text-orange-600 font-medium"
                : "text-gray-600 hover:bg-orange-50/50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ role }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r hidden md:block overflow-y-auto">
      <div className="p-4">
        <SidebarLinks role={role} />
      </div>
    </aside>
  );
}
