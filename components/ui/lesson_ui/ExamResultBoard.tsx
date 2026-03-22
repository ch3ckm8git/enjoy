import { Trophy, RefreshCw, ArrowRight, Award, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dictionary, Lang } from '@/lib/i18n';
import { motion } from 'framer-motion';

interface ExamResultBoardProps {
    wpm: number;
    accuracy: number;
    timeTaken: number; // in seconds
    examTitle: string;
    lang: Lang;
    examId: number;
    isPassed: boolean; // You can pass logic true/false based on WPM/ACC later
    isPractice?: boolean;
    onRestart: () => void;
    onContinue: () => void;
    onCertificate: () => void;
    isProcessing?: boolean;
    errorDetail?: string | null;
}

const circleRadius = 45;
const circleCircumference = 2 * Math.PI * circleRadius;

// Formatter helper
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export function ExamResultBoard({
    wpm,
    accuracy,
    timeTaken,
    examTitle,
    lang,
    examId,
    isPassed = true,
    isPractice = false,
    onRestart,
    onContinue,
    onCertificate,
    isProcessing = false,
    errorDetail = null
}: ExamResultBoardProps) {
    const t = (dictionary[lang] as any).lessons.scoreboard;
    const tExam = dictionary[lang].lessons.quickTestSection;

    const [animatedWpm, setAnimatedWpm] = useState(0);
    const [animatedAcc, setAnimatedAcc] = useState(0);

    // Number animation
    useEffect(() => {
        if (isProcessing) return; // Don't animate until we have final numbers
        const duration = 1200;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setAnimatedWpm(Math.round(wpm * easeProgress));
            setAnimatedAcc(Math.round(accuracy * easeProgress));

            if (currentStep >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, [wpm, accuracy, isProcessing]);

    const wpmStrokeDashoffset = circleCircumference - ((Math.min(wpm, 100) / 100) * circleCircumference);
    const accStrokeDashoffset = circleCircumference - ((accuracy / 100) * circleCircumference);
    const timeStrokeDashoffset = circleCircumference - (0.6 * circleCircumference); // Static visual ring for time

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 font-sans relative">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center border-2 border-indigo-500/20 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 to-transparent pointer-events-none" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="mb-4"
                    >
                        <RefreshCw className="w-12 h-12 text-indigo-500" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-slate-800 animate-pulse">{t.loading || "รอสักครู่..."}</h2>
                    <p className="text-slate-500 font-medium mt-1">{t.processingDesc || "กำลังบันทึกคะแนนของคุณ (Synchronizing Statistics)"}</p>
                </div>
            )}

            {/* Header Banner - Premium Animated */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group"
            >
                {/* Glowing Background FX */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 transition-transform duration-1000 group-hover:translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4" />

                <div className="z-10 relative flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`inline-flex items-center gap-1.5 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-sm ${isPassed ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20'}`}
                    >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {isPractice ? t.complete_status : (isPassed ? t.complete : t.not_completed)}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight"
                    >
                        {isPassed ? t.excellent : t.failed}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-500 font-bold text-lg mt-2 flex items-center gap-2"
                    >
                        {isPassed ? (
                            isPractice ? (
                                <span className="text-indigo-600">{tExam.freeType}</span>
                            ) : (
                                <>{tExam.test} {examId}: <span className="text-indigo-600">{examTitle}</span></>
                            )
                        ) : (
                            <span className="text-rose-500">{errorDetail || t.wpmLow}</span>
                        )}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="z-10 hidden md:flex items-center justify-center p-6 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-full scale-150 blur-xl opacity-50" />
                    <Trophy className="w-24 h-24 text-indigo-500 fill-indigo-100 drop-shadow-sm" strokeWidth={1} />
                </motion.div>
            </motion.div>

            {/* Metrics Row - Staggered entrance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: t.wpm, value: animatedWpm, unit: t.wpm_unit, offset: wpmStrokeDashoffset, color: '#6366f1', delay: 0.5 },
                    { label: t.accuracy, value: `${animatedAcc}%`, unit: t.acc_unit, offset: accStrokeDashoffset, color: '#10b981', delay: 0.6 },
                    { label: t.timeTaken, value: formatTime(timeTaken), unit: t.min_unit, offset: timeStrokeDashoffset, color: '#f59e0b', delay: 0.7 }
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: metric.delay, ease: "easeOut" }}
                        className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center group hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
                    >
                        <div className="relative w-36 h-36 flex items-center justify-center mb-5">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="#f8fafc" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r={circleRadius}
                                    fill="none"
                                    stroke={metric.color}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circleCircumference}
                                    initial={{ strokeDashoffset: circleCircumference }}
                                    animate={{ strokeDashoffset: metric.offset }}
                                    transition={{ duration: 1.5, delay: metric.delay + 0.2, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center scale-110 group-hover:scale-125 transition-transform duration-500 ease-out">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{metric.value}</span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-2 uppercase">{metric.unit}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-600 text-lg">{metric.label}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Achievement / Certificate Banner */}
            {!isPractice && isPassed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl p-[2px] shadow-lg shadow-amber-500/20 mt-2 bg-[length:200%_auto] animate-gradient"
                >
                    <div className="bg-white rounded-[14px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-100 p-3 rounded-xl shrink-0">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-xl">{tExam.certificateUnlocked}</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{tExam.certificateDesc.replace('{examId}', examId.toString())}</p>
                            </div>
                        </div>
                        <button
                            onClick={onCertificate}
                            className="w-full md:w-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {tExam.printCertificate} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex justify-between items-center mt-2 border-t border-slate-200 pt-6"
            >
                <button
                    onClick={onRestart}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                    {t.restart}
                </button>
                <button
                    onClick={onContinue}
                    className="bg-slate-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                    {t.goBack || t.continue} <ChevronRight className="w-5 h-5" />
                </button>
            </motion.div>

        </div>
    );
}
