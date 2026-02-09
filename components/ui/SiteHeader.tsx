import Link from "next/link";
import Image from "next/image";
import { dictionary, Lang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import logo from "@/app/assets/images/logo.png";

export function SiteHeader({ lang }: { lang: Lang }) {
    const t = dictionary[lang];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                    <Image src={logo} alt="EnjoyTyping" className="h-8 w-auto" priority />
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="#" className="hover:text-[#0066ff] transition-colors">{t.navbar.games}</Link>
                    <Link href="#" className="hover:text-[#0066ff] transition-colors">{t.navbar.lessons}</Link>
                    <LanguageSwitcher currentLang={lang as "en" | "th"} />
                </nav>

                <button className="h-10 px-5 border-2 border-[#0066ff] text-[#0066ff] bg-transparent text-sm font-bold rounded-lg hover:bg-blue-50 transition-all">
                    {t.hero.start}
                </button>
            </div>
        </header>
    );
}
