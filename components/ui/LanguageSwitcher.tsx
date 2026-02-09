"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Using the generated flag assets
import flagTH from "@/app/assets/images/flag-th.png";
import flagUS from "@/app/assets/images/flag-us.png";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
    currentLang: "en" | "th";
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
    const pathname = usePathname();
    const currentFlag = currentLang === "th" ? flagTH : flagUS;
    const currentLabel = currentLang === "th" ? "ไทย" : "English";

    // Helper to get the path for a specific language
    const getLangPath = (targetLang: "en" | "th") => {
        if (!pathname) return `/${targetLang}`;

        const segments = pathname.split("/");
        // Handle root path or paths with existing lang
        if (segments.length > 1 && (segments[1] === "en" || segments[1] === "th")) {
            segments[1] = targetLang;
            return segments.join("/");
        }

        // If language segment is missing (shouldn't happen in this app structure), prepend it
        return `/${targetLang}${pathname}`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
                <div className="relative w-8 h-6 rounded-[3px] overflow-hidden border border-slate-200 shadow-sm">
                    <Image src={currentFlag} alt={currentLabel} fill className="object-cover" />
                </div>
                <span className="font-bold text-slate-700">{currentLabel}</span>
                <ChevronDown size={14} className="text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem asChild>
                    <Link href={getLangPath("en")} className="flex items-center gap-2 cursor-pointer w-full">
                        <div className="relative w-5 h-3.5 rounded-[2px] overflow-hidden border border-slate-200">
                            <Image src={flagUS} alt="English" fill className="object-cover" />
                        </div>
                        English
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={getLangPath("th")} className="flex items-center gap-2 cursor-pointer w-full">
                        <div className="relative w-5 h-3.5 rounded-[2px] overflow-hidden border border-slate-200">
                            <Image src={flagTH} alt="Thai" fill className="object-cover" />
                        </div>
                        ไทย
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

