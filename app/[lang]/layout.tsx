import { Inter, IBM_Plex_Sans_Thai } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  variable: "--font-ibm-thai",
  display: "swap",
});

export const dynamicParams = false; // ✅ only build known langs

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "th" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} className={`${inter.variable} ${ibmThai.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
