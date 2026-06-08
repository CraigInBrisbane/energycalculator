import type { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
}

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95",
    secondary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-600/20 active:scale-95",
    outline: "bg-transparent border border-slate-800 hover:border-slate-600 hover:bg-slate-900 text-slate-200",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    ghost: "bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white",
  };

  return (
    <button
      className={cn(
        "px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
