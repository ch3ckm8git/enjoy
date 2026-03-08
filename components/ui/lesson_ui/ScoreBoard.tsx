import { Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dictionary, Lang } from '@/lib/i18n';

interface ScoreBoardProps {
    wpm: number;
    accuracy: number;
    timeTaken: number; // in seconds
    lessonTitle: string;
    unitId?: number;
    currentSubUnit: number;
    totalSubUnits: number;
    subUnitData: any[]; // New prop for all subunits in this unit
    onRestart: () => void;
    onContinue: () => void;
    onNavigate: (subId: number) => void;
    lang: Lang;
}

export function ScoreBoard({
    wpm,
    accuracy,
    timeTaken,
    lessonTitle,
    unitId,
    currentSubUnit,
    totalSubUnits,
    subUnitData,
    onRestart,
    onContinue,
    onNavigate,
    lang
}: ScoreBoardProps) {
    const t = (dictionary[lang] as any).lessons.scoreboard;
    const [animatedWpm, setAnimatedWpm] = useState(0);
    const [animatedAcc, setAnimatedAcc] = useState(0);

    useEffect(() => {
        // simple number count up animation
        const duration = 1000;
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // easeOut function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setAnimatedWpm(Math.round(wpm * easeProgress));
            setAnimatedAcc(Math.round(accuracy * easeProgress));

            if (currentStep >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, [wpm, accuracy]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // SVG Circle Progress logic
    const circleRadius = 45;
    const circleCircumference = 2 * Math.PI * circleRadius;

    const wpmStrokeDashoffset = circleCircumference - ((Math.min(wpm, 100) / 100) * circleCircumference);
    const accStrokeDashoffset = circleCircumference - ((accuracy / 100) * circleCircumference);
    // Time doesn't really have a "max" out of 100 to map to a circle easily,
    // We'll just set it to a fixed 60% visually similar to the reference image or based on max allowed time.
    const timeStrokeDashoffset = circleCircumference - (0.6 * circleCircumference);

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 font-sans">

            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden">
                {/* Subtle background glow/gradient (optional) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4" />

                <div className="z-10 relative">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold mb-4">
                        <Trophy className="w-4 h-4" /> {t.complete}
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t.excellent}</h1>
                    <p className="text-slate-500 font-bold text-lg mt-1">{t.summary}</p>
                </div>

                <div className="z-10 bg-sky-50 p-6 rounded-full">
                    <Trophy className="w-16 h-16 text-sky-200 fill-sky-200" strokeWidth={1.5} />
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* WPM Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            {/* Progress circle */}
                            <circle
                                cx="50" cy="50" r={circleRadius}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={wpmStrokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-800">{animatedWpm}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">{t.wpm_unit}</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-600">{t.wpm}</h3>
                </div>

                {/* Accuracy Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r={circleRadius}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={accStrokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-800">{animatedAcc}%</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">{t.acc_unit}</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-600">{t.accuracy}</h3>
                </div>

                {/* Time Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r={circleRadius}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={timeStrokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-800">{formatTime(timeTaken)}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">{t.min_unit}</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-600">{t.timeTaken}</h3>
                </div>

            </div>

            {/* Progress Footer */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">{t.progress}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">{lessonTitle}</p>
                    </div>
                    <div className="bg-sky-50 text-sky-600 px-3 py-1 font-bold text-sm rounded-full border border-sky-100">
                        {subUnitData?.filter(s => s.isFinished).length} / {totalSubUnits} {t.complete_status}
                    </div>
                </div>

                {/* Horizontal Progress Stepper */}
                <div className="flex gap-2 items-center w-full">
                    {Array.from({ length: totalSubUnits }).map((_, idx) => {
                        const isCurrent = idx === currentSubUnit - 1;

                        // Find data for this subunit
                        const data = subUnitData?.find((s: any) => s.subId === idx + 1);
                        const hasData = data && data.isFinished;

                        return (
                            <button
                                key={idx}
                                onClick={() => onNavigate(idx + 1)}
                                className="relative group/tt h-2.5 flex-1 cursor-pointer"
                            >
                                {/* Visual Bar - isolates scale-y from tooltip */}
                                <div className={`h-full w-full rounded-full transition-all duration-300 origin-bottom group-hover/tt:scale-y-125 ${isCurrent ? 'bg-emerald-500 ring-2 ring-emerald-500 ring-offset-2' : (hasData ? 'bg-blue-500' : 'bg-slate-200')
                                    }`} />

                                {/* Tooltip */}
                                <div className="absolute opacity-0 group-hover/tt:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap z-50 pointer-events-none shadow-lg flex flex-col items-start font-mono leading-normal">
                                    <div className="font-bold mb-1 border-b border-slate-600 pb-1 self-stretch text-left">{unitId ? `${unitId}.` : ''}{idx + 1}</div>
                                    {hasData ? (
                                        <div className="flex flex-col gap-0.5 mt-1 text-left">
                                            <span>{t.wpm_unit}: <span className="text-blue-300">{data.wpm}</span></span>
                                            <span>{t.accuracy}: <span className="text-emerald-300">{data.accuracy}%</span></span>
                                            <span>{t.time_label}: <span className="text-amber-300">{formatTime(data.time)}</span></span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic mt-1 text-left">{t.not_completed}</div>
                                    )}
                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-4 mt-4">
                <button
                    onClick={onRestart}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all active:scale-95"
                    title={t.restart}
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
                <button
                    onClick={onContinue}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                    {t.continue} <ArrowRight className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
}
