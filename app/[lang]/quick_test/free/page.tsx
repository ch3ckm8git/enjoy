"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import TypingHands from "@/components/practice/TypingHands";
import { ExamResultBoard } from "@/components/ui/lesson_ui/ExamResultBoard";
import quickTestData from "@/data/json/quick_test.json";
import { keyToFinger } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { dictionary, Lang } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

type KeyDef = {
    base?: string; shift?: string; label?: string; span: number; align?: 'left' | 'right' | 'center'; isSpecial?: true; spacer?: true;
};

const fullKeyboardLayout: KeyDef[][] = [
    [
        { shift: "%", base: "-", span: 2 }, { shift: "+", base: "ๅ", span: 2 }, { shift: "๑", base: "/", span: 2 }, { shift: "๒", base: "_", span: 2 },
        { shift: "๓", base: "ภ", span: 2 }, { shift: "๔", base: "ถ", span: 2 }, { shift: "ู", base: "ุ", span: 2 }, { shift: "฿", base: "ึ", span: 2 },
        { shift: "๕", base: "ค", span: 2 }, { shift: "๖", base: "ต", span: 2 }, { shift: "๗", base: "จ", span: 2 }, { shift: "๘", base: "ข", span: 2 },
        { shift: "๙", base: "ช", span: 2 }, { label: "BACK", align: "right", isSpecial: true, span: 3 }
    ],
    [
        { label: "TAB", align: "left", isSpecial: true, span: 3 },
        { shift: "๐", base: "ๆ", span: 2 }, { shift: '"', base: "ไ", span: 2 }, { shift: "ฎ", base: "ำ", span: 2 }, { shift: "ฑ", base: "พ", span: 2 },
        { shift: "ธ", base: "ะ", span: 2 }, { shift: "ํ", base: "ั", span: 2 }, { shift: "๊", base: "ี", span: 2 }, { shift: "ณ", base: "ร", span: 2 },
        { shift: "ฯ", base: "น", span: 2 }, { shift: "ญ", base: "ย", span: 2 }, { shift: "ฐ", base: "บ", span: 2 }, { shift: ",", base: "ล", span: 2 },
        { shift: "ฅ", base: "ฃ", span: 2 }
    ],
    [
        { label: "CAPS", align: "left", isSpecial: true, span: 4 },
        { shift: "ฤ", base: "ฟ", span: 2 }, { shift: "ฆ", base: "ห", span: 2 }, { shift: "ฏ", base: "ก", span: 2 }, { shift: "โ", base: "ด", span: 2 },
        { shift: "ฌ", base: "เ", span: 2 }, { shift: "็", base: "้", span: 2 }, { shift: "๋", base: "่", span: 2 }, { shift: "ษ", base: "า", span: 2 },
        { shift: "ศ", base: "ส", span: 2 }, { shift: "ซ", base: "ว", span: 2 }, { shift: ".", base: "ง", span: 2 }, { label: "ENTER", align: "right", isSpecial: true, span: 3 }
    ],
    [
        { label: "SHIFT", align: "left", isSpecial: true, span: 5 },
        { shift: "(", base: "ผ", span: 2 }, { shift: ")", base: "ป", span: 2 }, { shift: "ฉ", base: "แ", span: 2 }, { shift: "ฮ", base: "อ", span: 2 },
        { shift: "ฺ", base: "ิ", span: 2 }, { shift: "์", base: "ื", span: 2 }, { shift: "?", base: "ท", span: 2 }, { shift: "ฒ", base: "ม", span: 2 },
        { shift: "ฬ", base: "ใ", span: 2 }, { shift: "ฦ", base: "ฝ", span: 2 }, { label: "SHIFT", align: "right", isSpecial: true, span: 4 }
    ],
    [
        { label: "CTRL", align: "left", isSpecial: true, span: 4 },
        { label: "", align: "left", isSpecial: true, span: 4 },
        { base: " ", label: "SPACE", isSpecial: true, span: 12 },
        { label: "", align: "left", isSpecial: true, span: 5 },
        { label: "CTRL", align: "right", isSpecial: true, span: 4 }
    ]
];

