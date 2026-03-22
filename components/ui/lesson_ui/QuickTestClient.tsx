"use client";

import { useEffect, useState } from 'react';
import { UserProfileCard } from '@/components/ui/lesson_ui/user-profile-card';
import { StatCard } from '@/components/ui/lesson_ui/stat-card';
import { QuickTestSection } from '@/components/ui/lesson_ui/quick-test-section';
import { Menu, GraduationCap } from 'lucide-react';
import { calculateLevelAndProgress } from '@/lib/level-system';
import { dictionary, Lang } from "@/lib/i18n";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function QuickTestClient({ lang }: { lang: Lang }) {
    const t = dictionary[lang];
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [lessonData, setLessonData] = useState<any>(null);
    const [examData, setExamData] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const lessonRef = doc(db, "lessons", user.uid);
                const examRef = doc(db, "exams", user.uid);

                const [userSnap, lessonSnap, examSnap] = await Promise.all([
                    getDoc(userRef),
                    getDoc(lessonRef),
                    getDoc(examRef)
                ]);

                if (userSnap.exists()) setUserData(userSnap.data());
                if (lessonSnap.exists()) setLessonData(lessonSnap.data());
                if (examSnap.exists()) setExamData(examSnap.data());
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading || !userData || !lessonData || !examData) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Calculate actual progress from fetched lessonData
    const totalSubUnits = lessonData.units.reduce((acc: number, unit: any) => acc + unit.subUnits.length, 0);
    const finishedSubUnits = lessonData.units.reduce((acc: number, unit: any) => acc + unit.subUnits.filter((su: any) => su.isFinished).length, 0);
    const lessonsProgressPercent = Math.round((finishedSubUnits / totalSubUnits) * 100) || 0;

    const totalExams = examData.milestoneExams.length;
    const finishedExams = examData.milestoneExams.filter((ex: any) => ex.isFinished).length;
    const examsProgressPercent = totalExams > 0 ? Math.round((finishedExams / totalExams) * 100) : 0;

    let totalLearningTimeMin = (userData.stats.totalLearningTime || 0) / 60;
    lessonData.units.forEach((unit: any) => {
        unit.subUnits.forEach((su: any) => {
            if (su.isFinished) totalLearningTimeMin += (su.time || 0) / 60;
        });
    });

    const timeHours = Math.floor(totalLearningTimeMin / 60);
    const timeMins = Math.floor(totalLearningTimeMin % 60);

    // User Stats (XP and Level)
    const userXp = userData.stats.exp || 0;
    const { level, currentXp, maxXp, progressPercentage } = calculateLevelAndProgress(userXp);

    return (
        <>
            <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                    <span className="font-bold text-slate-900 font-display">EnjoyTyping</span>
                </div>
                <button className="text-slate-500 hover:text-slate-900">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User Profile */}
                        <div className="lg:col-span-1">
                            <UserProfileCard
                                name={userData.username}
                                level={level}
                                currentXp={currentXp}
                                maxXp={maxXp}
                                progressPercentage={progressPercentage}
                                lessonsProgress={lessonsProgressPercent}
                                examsProgress={examsProgressPercent}
                                lang={lang as Lang}
                                imgUrl={user?.photoURL}
                            />
                        </div>

                        {/* Stats & Banner */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 content-evenly">
                            <StatCard
                                title={t.lessons.dailyStreak}
                                value={"0" + " " + t.lessons.days}
                                icon="fire"
                                color="orange"
                            />
                            <StatCard
                                title={t.lessons.learningTime}
                                icon="timer"
                                color="blue"
                                value={`${timeHours} ${t.lessons.hours} ${timeMins} ${t.lessons.mins}`}
                            />
                            <StatCard
                                title={t.lessons.certificates}
                                value={`${userData.earnedCertificates ? Object.values(userData.earnedCertificates).filter(Boolean).length : 0} ${t.lessons.earned}`}
                                icon="verified"
                                color="purple"
                            />

                            {/* Wide XP Progress Bar */}
                            <div className="md:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center mt-2 group hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.lessons.levelProgress}</span>
                                        <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm">
                                            {t.lessons.level} {level}
                                        </span>
                                    </div>
                                    <span className="text-sm text-indigo-700 font-bold font-mono bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 shadow-sm">
                                        {currentXp} / {maxXp} XP
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner my-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)] bg-[length:200%_auto] animate-gradient"
                                    >
                                        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-slate-400 font-medium">
                                        {progressPercentage.toFixed(0)}% {t.lessons.completed}
                                    </p>
                                    <p className="text-right text-xs text-indigo-600 font-bold">
                                        {maxXp - currentXp} {t.lessons.xpToLevel} {level + 1}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Test Section */}
                    <QuickTestSection lang={lang} userLessonData={lessonData} userData={userData} userExams={examData} />

                    <footer className="flex flex-col md:flex-row justify-between items-center py-6 text-slate-400 text-sm font-medium border-t border-slate-200 mt-8">
                        <p>© {new Date().getFullYear()} EnjoyTyping. {t.lessons.footerRights}</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link href={`/${lang}/help`} className="hover:text-indigo-600 transition-colors">{t.lessons.helpCenter}</Link>
                            <Link href={`/${lang}/privacy`} className="hover:text-indigo-600 transition-colors">{t.lessons.privacyPolicy}</Link>
                            <Link href={`/${lang}/terms`} className="hover:text-indigo-600 transition-colors">{t.lessons.terms}</Link>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
