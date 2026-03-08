"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 bg-opacity-90 backdrop-blur-md">
            {/* Animated Robot Face */}
            <div className="relative w-40 h-40 mb-8">
                {/* Glowing aura */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
                />

                {/* Robot Head shape */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col items-center justify-center z-10"
                >
                    {/* Screens / Visor */}
                    <div className="w-28 h-14 bg-slate-900 rounded-2xl border-[3px] border-slate-800 shadow-inner flex items-center justify-center gap-3 relative overflow-hidden">

                        {/* Scanning line */}
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-y-0 w-12 bg-indigo-500/30 blur-md transform -skew-x-12"
                        />

                        {/* Left Eye */}
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.8, 1] }}
                            transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1], repeatDelay: 1 }}
                            className="w-6 h-5 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                        />
                        {/* Right Eye */}
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.8, 1] }}
                            transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1], repeatDelay: 1 }}
                            className="w-6 h-5 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                        />
                    </div>

                    {/* Mouth / Voice visualizer */}
                    <div className="mt-5 flex gap-1.5 items-end h-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [4, Math.random() * 12 + 6, 4] }}
                                transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, ease: "easeInOut" }}
                                className="w-1.5 bg-indigo-400 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Antennas */}
                <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-10 bg-slate-300 rounded-t-full z-0"
                >
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        className="absolute -top-2 -left-1 w-4 h-4 bg-rose-400 rounded-full shadow-[0_0_12px_rgba(251,113,133,0.8)]"
                    />
                </motion.div>

                {/* Ears */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-10 bg-slate-200 border border-slate-300 rounded-l-md z-0" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-10 bg-slate-200 border border-slate-300 rounded-r-md z-0" />
            </div>

            <p className="mt-6 text-xl font-bold text-slate-700 tracking-[0.2em] font-display uppercase flex items-center gap-1">
                LOADING
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
            </p>
        </div>
    );
}
