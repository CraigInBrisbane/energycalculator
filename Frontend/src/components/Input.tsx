import type { InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-semibold text-slate-400 ml-1">{label}</label>}
      <input
        className={cn(
          "px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600",
          className
        )}
        {...props}
      />
    </div>
  );
};
