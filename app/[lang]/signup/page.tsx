"use client";

import React, { useEffect } from "react";
import LoginBG from "@/components/ui/register_ui/LoginBG";
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound, useRouter, useParams } from "next/navigation";
import GoogleSignInButton from "@/components/ui/register_ui/GoogleSignInButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    
    const raw = params.lang as string;
    if (!isLang(raw)) {
        notFound();
        return null;
    }

    const lang: Lang = raw;
    const t = dictionary[lang];

    // Redirect if already signed in
    useEffect(() => {
        if (!loading && user) {
            router.replace(`/${lang}/profile`);
        }
    }, [user, loading, router, lang]);

    if (loading || user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium animate-pulse">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <LoginBG>
            <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl border-b-[6px] border-gray-500 p-8 md:p-10 my-8">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
                        {t.signup.title}
                    </h1>
                </div>

                {/* Primary Action: Google Sign-In */}
                <GoogleSignInButton buttonText={t.signup.continueWithGoogle} lang={lang} />
            </div>
        </LoginBG>
    );
}