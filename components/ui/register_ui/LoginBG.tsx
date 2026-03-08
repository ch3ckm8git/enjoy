"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import loginBgImage from "@/app/assets/images/loginbg.jpg";
import "@/styles/star.css";

interface FallingKey {
    id: string;
    char: string;
    left: number;
    duration: number;
    isClicked: boolean;
}

const CHAR_POOL = "กขคงจฉชซญดตถทนบปผฝพฟมยรลวศษสหฬอฮ";

const LoginBG = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    const [keys, setKeys] = useState<FallingKey[]>([]);
    const [stars, setStars] = useState<{ left: string; delay: string; duration: string; size: string }[]>([]);

    const keysRef = useRef<FallingKey[]>([]);
    keysRef.current = keys;

    useEffect(() => {
        setMounted(true);
        setStars(Array.from({ length: 20 }).map(() => ({
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 12}s`,
            duration: `${12 + Math.random() * 8}s`, // Slower stars
            size: `${4 + Math.random() * 3}px`
        })));
    }, []);

    // 1. SLOWER GENERATION
    useEffect(() => {
        if (!mounted) return;

        const spawnInterval = setInterval(() => {
            // LIMIT: Only 8 keys max on screen to prevent clutter
            if (keysRef.current.length < 8) {
                const id = Math.random().toString(36).substring(2, 9);
                const duration = 10 + Math.random() * 5; // SLOW FALL: 10-15 seconds
                const isLeft = Math.random() > 0.5;
                const leftPos = isLeft ? Math.random() * 25 : 75 + Math.random() * 20;

                const newKey: FallingKey = {
                    id,
                    char: CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)],
                    left: leftPos,
                    duration,
                    isClicked: false
                };

                setKeys(prev => [...prev, newKey]);

                // AUTO-CLEANUP: Remove key after it falls off screen
                setTimeout(() => {
                    setKeys(prev => prev.filter(k => k.id !== id));
                }, duration * 1000);
            }
        }, 2500); // SPAWN RATE: Every 2.5 seconds

        return () => clearInterval(spawnInterval);
    }, [mounted]);

    // 2. PHYSICAL KEYBOARD INTERACTION
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const typedChar = e.key.toUpperCase();
            const target = keysRef.current.find(k => k.char === typedChar && !k.isClicked);

            if (target) {
                setKeys(prev => prev.map(k => k.id === target.id ? { ...k, isClicked: true } : k));
                setTimeout(() => {
                    setKeys(prev => prev.filter(k => k.id !== target.id));
                }, 400);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!mounted) return <div className="min-h-screen bg-[#0a0f1a]" />;

    return (
        <div className="relative min-h-screen w-full bg-[#0a0f1a] overflow-hidden flex items-center justify-center">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <Image src={loginBgImage} alt="BG" fill className="object-cover " priority />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-[#0a0f1a]" />
            </div>

            {/* Visual Stars */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {stars.map((star, i) => (
                    <div key={i} className="falling-star" style={{
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        animationDelay: star.delay,
                        animationDuration: star.duration
                    } as any} />
                ))}
            </div>

            {/* 3D Falling Keys */}
            {keys.map((key) => (
                <div
                    key={key.id}
                    className={`keyboard-key w-14 h-14 text-xl font-medium transition-colors duration-200
    ${key.isClicked ? 'clicked' : 'animate-key-fall'}
  `}
                    style={{
                        left: `${key.left}%`,
                        animationDuration: `${key.duration}s`,
                    } as React.CSSProperties}
                >
                    {key.char}
                </div>
            ))}

            {/* SIGNUP BOX CONTAINER - Fixed centering logic */}
            <div className="relative z-30 w-full flex items-center justify-center min-h-screen pointer-events-none">
                <div className="pointer-events-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LoginBG;