"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Lang } from "@/lib/i18n";

export default function ProtectedRoute({ children, lang }: { children: React.ReactNode; lang: Lang }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${lang}/signup`);
        }
    }, [user, loading, router, lang]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Still checking redirect or rendering children
    return user ? <>{children}</> : null;
}
