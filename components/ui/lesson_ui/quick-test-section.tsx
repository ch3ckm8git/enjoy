"use client";

import { useState } from 'react';
import { dictionary, Lang } from '@/lib/i18n';
import quickTestData from '@/data/json/quick_test.json';
import { ArrowRight, Lock, Play } from 'lucide-react';
import Link from 'next/link';

export function QuickTestSection({ lang, userLessonData, userData, userExams }: { lang: Lang, userLessonData: any, userData: any, userExams: any }) {
    const t = dictionary[lang].lessons.quickTestSection;

    const [showTimeSelect, setShowTimeSelect] = useState(false);

    // Helper function to calculate if a range of units is completed
    const isRangeFinished = (startUnit: number, endUnit: number) => {
        const rangeUnits = userLessonData.units.filter((u: any) => u.unitId >= startUnit && u.unitId <= endUnit);
        const totalSubUnits = rangeUnits.reduce((acc: number, u: any) => acc + u.subUnits.length, 0);
        const finishedSubUnits = rangeUnits.reduce((acc: number, u: any) => acc + u.subUnits.filter((su: any) => su.isFinished).length, 0);
        return {
            isUnlocked: (totalSubUnits > 0 && finishedSubUnits >= totalSubUnits),
            totalNeeded: totalSubUnits,
            finished: finishedSubUnits
        };
    };

    const testConfig = [
        {
            id: "exam_1_pool",
            range: [1, 6] as [number, number],
            data: quickTestData.exam_1_pool
        },
        {
            id: "exam_2_pool",
            range: [7, 12] as [number, number],
            data: quickTestData.exam_2_pool
        },
        {
            id: "exam_3_pool",
            range: [1, 17] as [number, number],
            data: quickTestData.exam_3_pool
        }
    ];

    return (
        <div className="space-y-6 mt-8">


            {/* Free Type / Practice Section */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden flex flex-col transition-colors hover:border-blue-300">
                <div className="p-6 border-b border-blue-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-blue-50/30">
                    <div>
                        <div className="inline-flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900 font-display font-sarabun tracking-wide">
                                {t.freeType || "Free Type"}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1 font-medium max-w-lg">
                            {t.freeTypeDesc || "Practice typing freely. Scores are not saved, only learning time is accumulated."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-blue-100 shadow-sm shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                            <Play className="w-5 h-5 ml-1" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white flex justify-end gap-3 transition-all">
                    {showTimeSelect ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 flex-wrap justify-end">
                            <span className="text-sm font-bold text-slate-500 mr-2">{t.selectTime || "Select Time"}:</span>
                            {[15, 30, 45, 60, 120].map(time => {
                                const xpReward = time === 15 ? 12.5 : time === 30 ? 25 : time === 45 ? 37.5 : time === 60 ? 50 : 100;
                                return (
                                    <Link
                                        key={time}
                                        href={`/${lang}/quick_test/free?time=${time}`}
                                        className="relative bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-blue-200 transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center min-w-[70px]"
                                    >
                                        <span>{time}s</span>
                                        <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                            +{xpReward} XP
                                        </span>
                                    </Link>
                                )
                            })}
                            <button
                                onClick={() => setShowTimeSelect(false)}
                                className="ml-2 text-slate-400 hover:text-slate-600 p-2"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowTimeSelect(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            {t.startTest} <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {testConfig.map((test, index) => {
                const { isUnlocked, totalNeeded, finished } = isRangeFinished(test.range[0], test.range[1]);
                const testTitle = (lang === 'en' && test.data.title2) ? test.data.title2 : test.data.title;
                const examObj = userExams.milestoneExams.find((e: any) => e.examId === index + 1);
                const isExamFinished = examObj?.isFinished || false;

                return (
                    <div key={test.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-colors ${isUnlocked ? 'hover:border-indigo-200' : 'opacity-80 grayscale-[30%]'}`}>

                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
                            <div>
                                <div className="inline-flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-900 font-display font-sarabun tracking-wide">
                                        {t.test} {index + 1}:
                                    </span>
                                    <h2 className="text-xl font-bold text-indigo-700 font-display font-sarabun tracking-wide">
                                        {testTitle}
                                    </h2>
                                </div>
                                {!isUnlocked && (
                                    <p className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1.5">
                                        <Lock className="w-4 h-4" />
                                        {t.completeXToUnlock
                                            .replace('{start}', test.range[0].toString())
                                            .replace('{end}', test.range[1].toString())
                                            .replace('{finished}', finished.toString())
                                            .replace('{total}', totalNeeded.toString())}
                                    </p>
                                )}
                                {isUnlocked && !isExamFinished && (
                                    <p className="text-emerald-500 text-sm mt-1 font-medium flex items-center gap-1.5 flex-wrap">
                                        <Play className="w-4 h-4" />
                                        <span>{dictionary[lang].lessons.courseSection.module} {test.range[0]}-{test.range[1]}</span>
                                        <span className="text-slate-400 font-normal">{t.completeForCertificate}</span>
                                    </p>
                                )}
                                {isExamFinished && (
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Best WPM</span>
                                            <span className="text-lg font-black text-blue-700 leading-none">{examObj?.wpm}</span>
                                        </div>
                                        <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Accuracy</span>
                                            <span className="text-lg font-black text-emerald-700 leading-none">{examObj?.accuracy}%</span>
                                        </div>
                                        <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Time</span>
                                            <span className="text-lg font-black text-amber-700 leading-none">{examObj?.time}s</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Icon */}
                            <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExamFinished ? 'bg-amber-100 text-amber-500' : isUnlocked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {isExamFinished ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : isUnlocked ? <Play className="w-5 h-5 ml-1" /> : <Lock className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="p-6 bg-white flex justify-end gap-3">
                            {!isUnlocked ? (
                                <button disabled className="bg-slate-200 text-slate-400 font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 min-w-[160px] cursor-not-allowed">
                                    {t.locked} <Lock className="w-5 h-5" />
                                </button>
                            ) : isExamFinished ? (
                                <>
                                    {userData.earnedCertificates?.[`exam_${index + 1}` as keyof typeof userData.earnedCertificates] ? (
                                        <button onClick={() => alert("Certificate Modal Coming Soon!")} className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-6 py-3.5 rounded-xl border border-amber-300 flex items-center justify-center gap-2 transition-all shadow-sm">
                                            {t.printCertificate}
                                        </button>
                                    ) : (
                                        <button disabled className="bg-amber-50 text-amber-600/50 font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed">
                                            {t.certificateSoon}
                                        </button>
                                    )}
                                    <Link href={`/${lang}/quick_test/${index + 1}`} className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold px-8 py-3.5 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[160px]">
                                        {t.review}
                                    </Link>
                                </>
                            ) : (
                                <Link href={`/${lang}/quick_test/${index + 1}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[160px]">
                                    {t.startTest} <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
