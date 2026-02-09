"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// import your UI components...
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({
    lang,
    t,
    otherLang,
    logo,
}: {
    lang: string;
    t: any;
    otherLang: string;
    logo: any;
}) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled ? "bg-background/80 backdrop-blur border-b" : "bg-transparent border-transparent"}
      `}
        >
            <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
                <Link href={`/${lang}`} className="flex items-center gap-2">
                    <Image src={logo} alt="EnjoyTyping" className="h-8 w-auto" priority />
                </Link>

                <nav className="hidden items-center gap-3 md:flex">
                    {/* Games dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                {t.nav.games}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>{t.dropdown.gameModes}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/${lang}/dino`}>{t.games.dino}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/${lang}/draw`}>{t.games.draw}</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Lessons dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                {t.nav.lessons}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>{t.dropdown.lessonLang}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/${lang}/lessons/th`}>{t.lessons.thai}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/${lang}/lessons/en`}>{t.lessons.english}</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        href={`/${lang}/classroom`}
                        className="rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        {t.nav.classroom}
                    </Link>

                    {/* <Link
              href={`/${lang}/leaderboard`}
              className="rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {t.nav.leaderboard}
            </Link> */}
                </nav>

                <div className="flex items-center gap-2">
                    {/* Language switch */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-md px-3">
                                {t.nav.langLabel}: {lang === "th" ? "ไทย" : "EN"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href={`/${otherLang}`}>
                                    {otherLang === "th" ? "ไทย" : "English"}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Login (outline, not too rounded) */}
                    <Button
                        variant="outline"
                        className="rounded-md border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        asChild
                    >
                        <Link href={`/${lang}/login`}>{t.nav.login}</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
