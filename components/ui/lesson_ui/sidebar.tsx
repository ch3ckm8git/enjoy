'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from '@/app/assets/images/logo.png';
import Image from 'next/image';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  MessageSquare,
  Settings,
  GraduationCap,
  Award,
  User,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dictionary, Lang } from '@/lib/i18n';

export function Sidebar({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const t = dictionary[lang];

  const navItems = [

    { name: t.sidebar.courses, href: `/${lang}/lessons`, icon: BookOpen },
    { name: t.sidebar.quick_test, href: `/${lang}/quick_test`, icon: ClipboardList },
    { name: t.sidebar.profile, href: `/${lang}/profile`, icon: User },
    { name: t.sidebar.performance, href: `/${lang}/performance`, icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white flex-col border-r border-slate-200 h-screen shrink-0 sticky top-0 shadow-sm hidden md:flex">
      <Link href={`/${lang}`} className="p-6 flex items-center gap-3 mt-2 hover:opacity-80 transition-opacity">
        <Image src={logo} alt="Logo" />
      </Link>

      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all group',
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                )}
              />
              <span className={cn('text-sm', isActive ? 'font-bold' : 'font-medium')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* <div className="p-4 mt-auto">


        <Link
          href={`/${lang}/settings`}
          className="flex items-center gap-3 px-3 py-4 mt-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">{t.sidebar.settings}</span>
        </Link>
      </div> */}
      <div className="p-4 mt-auto">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSe6CFN40uV3rbXBNlWdcEIF2_Xs4W1jD9L0AxfKKpbXdAqVDw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-slate-500 hover:text-indigo-600 hover:bg-slate-50 group"
        >
          <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-indigo-600" />
          <span className="text-sm font-medium">Report issues</span>
        </a>
      </div>
    </aside>
  );
}
