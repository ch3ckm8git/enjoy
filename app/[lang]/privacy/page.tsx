import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: raw } = await params;
    if (!isLang(raw)) notFound();
    const lang: Lang = raw;
    const t = dictionary[lang];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col">
            <SiteHeader lang={lang} />

            <main className="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
                <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#1e293b] tracking-tight">{t.privacy.title}</h1>

                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                    <p className="text-sm text-slate-400">{t.privacy.lastUpdated}</p>

                    <p>{t.privacy.intro}</p>

                    {t.privacy.sections.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-2xl font-bold text-[#1e293b] mt-8 mb-4">{section.title}</h2>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </main>

            <SiteFooter lang={lang} />
        </div>
    );
}
