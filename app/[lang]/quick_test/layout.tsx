import { Sidebar } from '@/components/ui/lesson_ui/sidebar';
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function QuickTestLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang: raw } = await params;
    if (!isLang(raw)) notFound();

    const lang: Lang = raw;
    const t = dictionary[lang];

    return (
        <div className="bg-slate-50 font-sans text-slate-900 min-h-screen flex overflow-hidden w-full">
            <Sidebar lang={lang} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
                {children}
            </main>
        </div>
    );
}