function FreeTypeComponent({ lang }: { lang: Lang }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = dictionary[lang];
    const timeParam = parseInt(searchParams.get("time") || "60", 10);

    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const [drills, setDrills] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(timeParam);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isLessonComplete, setIsLessonComplete] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [hasError, setHasError] = useState(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const { user } = useAuth();
    const [activeKeyPress, setActiveKeyPress] = useState<string | null>(null);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [completedChars, setCompletedChars] = useState(0); // Anti-cheat state
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const typeSound = useRef<HTMLAudioElement | null>(null);
    const errorSound = useRef<HTMLAudioElement | null>(null);

    const generateMoreDrills = (pool: string[], count = 10) => {
        const newDrills: string[] = [];
        const MAX_LINE_LENGTH = 40;
        for (let i = 0; i < count; i++) {
            let currentLine = "";
            while (currentLine.length < MAX_LINE_LENGTH - 5) {
                const randomWord = pool[Math.floor(Math.random() * pool.length)];
                if (currentLine.length + randomWord.length + 1 <= MAX_LINE_LENGTH) {
                    currentLine += (currentLine.length === 0 ? "" : " ") + randomWord;
                } else {
                    break;
                }
            }
            if (currentLine) newDrills.push(currentLine);
        }
        return newDrills;
    };

    useEffect(() => {
        typeSound.current = new Audio("/sounds/normal.mp3");
        errorSound.current = new Audio("/sounds/incorrect.wav");
        if (typeSound.current) typeSound.current.volume = 0.5;
        if (errorSound.current) errorSound.current.volume = 0.4;
    }, []);

    // Combine all pools for maximum variety
    const fullPool = [
        ...(quickTestData.exam_1_pool?.pool || []),
        ...(quickTestData.exam_2_pool?.pool || []),
        ...(quickTestData.exam_3_pool?.pool || [])
    ];

    useEffect(() => {
        setDrills(generateMoreDrills(fullPool, 15));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isTestStarted && !isLessonComplete) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setIsLessonComplete(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTestStarted, isLessonComplete]);

    useEffect(() => {
        if (currentDrillIndex >= drills.length - 5 && fullPool.length > 0) {
            setDrills(prev => [...prev, ...generateMoreDrills(fullPool, 10)]);
        }
    }, [currentDrillIndex, drills.length, fullPool]);

    const currentTextArr = Array.from(drills[currentDrillIndex] || "");
    const userInputArr = Array.from(userInput);
    const targetChar = currentTextArr[userInputArr.length] || "";

    useEffect(() => {
        if (userInputArr.length === currentTextArr.length && currentTextArr.length > 0) {
            setCompletedChars(prev => prev + currentTextArr.length);
            setCurrentDrillIndex(prev => prev + 1);
            setUserInput("");
        }
    }, [userInputArr.length, currentTextArr.length]);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const primaryFinger = keyToFinger[targetChar] ?? null;
    const isShiftActive = targetChar && fullKeyboardLayout.some(r => r.some(k => k.shift === targetChar));
    const activeFingers: number[] = [];
    if (primaryFinger !== null) {
        activeFingers.push(primaryFinger);
        if (isShiftActive) {
            if (primaryFinger >= 0 && primaryFinger <= 4) activeFingers.push(9);
            else if (primaryFinger >= 5 && primaryFinger <= 9) activeFingers.push(0);
        }
    }

    // Save practice time to totalLearningTime
    useEffect(() => {
        if (isLessonComplete && sessionToken && user) {
            user.getIdToken().then(token => {
                fetch('/api/add-time', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionToken,
                        timeToAddSeconds: timeParam,
                        isFreeType: true,
                        totalKeystrokes: completedChars + userInputArr.length
                    })
                }).catch(err => console.error("Failed to add learning time", err));
            });
        }
    }, [isLessonComplete, sessionToken, user, timeParam, completedChars, userInputArr.length]);

    if (isLessonComplete) {
        const correctKeystrokes = completedChars + userInputArr.length;
        const minutes = timeParam / 60;
        const wpm = minutes > 0 ? Math.round((correctKeystrokes / 5) / minutes) : 0;
        let accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100) : 100;
        if (accuracy < 0) accuracy = 0;

        return (
            <div className={`h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 transition-colors duration-1000 bg-blue-50/50`}>
                <div className="w-full max-w-4xl">
                    <ExamResultBoard
                        wpm={wpm}
                        accuracy={accuracy}
                        timeTaken={timeParam}
                        examTitle={(t.lessons.quickTestSection as any)?.freeType || "Free Type"}
                        examId={0}
                        isPassed={true}
                        isPractice={true}
                        lang={lang}
                        onRestart={() => {
                            window.location.reload();
                        }}
                        onContinue={() => {
                            router.push(`/${lang}/quick_test`);
                        }}
                        onCertificate={() => { }}
                    />
                </div>
            </div>
        );
    }

    const m = Math.floor(timeLeft / 60);
    const s = Math.floor(timeLeft % 60);
    const timerDisplayStr = `${m}:${s.toString().padStart(2, '0')}`;

    return (
        <div className="h-screen max-h-screen bg-slate-50 flex flex-col items-center justify-start py-2 px-4 overflow-hidden select-none font-sarabun" onClick={() => inputRef.current?.focus()}>
            <div className="w-full max-w-4xl flex items-center justify-between mb-4 mt-4">
                <Link href={`/${lang}/quick_test`} className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    {(t.lessons.quickTestSection as any)?.exitTest || "Exit Test"}
                </Link>
                <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">{((t.lessons.scoreboard as any)?.time_label) || "Timer"}</span>
                    <span className={`text-2xl font-black font-mono w-[80px] text-right ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                        {timerDisplayStr}
                    </span>
                </div>
                <div className="w-[100px]" />
            </div>

            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className={`w-full bg-white p-4 sm:p-6 rounded-2xl shadow-sm border ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'} mb-4 relative overflow-hidden transition-colors duration-150 min-h-[140px] flex flex-col items-center justify-center`}>
                    <div className="text-[clamp(1rem,3vw,1.875rem)] tracking-widest leading-relaxed whitespace-nowrap font-sarabun text-slate-800 flex flex-col items-start justify-center gap-2 md:gap-4 w-full overflow-hidden">
                        {drills.slice(Math.min(currentDrillIndex, Math.max(0, drills.length - 3)), Math.min(currentDrillIndex, Math.max(0, drills.length - 3)) + 3).map((drill, i) => {
                            const startIdx = Math.min(currentDrillIndex, Math.max(0, drills.length - 3));
                            const idx = startIdx + i;
                            if (idx < currentDrillIndex) {
                                return <div key={idx} className="text-emerald-500 opacity-60">{drill}</div>;
                            }
                            if (idx === currentDrillIndex) {
                                const isTallLeftChar = targetChar === "ไ" || targetChar === "ใ" || targetChar === "โ" || targetChar === "เ" || targetChar === "แ";
                                const isZeroWidth = targetChar ? /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(targetChar) : false;
                                const padClass = isTallLeftChar ? "pl-[3px] pr-[1px]" : isZeroWidth ? "px-[6px]" : "";
                                return (
                                    <div key={idx} className="w-full">
                                        <span className="text-emerald-500 bg-emerald-50 rounded-sm">{userInputArr.join("")}</span>
                                        {targetChar && <span className={`border-b-4 ${hasError ? 'border-red-500 text-red-500 bg-red-100' : 'border-blue-500 text-blue-600 bg-blue-50 font-medium'} animate-pulse rounded-t-sm ${padClass}`}>{"\u200C"}{targetChar === " " ? "\u00A0" : targetChar}</span>}
                                        {!targetChar && currentTextArr.length === userInputArr.length && <span className={`border-b-4 border-blue-500 text-blue-600 bg-blue-50 animate-pulse rounded-t-sm`}>{"\u200C"}&nbsp;</span>}
                                        <span className="text-slate-400">{"\u200C"}{currentTextArr.slice(userInputArr.length + 1).join("")}</span>
                                    </div>
                                );
                            }
                            return <div key={idx} className="text-slate-300">{drill}</div>;
                        })}
                    </div>
                </div>

                <div className="w-full max-w-4xl bg-[#cbd5e1] p-2 sm:p-3 rounded-2xl shadow-xl border-b-4 border-slate-400 mb-4 overflow-hidden relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setTotalKeystrokes(180); setTotalErrors(2); setTimeLeft(0); setIsLessonComplete(true);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md opacity-50 hover:opacity-100 z-50">
                        Dev: Finish Timer
                    </button>
                    <div className="grid grid-cols-29 auto-rows-fr gap-1 sm:gap-1.5 w-full">
                        {fullKeyboardLayout.flatMap((row, i) =>
                            row.map((key, j) => {
                                if (key.spacer) return <div key={`${i}-${j}`} style={{ gridColumn: `span ${key.span}` }} />;
                                const isTargetMatch = targetChar === key.base || targetChar === key.shift;
                                const isPressedMatch = activeKeyPress === key.base || activeKeyPress === key.shift;
                                let isCurrentTarget = isTargetMatch;
                                if (key.label === 'SHIFT' && isShiftActive) {
                                    if (key.align === 'left' && (primaryFinger !== null && primaryFinger >= 5 && primaryFinger <= 9)) isCurrentTarget = true;
                                    if (key.align === 'right' && (primaryFinger !== null && primaryFinger >= 0 && primaryFinger <= 4)) isCurrentTarget = true;
                                }
                                const isTargetActive = isCurrentTarget;
                                const isWrongKeyPressed = isPressedMatch && hasError;
                                const isRightKeyPressed = isPressedMatch && !hasError;
                                const isJustPressed = isPressedMatch;
                                const shiftRightChars = ["ู", "ํ", "๊", "็", "๋", "ฺ", "์"];
                                const shiftStrClass = shiftRightChars.includes(key.shift || "") ? 'translate-x-[4px] sm:translate-x-[6px]' : '';
                                const shiftUpChars = ["ุ"];
                                const baseStrClass = shiftUpChars.includes(key.base || "") ? '-translate-y-[2px] sm:-translate-y-[4px]' : '';
                                return (
                                    <div key={`${i}-${j}`} style={{ gridColumn: `span ${key.span}` }} className={`relative rounded-md border-b-[2px] sm:border-b-[4px] flex items-center transition-all duration-75 aspect-[1/1] h-auto ${key.span > 2 ? 'aspect-auto h-full' : ''} ${isWrongKeyPressed ? 'bg-rose-200 border-rose-400 text-rose-700 z-10 translate-y-[2px] shadow-none' : ''} ${(!isWrongKeyPressed && isTargetActive) ? 'bg-emerald-200 border-emerald-400 text-emerald-700 z-10 translate-y-[2px] shadow-none' : ''} ${isRightKeyPressed && !isCurrentTarget ? 'bg-slate-100 border-slate-300 text-slate-700 z-10 translate-y-[2px] shadow-none' : ''} ${!isCurrentTarget && !isJustPressed ? 'bg-white border-[#cbd5e1] text-[#1e293b] shadow-sm' : ''} ${key.align === 'left' ? 'justify-start pl-1 sm:pl-2' : key.align === 'right' ? 'justify-end pr-1 sm:pr-2' : 'justify-center'}`}>
                                        {key.isSpecial ? (
                                            <span className="text-[clamp(6px,1vw,12px)] font-bold uppercase text-slate-500 font-sarabun">{key.label}</span>
                                        ) : (
                                            <div className="w-full h-full relative font-sarabun">
                                                <span className={`absolute top-[10%] left-[10%] text-[clamp(7px,1.1vw,13px)] text-slate-400 font-medium ${shiftStrClass}`}>{key.shift}</span>
                                                <span className={`absolute bottom-[10%] right-[15%] text-[clamp(9px,1.5vw,18px)] font-bold text-slate-800 ${baseStrClass}`}>{key.base}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="w-full max-w-xl opacity-80 scale-[0.8] origin-top shrink-0">
                    <TypingHands activeFingers={activeFingers} />
                </div>

                <input
                    ref={inputRef} autoFocus className="opacity-0 absolute" value={userInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                            setUserInput(prev => prev.slice(0, -1)); setHasError(false);
                            if (typeSound.current) { typeSound.current.currentTime = 0; typeSound.current.play().catch(() => { }); }
                        }
                    }}
                    onChange={(e) => {
                        const val = Array.from(e.target.value);
                        if (val.length < userInputArr.length) return;
                        if (!isTestStarted) {
                            setIsTestStarted(true);
                            if (user) {
                                user.getIdToken().then(token => {
                                    fetch('/api/start-session', {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'freeType' })
                                    })
                                        .then(res => res.json())
                                        .then(data => {
                                            if (data.sessionToken) setSessionToken(data.sessionToken);
                                        })
                                        .catch(console.error);
                                }).catch(console.error);
                            }
                        }
                        setTotalKeystrokes(prev => prev + 1);
                        const newChar = val[val.length - 1];
                        setActiveKeyPress(newChar); setTimeout(() => setActiveKeyPress(null), 150);
                        if (newChar === targetChar) {
                            setUserInput(e.target.value); setHasError(false);
                            if (typeSound.current) { typeSound.current.currentTime = 0; typeSound.current.play().catch(() => { }); }
                        } else {
                            setHasError(true); setTotalErrors(prev => prev + 1); setTimeout(() => setHasError(false), 300);
                            if (errorSound.current) { errorSound.current.currentTime = 0; errorSound.current.play().catch(() => { }); }
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default function FreeTypePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = React.use(params);
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <FreeTypeComponent lang={lang as Lang} />
        </Suspense>
    );
}
