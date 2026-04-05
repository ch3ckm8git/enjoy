'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { dictionary, Lang } from '@/lib/i18n';
import { Sidebar } from '@/components/ui/lesson_ui/sidebar';
import { GraduationCap, Menu, TrendingUp, Clock, Target, Zap } from 'lucide-react';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Loading from '@/app/[lang]/loading';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        const wpmPayload = payload.find((p: any) => p.dataKey === 'wpm');
        const accPayload = payload.find((p: any) => p.dataKey === 'accuracy');

        let title = data.dateStr;
        if (data.type === 'lesson' && data.unitId !== undefined && data.subId !== undefined) {
            title = `${title} • Lesson ${data.unitId}.${data.subId}`;
        } else if (data.type === 'exam' && data.examId !== undefined) {
            title = `${title} • Exam ${data.examId}`;
        } else if (data.type === 'free') {
            title = `${title} • Free Type`;
        }

        return (
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
                <p className="text-sm font-semibold text-slate-500 mb-2 pb-2 border-b border-slate-100">{title}</p>
                {wpmPayload && (
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: wpmPayload.color }}></div>
                        <span className="font-medium text-slate-700">{wpmPayload.name}: </span>
                        <span className="font-bold text-lg leading-none" style={{ color: wpmPayload.color }}>{wpmPayload.value}</span>
                    </div>
                )}
                {accPayload && (
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accPayload.color }}></div>
                        <span className="font-medium text-slate-700">{accPayload.name}: </span>
                        <span className="font-bold text-lg leading-none" style={{ color: accPayload.color }}>{accPayload.value}</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    let label = '';
    if (payload.type === 'lesson' && payload.unitId !== undefined && payload.subId !== undefined) {
        label = `${payload.unitId}.${payload.subId}`;
    } else if (payload.type === 'exam' && payload.examId !== undefined) {
        label = `E${payload.examId}`;
    } else if (payload.type === 'free') {
        label = `F`;
    }

    return (
        <g>
            <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#6366f1" strokeWidth={2} />
            {label && (
                <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="#6366f1"
                    fontFamily="sans-serif"
                >
                    {label}
                </text>
            )}
        </g>
    );
};

export default function PerformancePage() {
    const pathname = usePathname();
    const lang = pathname.split('/')[1] as Lang;
    const t = dictionary[lang];
    const { user } = useAuth();

    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchHistory = async () => {
            try {
                const historyRef = collection(db, 'users', user.uid, 'typingHistory');
                const q = query(historyRef, orderBy('createdAt', 'desc'), limit(30));
                const querySnapshot = await getDocs(q);

                const data: any[] = [];
                querySnapshot.forEach((doc) => {
                    const d = doc.data();
                    if (d.createdAt) {
                        data.push({
                            id: doc.id,
                            wpm: d.wpm,
                            accuracy: d.accuracy,
                            timeTaken: d.timeTaken,
                            dateStr: d.createdAt.toDate ? d.createdAt.toDate().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(d.createdAt).toLocaleDateString(),
                            timestamp: d.createdAt.toDate ? d.createdAt.toDate().getTime() : new Date(d.createdAt).getTime(),
                            type: d.type,
                            unitId: d.unitId,
                            subId: d.subId,
                            examId: d.examId
                        });
                    }
                });

                // Sort ascending by timestamp so oldest is left, newest is right
                data.sort((a, b) => a.timestamp - b.timestamp);
                setHistoryData(data);
            } catch (error) {
                console.error("Error fetching typing history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user, lang]);

    if (isLoading) {
        return <Loading />;
    }

    const averageWpm = historyData.length ? Math.round(historyData.reduce((acc, curr) => acc + curr.wpm, 0) / historyData.length) : 0;
    const averageAcc = historyData.length ? Math.round(historyData.reduce((acc, curr) => acc + curr.accuracy, 0) / historyData.length) : 0;
    const maxWpm = historyData.length ? Math.max(...historyData.map(d => d.wpm)) : 0;

    return (
        <ProtectedRoute lang={lang}>
            <div className="flex h-screen bg-slate-50 font-sans">
                <Sidebar lang={lang} />
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                            <span className="font-bold text-slate-900 font-display">EnjoyTyping</span>
                        </div>
                        <button className="text-slate-500 hover:text-slate-900">
                            <Menu className="w-6 h-6" />
                        </button>
                    </header>

                    {/* Animated Background Mesh */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-300/40 blur-[100px] mix-blend-multiply animate-blob" />
                        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-300/40 blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
                        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-sky-300/40 blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full">
                        <div className="max-w-6xl mx-auto space-y-8 mt-4">

                            {/* Page Title */}
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm border border-indigo-200">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight mt-1">{lang === 'th' ? 'ผลงาน' : 'Performance'}</h1>
                                    <p className="text-slate-500 mt-1 font-medium">{lang === 'th' ? 'ติดตามความเร็วและความแม่นยำในการพิมพ์ของคุณ' : 'Track your typing speed and accuracy over time.'}</p>
                                </div>
                            </div>

                            {/* Stats Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 border border-sky-100">
                                            <Zap className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{lang === 'th' ? 'WPM เฉลี่ย' : 'Average WPM'}</div>
                                            <div className="text-3xl font-black text-slate-800">{averageWpm} <span className="text-sm font-medium text-slate-500">WPM</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                                            <Target className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{lang === 'th' ? 'ความแม่นยำเฉลี่ย' : 'Average Accuracy'}</div>
                                            <div className="text-3xl font-black text-slate-800">{averageAcc}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
                                            <TrendingUp className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{lang === 'th' ? 'ความเร็วสูงสุด' : 'Max Speed'}</div>
                                            <div className="text-3xl font-black text-slate-800">{maxWpm} <span className="text-sm font-medium text-slate-500">WPM</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl p-6 md:p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 font-display">{lang === 'th' ? 'การฝึกพิมพ์ล่าสุด (30 รอบ)' : 'Recent Sessions (Last 30)'}</h3>

                                {historyData.length === 0 ? (
                                    <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                                        <Clock className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="font-medium text-lg">{lang === 'th' ? 'ยังไม่มีประวัติการฝึกพิมพ์' : 'No typing history yet.'}</p>
                                        <p className="text-sm opacity-70 mt-1">{lang === 'th' ? 'ทำแบบฝึกหัดให้จบเพื่อดูผลงานของคุณที่นี่!' : 'Complete some lessons to see your progress here!'}</p>
                                    </div>
                                ) : (
                                    <div className="h-80 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={historyData} margin={{ top: 28, right: 20, bottom: 5, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={11} tickMargin={12} minTickGap={30} />
                                                <YAxis yAxisId="left" stroke="#6366f1" fontSize={11} domain={['dataMin - 5', 'dataMax + 10']} axisLine={false} tickLine={false} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    isAnimationActive={false}
                                                    position={{ y: 0 }}
                                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                                <Line yAxisId="left" type="monotone" dataKey="wpm" name="Speed (WPM)" stroke="#6366f1" strokeWidth={3} dot={<CustomDot />} activeDot={{ r: 7, strokeWidth: 0, fill: '#4f46e5' }} />
                                                <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#059669' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
