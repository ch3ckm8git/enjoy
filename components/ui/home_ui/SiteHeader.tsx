"use client";

import Link from "next/link";
import Image from "next/image";
import { dictionary, Lang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/home_ui/LanguageSwitcher";
import logo from "@/app/assets/images/logo.png";
import { useAuth } from "@/components/providers/AuthProvider";

export function SiteHeader({ lang }: { lang: Lang }) {
    const t = dictionary[lang];
    const { user, loading } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                    <Image src={logo} alt="EnjoyTyping" className="h-8 w-auto" priority />
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href={`/${lang}/lessons`} className="hover:text-[#0066ff] transition-colors">{t.navbar.lessons}</Link>
                    <LanguageSwitcher currentLang={lang as "en" | "th"} />
                </nav>

                {!loading && (
                    <Link
                        href={`/${lang}/${user ? 'profile' : 'signup'}`}
                        className="h-10 px-5 border-2 border-[#0066ff] text-[#0066ff] bg-transparent text-sm font-bold rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center"
                    >
                        {user ? (user.displayName || "Profile") : t.hero.start}
                    </Link>
                )}
                {loading && (
                    <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg"></div>
                )}
            </div>
        </header>
    );
}
