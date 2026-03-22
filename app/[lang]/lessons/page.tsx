import { isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import LessonsDashboardClient from "@/components/ui/lesson_ui/LessonsDashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();

  const lang: Lang = raw;

  return (
    <LessonsDashboardClient lang={lang} />
  );
}

