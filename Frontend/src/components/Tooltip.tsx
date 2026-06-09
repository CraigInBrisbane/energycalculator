import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface TooltipProps {
  description: string;
  formula: string;
}

export const Tooltip = ({ description, formula }: TooltipProps) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY + 24,
        left: rect.left + window.scrollX - 120,
      });
      setShow(true);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef} 
        className="inline-block cursor-help ml-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
      >
        <Info size={14} className="text-slate-500 hover:text-blue-400 transition-colors" />
      </div>
      {show && createPortal(
        <div 
          className="fixed z-[9999] w-72 p-4 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl pointer-events-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          <p className="font-medium text-slate-200 mb-3">{description}</p>
          <hr className="border-slate-700 mb-3" />
          <p className="font-mono text-[10px] text-blue-300 bg-slate-950/50 p-2 rounded">{formula}</p>
        </div>,
        document.body
      )}
    </>
  );
};
