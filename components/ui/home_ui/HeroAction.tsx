"use client";

import Link from "next/link";
import { Bolt } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function HeroAction({ lang, startText }: { lang: string, startText: string }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-14 w-48 bg-slate-200 animate-pulse rounded-xl"></div>
        );
    }

    return (
        <Link
            href={`/${lang}/${user ? 'lessons' : 'signup'}`}
            className="h-14 px-8 bg-[#10b981] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 max-w-max"
        >
            {user ? (lang === 'th' ? 'ไปที่บทเรียน' : 'Go to Lessons') : startText} <Bolt size={20} fill="currentColor" />
        </Link>
    );
}
