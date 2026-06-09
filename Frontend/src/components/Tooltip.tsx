import { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip = ({ content }: TooltipProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={14} className="text-slate-500 cursor-help" />
      {show && (
        <div className="absolute z-[100] w-64 p-3 mt-2 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl -left-20">
          {content}
        </div>
      )}
    </div>
  );
};
