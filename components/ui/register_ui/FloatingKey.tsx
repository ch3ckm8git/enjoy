// components/ui/FloatingKey.tsx
export const FloatingKey = ({ char, className, delay = "0s" }: { char: string, className: string, delay?: string }) => {
    return (
        <div
            className={`absolute select-none pointer-events-none z-0 
      flex items-center justify-center w-12 h-12 md:w-16 md:h-16 
      bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
      border border-slate-100 text-blue-200 text-xl md:text-2xl font-bold 
      animate-float ${className}`}
            style={{ animationDelay: delay }}
        >
            {char}
        </div>
    );
};