import { Flame, Timer, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  subtitle?: string;
  icon: 'fire' | 'timer' | 'verified';
  color: 'orange' | 'blue' | 'purple';
}

const colorMap = {
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    border: 'border-orange-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
};

const iconMap = {
  fire: Flame,
  timer: Timer,
  verified: Award,
};

export function StatCard({ title, value, trend, subtitle, icon, color }: StatCardProps) {
  const Icon = iconMap[icon];
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4 border',
            styles.bg,
            styles.text,
            styles.border
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">{title}</p>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-slate-900 mt-2 font-display">{value}</h3>
        {trend && (
          <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <TrendingUp className="w-3 h-3" /> {trend}
          </div>
        )}
        {subtitle && (
          <p className="text-slate-500 text-xs font-medium mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
