"use client";

import Link from "next/link";
import { Lightbulb, ArrowRight, Users, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function LandingContent() {
  const { t, language, setLanguage } = useLanguage();

  const content = {
    nl: {
      heroTitle1: "Stroomlijn uw",
      heroTitle2: "FeatureHub",
      heroSubtitle: "Een samenwerkingsplatform voor teams om functieverzoeken in te dienen, te beoordelen en te prioriteren met een gestructureerde workflow.",
      getStarted: "Gratis Starten",
      login: "Inloggen",
      feature1Title: "AI-ondersteunde Assistentie",
      feature1Desc: "Krijg intelligente suggesties om overtuigende functieverzoeken te schrijven met duidelijke zakelijke onderbouwing.",
      feature2Title: "Gestructureerde Workflow",
      feature2Desc: "Duidelijk beoordelingsproces van indiening via support-beoordeling tot definitieve admin-beslissing.",
      feature3Title: "Analyse Dashboard",
      feature3Desc: "Volg verzoeken per status, prioriteit en categorie met visuele analyses en trends.",
      workflowTitle: "Eenvoudige, Lineaire Workflow",
      step1: "Indienen",
      step1Desc: "Maak verzoeken met AI-hulp",
      step2: "Support Beoordeling",
      step2Desc: "Details toevoegen & prioriteit",
      step3: "Admin Beslissing",
      step3Desc: "Accepteren, afwijzen of terugsturen",
      footer: "FeatureHub © 2026",
    },
    en: {
      heroTitle1: "Streamline your",
      heroTitle2: "Feature Requests",
      heroSubtitle: "A collaborative platform for teams to submit, review, and prioritize feature requests with a structured workflow.",
      getStarted: "Get Started Free",
      login: "Log in",
      feature1Title: "AI-Powered Assistance",
      feature1Desc: "Get intelligent suggestions to write compelling feature requests with clear business justification.",
      feature2Title: "Structured Workflow",
      feature2Desc: "Clear review process from submission through support review to final admin decision.",
      feature3Title: "Analytics Dashboard",
      feature3Desc: "Track requests by status, priority, and category with visual analytics and trends.",
      workflowTitle: "Simple, Linear Workflow",
      step1: "Submit",
      step1Desc: "Create requests with AI help",
      step2: "Support Review",
      step2Desc: "Add details & priority",
      step3: "Admin Decision",
      step3Desc: "Accept, decline or return",
      footer: "FeatureHub © 2026",
    },
    de: {
      heroTitle1: "Optimieren Sie Ihre",
      heroTitle2: "Funktionsanfragen",
      heroSubtitle: "Eine kollaborative Plattform für Teams zum Einreichen, Überprüfen und Priorisieren von Funktionsanfragen mit einem strukturierten Workflow.",
      getStarted: "Kostenlos starten",
      login: "Anmelden",
      feature1Title: "KI-gestützte Hilfe",
      feature1Desc: "Erhalten Sie intelligente Vorschläge zum Schreiben überzeugender Anfragen mit klarer geschäftlicher Begründung.",
      feature2Title: "Strukturierter Workflow",
      feature2Desc: "Klarer Überprüfungsprozess von der Einreichung über den Support bis zur endgültigen Admin-Entscheidung.",
      feature3Title: "Analyse-Dashboard",
      feature3Desc: "Verfolgen Sie Anfragen nach Status, Priorität und Kategorie mit visuellen Analysen und Trends.",
      workflowTitle: "Einfacher, linearer Workflow",
      step1: "Einreichen",
      step1Desc: "Anfragen mit KI erstellen",
      step2: "Support",
      step2Desc: "Details & Priorität",
      step3: "Admin",
      step3Desc: "Akzeptieren, ablehnen oder zurück",
      footer: "FeatureHub © 2026",
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">{t.appName}</span>
          </div>
          <div className="flex gap-3 items-center">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "nl" ? "en" : language === "en" ? "de" : "nl")}
              className="flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden xs:inline">
                {{ nl: "🇳🇱 NL", en: "🇬🇧 EN", de: "🇩🇪 DE" }[language as "nl"|"en"|"de"] || "🇳🇱 NL"}
              </span>
              <span className="xs:hidden">
                {{ nl: "NL", en: "EN", de: "DE" }[language as "nl"|"en"|"de"] || "NL"}
              </span>
            </Button>
            <Link href="/login">
              <Button variant="ghost">{c.login}</Button>
            </Link>
            <Link href="/signup">
              <Button>{c.getStarted}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {c.heroTitle1} <span className="text-blue-500">{c.heroTitle2}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {c.heroSubtitle}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                {c.getStarted} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {c.login}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{c.feature1Title}</h3>
            <p className="text-gray-600">{c.feature1Desc}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{c.feature2Title}</h3>
            <p className="text-gray-600">{c.feature2Desc}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{c.feature3Title}</h3>
            <p className="text-gray-600">{c.feature3Desc}</p>
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-12">{c.workflowTitle}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {[
              { step: "1", title: c.step1, desc: c.step1Desc },
              { step: "2", title: c.step2, desc: c.step2Desc },
              { step: "3", title: c.step3, desc: c.step3Desc },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center min-w-[180px]">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          {c.footer}
        </div>
      </footer>
    </div>
  );
}
