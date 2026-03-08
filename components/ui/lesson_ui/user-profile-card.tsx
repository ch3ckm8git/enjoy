import Image from 'next/image';
import { Trophy, BookOpen, HelpCircle } from 'lucide-react';
import { getRankTag } from '@/lib/level-system';
import { dictionary, Lang } from '@/lib/i18n';

interface UserProfileCardProps {
  name: string;
  level: number;
  currentXp: number;
  maxXp: number;
  progressPercentage: number;
  lessonsProgress: number;
  examsProgress: number;
  lang?: any;
}

export function UserProfileCard({
  name,
  level,
  currentXp,
  maxXp,
  progressPercentage,
  lessonsProgress,
  examsProgress,
  lang = "en",
}: UserProfileCardProps) {

  const langData = dictionary[lang as Lang];
  const rankTag = getRankTag(level, langData);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Trophy className="w-32 h-32 text-indigo-600" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mb-6">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-600 to-purple-500 mb-3 shadow-md relative transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <Image
            src="https://picsum.photos/200/200"
            alt="Student profile picture"
            fill
            className="rounded-full object-cover border-4 border-white"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">{name}</h2>
        <p className="text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1 rounded-full mt-2 border border-indigo-100">
          Lv. {level} {rankTag}
        </p>
      </div>

      <div className="space-y-4 relative z-10">


        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span className="text-xs text-slate-500 font-bold">Lessons</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${lessonsProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-500 font-bold">Exams</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${examsProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
