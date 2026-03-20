"use client";

import { useLanguage } from "@/lib/language-context";
import {
  HelpCircle,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  CircleDot,
  UserCircle,
} from "lucide-react";

interface HelpContentProps {
  userRole: string;
}

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  FINAL_REVIEW: "bg-purple-100 text-purple-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
};

export function HelpContent({ userRole }: HelpContentProps) {
  const { t } = useLanguage();
  const help = t.help as any;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <HelpCircle className="w-6 h-6 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{help.title}</h1>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{help.overview}</h2>
        <p className="text-gray-600 leading-relaxed">{help.overviewText}</p>
      </div>

      {/* Your Role */}
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <UserCircle className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-orange-900">{help.yourRole}: {t.roles[userRole as keyof typeof t.roles] || userRole}</h2>
        </div>
        <p className="text-orange-800 leading-relaxed">
          {help.roleDescriptions[userRole as keyof typeof help.roleDescriptions] || help.roleDescriptions.USER}
        </p>
      </div>

      {/* Workflow */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{help.workflowTitle}</h2>
        <div className="space-y-4">
          {help.workflowSteps.map((item: { step: string; desc: string }, idx: number) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.step}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status overview */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CircleDot className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{help.statusTitle}</h2>
        </div>
        <div className="grid gap-3">
          {Object.entries(help.statusDescriptions).map(([key, desc]) => (
            <div key={key} className="flex items-start gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap mt-0.5 ${statusColors[key] || "bg-gray-100 text-gray-800"}`}>
                {t.status[key as keyof typeof t.status] || key}
              </span>
              <p className="text-gray-600 text-sm">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles overview */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{help.rolesTitle}</h2>
        </div>
        <div className="grid gap-4">
          {Object.entries(help.roleDescriptions).map(([role, desc]) => (
            <div key={role} className="flex items-start gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap mt-0.5 bg-gray-100 text-gray-800">
                {t.roles[role as keyof typeof t.roles] || role}
              </span>
              <p className="text-gray-600 text-sm">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-amber-900">{help.tipsTitle}</h2>
        </div>
        <ul className="space-y-3">
          {help.tips.map((tip: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-bold">
                {idx + 1}
              </span>
              <p className="text-amber-900 text-sm">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
