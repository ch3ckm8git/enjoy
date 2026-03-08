


import { dictionary, Lang } from '@/lib/i18n';
import userLessonData from '@/data/json/lesson.json';
import lessonsData from '@/data/json/output_reindexed_with_test.json';
import { ArrowRight, Check, Percent, Play } from 'lucide-react';
import Link from 'next/link';

export function CourseSection({ lang }: { lang: Lang }) {
  const t = dictionary[lang].lessons.courseSection;
  const units = userLessonData.units;
  const lessons = lessonsData as any;

  return (
    <div className="space-y-6 mt-8">
      {units.map((unitData, unitIndex) => {
        const unitInfo = lessons[`unit_${unitData.unitId}`];
        const rawTitle = unitInfo?.title || `Unit ${unitData.unitId}`;
        let title2 = unitInfo?.title2

        const unitTitle = (lang === 'en' && title2) ? title2 : rawTitle;

        const completedCount = unitData.subUnits.filter(su => su.isFinished).length;
        const totalCount = unitData.subUnits.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <div key={unitData.unitId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-200 transition-colors">

            {/* Unit Header */}
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
              <div>
                <div className="inline-flex items-center">
                  {lang === 'en' && (
                    <h2 className="text-xl font-bold text-slate-900 font-display font-sarabun tracking-wide">
                      Lesson
                    </h2>
                  )}
                  <h2 className="text-xl font-bold text-slate-900 font-display font-sarabun tracking-wide">
                    {unitTitle}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm mt-1 font-medium">{t.module} {unitData.unitId}</p>
              </div>

              <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div className="flex flex-col w-40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      {t.progress}
                    </span>
                    <span className="text-[10px] font-bold text-sky-500">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subunits List */}
            <div className="p-4 bg-white space-y-3">
              {unitData.subUnits.map((sub, idx) => {
                const isFinished = sub.isFinished;
                // Find ONLY the absolute first unfinished item to be the current lesson
                const firstUnfinishedIdx = unitData.subUnits.findIndex(su => !su.isFinished);
                const isCurrent = idx === firstUnfinishedIdx;

                const subUnitTitles = (dictionary[lang].lessons as any).sub_unit_title;
                const unitKey = `unit_${unitData.unitId}`;
                const subKey = `${unitData.unitId}.${sub.subId}`;
                const subTitle = subUnitTitles?.[unitKey]?.[subKey] || `${unitData.unitId}.${sub.subId} ${t.lessonDrill}`;

                if (isCurrent) {
                  return (
                    <div key={sub.subId} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl bg-white border border-indigo-200 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                      <div className="flex items-center gap-4 mb-4 md:mb-0 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-50">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                              {t.currentLesson}
                            </span>
                          </div>
                          <h4 className="text-slate-900 text-lg font-bold font-display leading-tight">
                            {subTitle}
                          </h4>
                        </div>
                      </div>
                      <Link href={`/${lang}/lessons/${unitData.unitId}.${sub.subId}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[160px]">
                        {t.startLesson} <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  );
                }

                return (
                  <div key={sub.subId} className={`group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all ${!isFinished && !isCurrent ? 'bg-slate-50 opacity-75' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isFinished ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>
                        {isFinished ? <Check className="w-5 h-5" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </div>
                      <div>
                        <h4 className={`font-bold ${isFinished ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-700'}`}>
                          {subTitle}
                        </h4>
                        {isFinished && <p className="text-slate-400 text-sm font-medium">{t.bestWpm}: {sub.wpm} | {t.accuracy}: {sub.accuracy}%</p>}
                      </div>
                    </div>
                    <Link href={`/${lang}/lessons/${unitData.unitId}.${sub.subId}`} className="text-slate-500 hover:text-indigo-600 px-4 py-2 text-sm font-bold bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                      {isFinished ? t.review : t.start}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Segmented Progress Bar Line */}
            <div className="w-full flex h-2 gap-[1px]">
              {unitData.subUnits.map((su) => {
                const isFinished = su.isFinished;
                const timeSec = su.time || 0;
                const timeFormatted = `${Math.floor(timeSec / 60)}:${((timeSec || 0) % 60).toString().padStart(2, '0')}`;

                const subUnitTitles = (dictionary[lang].lessons as any).sub_unit_title;
                const unitKey = `unit_${unitData.unitId}`;
                const subKey = `${unitData.unitId}.${su.subId}`;
                const subTitle = subUnitTitles?.[unitKey]?.[subKey] || `${unitData.unitId}.${su.subId}`;

                return (
                  <Link
                    key={su.subId}
                    href={`/${lang}/lessons/${unitData.unitId}.${su.subId}`}
                    className="relative group/tt h-full flex-1 cursor-pointer"
                  >
                    {/* Visual Bar - This is the part that scales */}
                    <div className={`h-full w-full transition-all duration-300 origin-bottom group-hover/tt:scale-y-150 ${isFinished ? 'bg-[#3b82f6]' : 'bg-[#e2e8f0]'}`} />

                    {/* Tooltip - This stays at 1:1 scale because parent Link is not scaling */}
                    <div className="absolute opacity-0 group-hover/tt:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap z-50 pointer-events-none shadow-lg flex flex-col items-start font-mono leading-normal">
                      <div className="font-bold mb-1 border-b border-slate-600 pb-1 self-stretch text-left truncate max-w-[200px]">{subTitle}</div>
                      {isFinished ? (
                        <div className="flex flex-col gap-0.5 mt-1 text-left">
                          <span>{t.wpm}: <span className="text-blue-300">{su.wpm}</span></span>
                          <span>{t.accuracy}: <span className="text-emerald-300">{su.accuracy}%</span></span>
                          <span>{t.time}: <span className="text-amber-300">{timeFormatted}</span></span>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic mt-1 text-left">{t.notCompleted}</div>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
