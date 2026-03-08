import Link from "next/link";
import Image from "next/image";
import { dictionary, Lang } from "@/lib/i18n";
import logo from "@/app/assets/images/logo.png";

export function SiteFooter({ lang }: { lang: Lang }) {
    const t = dictionary[lang];

    return (
        <footer className="border-t border-slate-100 bg-white py-12 mt-20">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Logo Part */}
                    <div className="flex items-center gap-3">
                        <Image src={logo} alt="EnjoyTyping" className="h-6 w-auto grayscale opacity-70" />
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
    );
}
