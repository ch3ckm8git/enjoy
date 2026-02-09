import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: raw } = await params;
    if (!isLang(raw)) notFound();
    const lang: Lang = raw;
    const t = dictionary[lang];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col">
            <SiteHeader lang={lang} />

            <main className="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
                <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#1e293b] tracking-tight">{t.contact.title}</h1>

                <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                    {t.contact.description}
                </p>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1e293b]">{t.contact.emailTitle}</h3>
                            <p className="text-slate-500 text-sm">{t.contact.emailDesc}</p>
                        </div>
                    </div>

                    <a
                        href="mailto:pathaphibn@gmail.com"
                        className="text-2xl md:text-3xl font-black text-[#0066ff] hover:underline break-all"
                    >
                        pathaphibn@gmail.com
                    </a>
                </div>
            </main>

            <SiteFooter lang={lang} />
        </div>
    );
}
