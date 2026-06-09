import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip = ({ content }: TooltipProps) => {
  return (
    <div className="group relative inline-block cursor-help">
      <div className="text-slate-500">
        <Info size={14} />
      </div>
      <div className="absolute z-[100] w-64 p-3 mt-2 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -left-20">
        {content}
      </div>
    </div>
  );
};
