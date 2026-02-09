import React from "react";
import Link from "next/link";
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import {
  Bolt,
  Eye,
  Gauge,
  LineChart
} from "lucide-react";
import logo from "@/app/assets/images/logo.png";
import Image from "next/image";
import Keyboard3D from "@/components/ui/KeyboardVisual";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import TypingAnimation from "@/components/ui/TypingAnimation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();

  const lang: Lang = raw;
  const t = dictionary[lang];

  // Icons for the feature section
  const featureIcons = [Eye, Gauge, LineChart];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155]">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <Image src={logo} alt="EnjoyTyping" className="h-8 w-auto" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-[#0066ff] transition-colors">{t.navbar.games}</a>
            <a href="#" className="hover:text-[#0066ff] transition-colors">{t.navbar.lessons}</a>
            <LanguageSwitcher currentLang={lang as "en" | "th"} />
          </nav>

          <button className="h-10 px-5 border-2 border-[#0066ff] text-[#0066ff] bg-transparent text-sm font-bold rounded-lg hover:bg-blue-50 transition-all">
            {t.hero.start}
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6">
        {/* --- HERO SECTION --- */}
        <section className="py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-[#1e293b]">
                <TypingAnimation words={t.hero.title} />
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                {t.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="h-14 px-8 bg-[#10b981] text-white rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                {t.hero.start} <Bolt size={20} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-20 -left-10 size-64 bg-blue-500/5 blur-[100px] rounded-full" />
            <div className="relative aspect-square w-full rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-center w-full h-full rounded-3xl bg-slate-50/50 border border-slate-100">
                <Keyboard3D />
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION (FROM IMAGE) --- */}
        <section className="py-24 border-t border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#1e293b]">
              {t.features.title}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.features.items.map((feature: typeof dictionary.en.features.items[number], idx: number) => {
              const Icon = featureIcons[idx] ?? Eye;
              return (
                <div
                  key={idx}
                  className="p-10 rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="size-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-8 text-cyan-500 group-hover:scale-110 transition-transform">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1e293b]">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 bg-white py-12 mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo Part */}
            <div className="flex items-center gap-3">
              <Image src={logo} alt="EnjoyTyping" className="h-6 w-auto grayscale opacity-70" />
              {/* <span className="font-bold text-slate-700 text-lg tracking-tight">
                {t.footer.enjoytyping}
              </span> */}
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-slate-500">
              <Link href={`/${lang}/about`} className="hover:text-blue-600 transition-colors">{t.footer.about}</Link>
              <Link href={`/${lang}/privacy`} className="hover:text-blue-600 transition-colors">{t.footer.privacy}</Link>
              <Link href={`/${lang}/terms`} className="hover:text-blue-600 transition-colors">{t.footer.terms}</Link>
              <Link href={`/${lang}/contact`} className="hover:text-blue-600 transition-colors">{t.footer.contact}</Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} {t.footer.enjoytyping}. {t.footer.rights}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}