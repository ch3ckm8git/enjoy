import { UserProfileCard } from '@/components/ui/lesson_ui/user-profile-card';
import { StatCard } from '@/components/ui/lesson_ui/stat-card';
import { QuickTestSection } from '@/components/ui/lesson_ui/quick-test-section';
import { Menu, GraduationCap } from 'lucide-react';
import { calculateLevelAndProgress } from '@/lib/level-system';
import { dictionary, isLang, Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from 'next/link';
import userLessonData from '@/data/json/lesson.json';
import userExams from '@/data/json/exam.json';
import userStats from '@/data/json/user.json';

export default async function QuickTestPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang: raw } = await params;
    if (!isLang(raw)) notFound();

    const lang: Lang = raw;
    const t = dictionary[lang];

    // Calculate actual progress from lesson.json
    const totalSubUnits = userLessonData.units.reduce((acc, unit) => acc + unit.subUnits.length, 0);
    const finishedSubUnits = userLessonData.units.reduce((acc, unit) => acc + unit.subUnits.filter(su => su.isFinished).length, 0);
    const lessonsProgressPercent = Math.round((finishedSubUnits / totalSubUnits) * 100) || 0;

    const totalExams = userExams.milestoneExams.length;
    const finishedExams = userExams.milestoneExams.filter(ex => ex.isFinished).length;
    const examsProgressPercent = totalExams > 0 ? Math.round((finishedExams / totalExams) * 100) : 0;

    let totalLearningTimeMin = (userStats.stats.totalLearningTime || 0) / 60;
    userLessonData.units.forEach(unit => {
        unit.subUnits.forEach(su => {
            if (su.isFinished) totalLearningTimeMin += (su.time || 0) / 60;
        });
    });

    const timeHours = Math.floor(totalLearningTimeMin / 60);
    const timeMins = Math.floor(totalLearningTimeMin % 60);

    // User Stats (XP and Level)
    const userXp = userStats.stats.exp || 0;
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
                                name={userStats.username}
                                level={level}
                                currentXp={currentXp}
                                maxXp={maxXp}
                                progressPercentage={progressPercentage}
                                lessonsProgress={lessonsProgressPercent}
                                examsProgress={examsProgressPercent}
                                lang={lang as Lang}
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
                                value={`${userStats.earnedCertificates ? Object.values(userStats.earnedCertificates).filter(Boolean).length : 0} ${t.lessons.earned}`}
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
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-1000 bg-[length:200%_auto] animate-gradient"
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                    </div>
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
                    <QuickTestSection lang={lang} />

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
