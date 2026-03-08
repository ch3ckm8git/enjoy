
"use client";
import React, { useState, useEffect, useRef } from "react";
import TypingHands from "@/components/practice/TypingHands";
import { ScoreBoard } from "@/components/ui/lesson_ui/ScoreBoard";
import lessons from "@/data/json/output_reindexed_with_test.json";
import userLessonData from "@/data/json/lesson.json";
import { keyToFinger } from "@/lib/utils";
import { notFound, useRouter } from "next/navigation";
import { Lang } from "@/lib/i18n";

type KeyDef = {
    base?: string;
    shift?: string;
    label?: string;
    span: number; // Grid units (Standard key = 2)
    align?: 'left' | 'right' | 'center';
    isSpecial?: true;
    spacer?: true;
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

export default function PracticePage({ params }: { params: Promise<{ lang: string; lesson: string }> }) {
    const { lang, lesson } = React.use(params);
    const router = useRouter();
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const [drills, setDrills] = useState<string[]>([]);

    // Performance Tracking State
    const [userInput, setUserInput] = useState("");
    const [hasError, setHasError] = useState(false);
    const [activeKeyPress, setActiveKeyPress] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [isLessonComplete, setIsLessonComplete] = useState(false);

    // Extracted metadata for ScoreBoard
    const [lessonTitle, setLessonTitle] = useState("");
    const [unitId, setUnitId] = useState<number | null>(null);
    const [subId, setSubId] = useState<number | null>(null);
    const [totalSubUnits, setTotalSubUnits] = useState(4); // Default to 4
    const [specialInstruction, setSpecialInstruction] = useState<string | null>(null);
    const [hideInstruction, setHideInstruction] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Audio refs
    const typeSound = useRef<HTMLAudioElement | null>(null);
    const errorSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Use user's local sound for typing
        typeSound.current = new Audio("/sounds/normal.mp3");
        // A softer, lower-pitched bass thud for errors
        errorSound.current = new Audio("/sounds/incorrect.wav");

        if (typeSound.current) typeSound.current.volume = 0.5;
        if (errorSound.current) errorSound.current.volume = 0.4;
    }, []);

    // Find the subunit drill data and metadata
    useEffect(() => {
        // [lesson] is expected to be format like "1.1" or "2.3"
        const [uIdStr, sIdStr] = lesson.split('.');
        const unitKey = `unit_${uIdStr}`;

        const lessonData = (lessons as Record<string, any>)[unitKey];
        if (lessonData && lessonData[lesson]) {
            let finalDrills = lessonData[lesson];

            // Prepend special_drill to the first subunit (e.g. 3.1)
            if (sIdStr === "1" && lessonData.special_drill) {
                finalDrills = [...lessonData.special_drill, ...finalDrills];
            }

            // Chunk drills that are too long to ensure rigid 3-line display
            const MAX_LINE_LENGTH = 40;
            const chunkedDrills: string[] = [];

            for (const drill of finalDrills) {
                if (drill.length <= MAX_LINE_LENGTH) {
                    chunkedDrills.push(drill);
                } else {
                    let currentChunk = "";
                    const words = drill.split(" ");

                    for (const word of words) {
                        if ((currentChunk + (currentChunk ? " " : "") + word).length <= MAX_LINE_LENGTH) {
                            currentChunk = currentChunk ? currentChunk + " " + word : word;
                        } else {
                            if (currentChunk) chunkedDrills.push(currentChunk);

                            if (word.length > MAX_LINE_LENGTH) {
                                // Substrings directly if a single word is insanely long
                                let remaining = word;
                                while (remaining.length > 0) {
                                    chunkedDrills.push(remaining.substring(0, MAX_LINE_LENGTH));
                                    remaining = remaining.substring(MAX_LINE_LENGTH);
                                }
                                currentChunk = "";
                            } else {
                                currentChunk = word;
                            }
                        }
                    }
                    if (currentChunk) chunkedDrills.push(currentChunk);
                }
            }

            setDrills(chunkedDrills);
            setLessonTitle(lessonData.title || `Unit ${uIdStr}`);
            setUnitId(parseInt(uIdStr, 10));
            setSubId(parseInt(sIdStr, 10));

            // Set special instruction text if available
            if (lessonData.special_subtitle || lessonData.special_subtitle2) {
                setSpecialInstruction(lang === 'en' && lessonData.special_subtitle2 ? lessonData.special_subtitle2 : lessonData.special_subtitle);
                setHideInstruction(false);
            } else {
                setSpecialInstruction(null);
            }

            // Count total subunits (keys that look like numbers)
            let count = 0;
            for (const k in lessonData) {
                if (!isNaN(parseFloat(k))) count++;
            }
            if (count > 0) setTotalSubUnits(count);
        } else {
            notFound();
        }
    }, [lesson]);

    // Use Array.from to correctly break apart Thai combining characters
    const currentTextArr = Array.from(drills[currentDrillIndex] || "");
    const userInputArr = Array.from(userInput);
    const targetChar = currentTextArr[userInputArr.length] || "";

    useEffect(() => {
        if (userInputArr.length === currentTextArr.length && currentTextArr.length > 0) {
            if (currentDrillIndex < drills.length - 1) {
                // Next drill
                setCurrentDrillIndex(prev => prev + 1);
                setUserInput("");
            } else if (!isLessonComplete && totalKeystrokes > 0) {
                // Lesson complete!
                setEndTime(Date.now());
                setIsLessonComplete(true);
            }
        }
    }, [userInputArr.length, currentTextArr.length, currentDrillIndex, drills.length, isLessonComplete, totalKeystrokes]);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const primaryFinger = keyToFinger[targetChar] ?? null;
    const isShiftActive = targetChar && fullKeyboardLayout.some(r => r.some(k => k.shift === targetChar));

    const activeFingers: number[] = [];
    if (primaryFinger !== null) {
        activeFingers.push(primaryFinger);
        if (isShiftActive) {
            if (primaryFinger >= 0 && primaryFinger <= 4) {
                activeFingers.push(9); // Right Shift
            } else if (primaryFinger >= 5 && primaryFinger <= 9) {
                activeFingers.push(0); // Left Shift
            }
        }
    }

    // Save Progress logic
    useEffect(() => {
        if (isLessonComplete && startTime && endTime && unitId && subId) {
            const timeTakenSec = Math.round((endTime - startTime) / 1000);
            const minutes = timeTakenSec / 60;
            const wpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;

            // Allow accuracy to go below 0 visually just in case, but cap it nicely
            let accuracy = totalKeystrokes > 0
                ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
                : 100;
            if (accuracy < 0) accuracy = 0;

            fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unitId,
                    subId,
                    wpm,
                    accuracy,
                    time: timeTakenSec
                })
            }).catch(err => console.error("Failed to save progress", err));
        }
    }, [isLessonComplete, startTime, endTime, totalKeystrokes, totalErrors, unitId, subId]);

    if (isLessonComplete && startTime && endTime) {
        // Calculate final stats
        const timeTakenSec = Math.round((endTime - startTime) / 1000);
        const minutes = timeTakenSec / 60;
        const wpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;
        let accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100) : 100;
        if (accuracy < 0) accuracy = 0;

        return (
            <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full">
                    <ScoreBoard
                        wpm={wpm}
                        accuracy={accuracy}
                        timeTaken={timeTakenSec}
                        lessonTitle={lessonTitle}
                        unitId={unitId || undefined}
                        currentSubUnit={subId || 1}
                        totalSubUnits={totalSubUnits}
                        lang={lang as Lang}
                        onRestart={() => {
                            // Reset state
                            setIsLessonComplete(false);
                            setCurrentDrillIndex(0);
                            setUserInput("");
                            setStartTime(null);
                            setEndTime(null);
                            setTotalKeystrokes(0);
                            setTotalErrors(0);
                        }}
                        onContinue={() => {
                            // Logic to go to next subunit or dashboard
                            if (unitId && subId !== null && subId < totalSubUnits) {
                                router.push(`/${lang}/lessons/${unitId}.${subId + 1}`);
                            } else {
                                router.push(`/${lang}/lessons`);
                            }
                        }}
                        onNavigate={(targetSubId) => {
                            router.push(`/${lang}/lessons/${unitId}.${targetSubId}`);
                        }}
                        subUnitData={userLessonData?.units.find((u: any) => u.unitId === unitId)?.subUnits || []}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen max-h-screen bg-slate-50 flex flex-col items-center justify-start py-2 px-4 overflow-hidden select-none font-sarabun mt-10" onClick={() => inputRef.current?.focus()}>
            <div className="w-full max-w-4xl flex flex-col items-center">

                {/* Special Instruction (if any) */}
                {specialInstruction && !hideInstruction && (
                    <div className="w-full bg-blue-50/80 border border-blue-200 text-blue-800 px-6 py-3 rounded-xl mb-4 flex items-center justify-between font-sarabun text-sm md:text-base font-medium shadow-sm">
                        <span className="flex-1 text-center">{specialInstruction}</span>
                        <button onClick={(e) => { e.stopPropagation(); setHideInstruction(true); setTimeout(() => inputRef.current?.focus(), 0); }} className="ml-2 text-blue-500 hover:text-blue-700 p-1 flex-shrink-0" title="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Progress Board - Fixed rigid 3-line viewing window */}
                <div className={`w-full bg-white p-4 sm:p-6 rounded-2xl shadow-sm border ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'} mb-4 relative overflow-hidden transition-colors duration-150 min-h-[140px] flex flex-col items-center justify-center`}>
                    <div className="text-[clamp(0.8rem,2.5vw,1.875rem)] tracking-normal sm:tracking-widest leading-relaxed whitespace-nowrap font-sarabun text-slate-800 flex flex-col items-start justify-center gap-2 md:gap-4 max-w-full w-full">
                        {drills.slice(Math.min(currentDrillIndex, Math.max(0, drills.length - 3)), Math.min(currentDrillIndex, Math.max(0, drills.length - 3)) + 3).map((drill, i) => {
                            const startIdx = Math.min(currentDrillIndex, Math.max(0, drills.length - 3));
                            const idx = startIdx + i;

                            // Completed line
                            if (idx < currentDrillIndex) {
                                return (
                                    <div key={idx} className="text-emerald-500 opacity-60">
                                        {drill}
                                    </div>
                                );
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

                            // Future line
                            return (
                                <div key={idx} className="text-slate-300">
                                    {drill}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Keyboard Visual - Proportional Grid Sizing */}
                <div className="w-full max-w-4xl bg-[#cbd5e1] p-2 sm:p-3 rounded-2xl shadow-xl border-b-4 border-slate-400 mb-4 overflow-hidden mt-10 relative">
                    {/* DEBUG BUTTON */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (startTime === null) setStartTime(Date.now() - 54000); // 1 min ago
                            setTotalKeystrokes(180);
                            setTotalErrors(2);
                            setEndTime(Date.now());
                            setIsLessonComplete(true);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md opacity-50 hover:opacity-100 z-50">
                        Dev: Finish
                    </button>
                    <div className="grid grid-cols-29 auto-rows-fr gap-1 sm:gap-1.5 w-full">
                        {fullKeyboardLayout.flatMap((row, i) =>
                            row.map((key, j) => {
                                if (key.spacer) return <div key={`${i}-${j}`} style={{ gridColumn: `span ${key.span}` }} />;

                                // Match target character
                                const isTargetMatch = targetChar === key.base || targetChar === key.shift;

                                // Match actively pressed key (for animation)
                                const isPressedMatch = activeKeyPress === key.base || activeKeyPress === key.shift;

                                let isCurrentTarget = isTargetMatch;
                                if (key.label === 'SHIFT' && isShiftActive) {
                                    if (key.align === 'left' && (primaryFinger !== null && primaryFinger >= 5 && primaryFinger <= 9)) {
                                        isCurrentTarget = true;
                                    }
                                    if (key.align === 'right' && (primaryFinger !== null && primaryFinger >= 0 && primaryFinger <= 4)) {
                                        isCurrentTarget = true;
                                    }
                                }

                                // CSS conditions based on state
                                const isTargetActive = isCurrentTarget; // Target key always pulses green telling them to press it
                                const isWrongKeyPressed = isPressedMatch && hasError; // Their finger hit the WRONG key
                                const isRightKeyPressed = isPressedMatch && !hasError; // Their finger hit the RIGHT key
                                const isJustPressed = isPressedMatch; // They pressed *something*

                                // Vowel Positioning
                                const shiftRightChars = ["ู", "ํ", "๊", "็", "๋", "ฺ", "์"];
                                const shiftStrClass = shiftRightChars.includes(key.shift || "") ? 'translate-x-[4px] sm:translate-x-[6px]' : '';
                                const shiftUpChars = ["ุ"];
                                const baseStrClass = shiftUpChars.includes(key.base || "") ? '-translate-y-[2px] sm:-translate-y-[4px]' : '';

                                return (
                                    <div
                                        key={`${i}-${j}`}
                                        style={{ gridColumn: `span ${key.span}` }}
                                        className={`
                                                relative rounded-md border-b-[2px] sm:border-b-[4px] 
                                                flex items-center transition-all duration-75 
                                                aspect-[1/1] h-auto
                                                ${key.span > 2 ? 'aspect-auto h-full' : ''}
                                                ${isWrongKeyPressed ? 'bg-rose-200 border-rose-400 text-rose-700 z-10 translate-y-[2px] shadow-none' : ''}
                                                ${(!isWrongKeyPressed && isTargetActive) ? 'bg-emerald-200 border-emerald-400 text-emerald-700 z-10 translate-y-[2px] shadow-none' : ''}
                                                ${isRightKeyPressed && !isCurrentTarget ? 'bg-slate-100 border-slate-300 text-slate-700 z-10 translate-y-[2px] shadow-none' : ''}
                                                ${!isCurrentTarget && !isJustPressed ? 'bg-white border-[#cbd5e1] text-[#1e293b] shadow-sm' : ''}
                                                ${key.align === 'left' ? 'justify-start pl-1 sm:pl-2' : key.align === 'right' ? 'justify-end pr-1 sm:pr-2' : 'justify-center'}
                                            `}
                                    >
                                        {key.isSpecial ? (
                                            <span className="text-[clamp(6px,1vw,12px)] font-bold uppercase text-slate-500 font-sarabun">{key.label}</span>
                                        ) : (
                                            <div className="w-full h-full relative font-sarabun">
                                                <span className={`absolute top-[10%] left-[10%] text-[clamp(7px,1.1vw,13px)] text-slate-400 font-medium ${shiftStrClass}`}>
                                                    {key.shift}
                                                </span>
                                                <span className={`absolute bottom-[10%] right-[15%] text-[clamp(9px,1.5vw,18px)] font-bold text-slate-800 ${baseStrClass}`}>
                                                    {key.base}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Hands Visual - Scaled for visibility */}
                <div className="w-full max-w-xl opacity-80 scale-[0.8] sm:scale-[1.0] origin-top shrink-0">
                    <TypingHands activeFingers={activeFingers} />
                </div>

                <input
                    ref={inputRef}
                    autoFocus
                    className="opacity-0 absolute"
                    value={userInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                            setUserInput(prev => prev.slice(0, -1));
                            setHasError(false);
                            if (typeSound.current) {
                                typeSound.current.currentTime = 0;
                                typeSound.current.play().catch(() => { });
                            }
                        }
                    }}
                    onChange={(e) => {
                        const val = Array.from(e.target.value);
                        // Provide typing sound on success, error sound on fail
                        if (val.length < userInputArr.length) return; // Handled by Backspace

                        // Start timer on first keystroke
                        if (startTime === null) setStartTime(Date.now());
                        setTotalKeystrokes(prev => prev + 1);

                        const newChar = val[val.length - 1];

                        // Trigger keypress animation
                        setActiveKeyPress(newChar);
                        setTimeout(() => setActiveKeyPress(null), 150);

                        if (newChar === targetChar) {
                            setUserInput(e.target.value);
                            setHasError(false);
                            if (typeSound.current) {
                                typeSound.current.currentTime = 0;
                                typeSound.current.play().catch(() => { });
                            }
                        } else {
                            // User typed the wrong character
                            setHasError(true);
                            setTotalErrors(prev => prev + 1);

                            // Auto clear the red flash state
                            setTimeout(() => setHasError(false), 300);
                            if (errorSound.current) {
                                errorSound.current.currentTime = 0;
                                errorSound.current.play().catch(() => { });
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}