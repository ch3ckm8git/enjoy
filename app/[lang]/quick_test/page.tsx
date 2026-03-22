import { isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import QuickTestClient from "@/components/ui/lesson_ui/QuickTestClient";

export default async function QuickTestPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang: raw } = await params;
    if (!isLang(raw)) notFound();

    const lang: Lang = raw;

    return <QuickTestClient lang={lang} />;
}
