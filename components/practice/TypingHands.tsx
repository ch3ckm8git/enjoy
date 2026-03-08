"use client";
import { motion } from "framer-motion";

export default function TypingHands({ activeFingers }: { activeFingers: number[] }) {
    const getFingerColor = (index: number) =>
        activeFingers.includes(index) ? "#3b82f6" : "#e2e8f0";

    return (
        <div className="flex justify-between w-full max-w-3xl mx-auto px-10">
            {/* Left Hand SVG */}
            <svg width="180" height="200" viewBox="0 0 200 200">
                <path d="M50 180 Q30 150 30 100" stroke="#cbd5e1" fill="none" strokeWidth="2" />
                <rect x="20" y="80" width="25" height="60" rx="10" fill={getFingerColor(0)} /> {/* Pinky */}
                <rect x="50" y="50" width="25" height="80" rx="10" fill={getFingerColor(1)} /> {/* Ring */}
                <rect x="85" y="40" width="25" height="90" rx="10" fill={getFingerColor(2)} /> {/* Middle */}
                <rect x="120" y="50" width="25" height="80" rx="10" fill={getFingerColor(3)} /> {/* Index */}
                <rect x="155" y="110" width="40" height="25" rx="10" fill={getFingerColor(4)} /> {/* Thumb */}
            </svg>

            {/* Right Hand SVG */}
            <svg width="180" height="200" viewBox="0 0 200 200">
                <path d="M150 180 Q170 150 170 100" stroke="#cbd5e1" fill="none" strokeWidth="2" />
                <rect x="5" y="110" width="40" height="25" rx="10" fill={getFingerColor(5)} /> {/* Thumb */}
                <rect x="55" y="50" width="25" height="80" rx="10" fill={getFingerColor(6)} /> {/* Index */}
                <rect x="90" y="40" width="25" height="90" rx="10" fill={getFingerColor(7)} /> {/* Middle */}
                <rect x="125" y="50" width="25" height="80" rx="10" fill={getFingerColor(8)} /> {/* Ring */}
                <rect x="155" y="80" width="25" height="60" rx="10" fill={getFingerColor(9)} /> {/* Pinky */}
            </svg>
        </div>
    );
}