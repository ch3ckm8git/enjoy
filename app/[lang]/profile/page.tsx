'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { dictionary, Lang } from '@/lib/i18n';
import { calculateLevelAndProgress } from '@/lib/level-system';
import { Sidebar } from '@/components/ui/lesson_ui/sidebar';
import { GraduationCap, Menu, Mail, User, Edit2, Check, X, Camera, Calendar } from 'lucide-react';
import userStats from '@/data/json/user.json';
import Image from 'next/image';

export default function ProfilePage() {
    const pathname = usePathname();
    const lang = pathname.split('/')[1] as Lang;
    const t = dictionary[lang]?.profile || dictionary['en'].profile;

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(userStats.username);
    const [tempUsername, setTempUsername] = useState(userStats.username);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { level, currentXp, maxXp, progressPercentage } = calculateLevelAndProgress(userStats.stats.exp || 0);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!tempUsername.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: tempUsername })
            });
            if (res.ok) {
                setUsername(tempUsername);
                setIsEditing(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempUsername(username);
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
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
                    <div className="max-w-4xl mx-auto space-y-8 mt-4">

                        {/* Page Title */}
                        {/* <div>
                            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">{t.title}</h1>
                            <p className="text-slate-500 mt-1">Manage your personal information and progress.</p>
                        </div> */}

                        {/* Profile Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative">

                            {/* Stylish Banner */}
                            <div className="h-30 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                            </div>

                            <div className="px-8 pb-8">
                                {/* Avatar and Edit Button Row */}
                                <div className="flex justify-between items-end -mt-16 mb-6">
                                    <div className="relative group/avatar">
                                        <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 relative z-10 transform transition-transform group-hover/avatar:scale-105">
                                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative flex items-center justify-center border border-slate-200/50">
                                                {userStats.imgUrl && userStats.imgUrl !== 'url_to_image' ? (
                                                    <Image src={userStats.imgUrl} alt={username} fill className="object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-slate-400" />
                                                )}
                                            </div>
                                            <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all opacity-0 group-hover/avatar:opacity-100">
                                                <Camera className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" /> {t.edit}
                                        </button>
                                    )}
                                </div>

                                {/* User Info Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                                    {/* Username Field */}
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.username}</label>
                                        {isEditing ? (
                                            <div className="relative flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <div className="relative flex-1">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={tempUsername}
                                                        onChange={(e) => setTempUsername(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-indigo-200 focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10"
                                                        placeholder="Enter username"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 flex-shrink-0"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-transparent group-hover:bg-slate-50 relative group">
                                                <User className="w-5 h-5 text-slate-400" />
                                                <span className="font-semibold text-slate-900 text-lg w-full truncate">{username}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field (Static) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.email}</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-transparent">
                                            <Mail className="w-5 h-5 text-slate-400" />
                                            <span className="font-medium text-slate-600 text-lg">{userStats.email}</span>
                                        </div>
                                    </div>

                                    {/* Join Date Field (Static) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.joinDate}</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-transparent">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <span className="font-medium text-slate-600 text-lg">{formatDate(userStats.lastActiveDate)}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Level & Stats Widget */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">{t.xpProgress}</h3>

                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0 shadow-inner">
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{t.level}</span>
                                        <span className="text-3xl font-black text-indigo-600 font-display">{level}</span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-sm font-bold text-slate-600">Current Progress</span>
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
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
