"use client";

import { useState, useEffect } from "react";

interface Props {
    words: string[] | readonly string[];
}

export default function TypingAnimation({ words }: Props) {
    const [index, setIndex] = useState(0); // Which word
    const [subIndex, setSubIndex] = useState(0); // Which character
    const [isDeleting, setIsDeleting] = useState(false);
    const [pause, setPause] = useState(false);

    useEffect(() => {
        // If we reached the end of the word, pause before deleting
        if (subIndex === words[index].length + 1 && !isDeleting) {
            setPause(true);
            setTimeout(() => {
                setPause(false);
                setIsDeleting(true);
            }, 4000); // How long to show the full word
            return;
        }

        // If we deleted everything, move to the next word
        if (subIndex === 0 && isDeleting) {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        // Typing / Deleting logic
        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
        }, isDeleting ? 80 : 150); // Deleting is faster than typing

        return () => clearTimeout(timeout);
    }, [subIndex, index, isDeleting, words]);

    const currentWord = words[index];
    const typedPart = currentWord.substring(0, subIndex);

    return (
        <span className="relative inline-block">
            {/* 1. The Ghost Text (Background) */}
            <span className="text-slate-300 opacity-40" aria-hidden="true">
                {currentWord}
            </span>

            {/* 2. The Active Typed Text (Foreground) */}
            <span className="absolute left-0 top-0 text-[#1e293b]">
                {typedPart}
                {/* 3. The Cursor / Caret */}
                <span
                    className={`inline-block w-[3px] h-[1.1em] bg-blue-500 ml-0.5 align-middle
          ${pause ? 'animate-pulse' : ''} 
          transition-all duration-75`}
                />
            </span>
        </span>
    );
}