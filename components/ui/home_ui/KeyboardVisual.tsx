"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const playClick = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
    audio.volume = 0.2;
    audio.play().catch(() => { });
};

interface KeyProps {
    thai: string;
    eng: string;
    isPressed: boolean;
    isGreen?: boolean;
    floatingChar?: string;
    floatingColor?: string;
    width?: string;
    bg?: string;// Added optional width prop
}

const colorVariants: Record<string, string> = {
    blue: "bg-blue-200 border-blue-300 text-blue-700",
    emerald: "bg-emerald-200 border-emerald-400 text-emerald-700",
    rose: "bg-rose-200 border-rose-400 text-rose-700",
    slate: "bg-slate-200 border-slate-400 text-slate-700",
};

const Key = ({ thai, eng, isPressed, isGreen, floatingChar, floatingColor, bg, width = "w-20" }: KeyProps) => (
    <div className="relative">
        <AnimatePresence>
            {isPressed && floatingChar && (
                <motion.div
                    // FIX: Changed from glitchy blinking to a smooth "Pop Up" animation
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -24, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
                    className={`absolute left-1/2 -translate-x-1/2 text-4xl font-black ${floatingColor} z-30 pointer-events-none whitespace-nowrap`}
                >
                    {floatingChar}
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div
            animate={{ y: isPressed ? 6 : 0 }}
            // Added ${width} to className to support the spacebar
            className={`h-20 ${width} rounded-[1.25rem] flex flex-col items-center justify-center transition-all duration-75 shadow-lg
        ${isPressed ? "border-b-0" : "border-b-[6px]"}
        ${isGreen
                    ? "bg-[#dcfce7] border-[#bbf7d0] text-emerald-600"
                    : (bg && colorVariants[bg]) ? colorVariants[bg] :
                        "bg-white border-slate-200 text-slate-700"}
      `}
        >
            <span className="text-2xl font-black">{thai}</span>
            <span className="text-[10px] font-bold opacity-40 uppercase">{eng}</span>
        </motion.div>
    </div>
);

export default function KeyboardVisual() {
    const [pressed, setPressed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            setPressed((s) => new Set(s).add(e.key.toLowerCase()));
            if (!e.repeat) playClick();
        };
        const up = (e: KeyboardEvent) => setPressed((s) => {
            const n = new Set(s); n.delete(e.key.toLowerCase()); return n;
        });
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    }, []);

    const isEnterPressed = pressed.has("enter");

    return (
        <div className="flex items-center justify-center select-none p-10">
            {/* <div className="relative rotate-[-10deg] flex flex-col gap-3"> */}
            <div className="relative rotate-[-10deg] flex flex-col gap-3 p-10 bg-white/20 backdrop-blur-xl rounded-[4rem] border border-white/50 shadow-2xl">

                {/* ROW 1: Absolute Positioning */}
                <div className="flex gap-3 translate-x-14 absolute">
                    <Key thai="ฟ" eng="a" isPressed={pressed.has("a") || pressed.has("ฟ")} floatingChar="ฟ" floatingColor="text-emerald-400" />
                    <Key thai="ห" eng="s" isPressed={pressed.has("s") || pressed.has("ห")} floatingChar="ห" floatingColor="text-rose-400" />
                </div>

                {/* ROW 2: A, S, Enter */}
                {/* Added mt-24 here to push this row down, creating space below the absolute Row 1 */}
                <div className="flex gap-3 items-end">
                    <Key thai="ก" eng="d" isPressed={pressed.has("d") || pressed.has("ก")} floatingChar="ก" floatingColor="text-blue-500" />
                    <Key thai="ด" eng="f" isPressed={pressed.has("f") || pressed.has("ด")} floatingChar="ด" floatingColor="text-emerald-500" />

                    {/* ENTER KEY COMPOSITE */}
                    <div className="relative">
                        <AnimatePresence>
                            {isEnterPressed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: -24 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl font-black text-emerald-500 z-50 whitespace-nowrap"
                                >
                                    ENTER!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            animate={{ y: isEnterPressed ? 6 : 0 }}
                            className="relative flex flex-col items-end transition-all duration-75"
                        >
                            <div className={`w-27 h-24 bg-[#dcfce7] rounded-t-[1.25rem] rounded-tr-[1.25rem] relative z-10 
                  ${isEnterPressed ? "" : "border-r-[1px] border-t-[1px] border-[#bbf7d0]"}`}
                            />
                            <div className={`w-[10.5rem] h-20 bg-[#dcfce7] rounded-b-[1.25rem] rounded-tl-[1.25rem] rounded-tr-none flex items-center justify-end px-6 shadow-lg relative z-20
                   ${isEnterPressed ? "" : "border-b-[6px] border-[#bbf7d0] border-r-[1px] border-[#bbf7d0]"}
                `}>
                                <div className="flex flex-col items-end text-emerald-700">
                                    <span className="text-[10px] font-black uppercase opacity-40">Enter</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 10l-5 5 5 5" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className={`absolute top-16 right-0 w-20 h-10 bg-[#dcfce7] z-15 ${isEnterPressed ? "border-b-0" : "border-r-[1px] border-[#bbf7d0]"}`} />
                        </motion.div>
                    </div>
                </div>

                {/* ROW 3: Spacebar */}

                <div className="flex gap-3 mt-1">
                    <Key
                        thai=""
                        eng="Space"
                        isPressed={pressed.has(" ")}
                        width="w-88"
                        bg="blue"
                        floatingChar="SPACE!"
                        floatingColor="text-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}
