import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card = ({ children, className, title, subtitle }: CardProps) => {
  return (
    <div className={cn(
      "glass rounded-[1.5rem] p-5 lg:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-slate-700/50 group",
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
