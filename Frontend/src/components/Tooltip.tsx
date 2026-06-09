import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip = ({ content }: TooltipProps) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY + 20,
        left: rect.left + window.scrollX - 100,
      });
      setShow(true);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef} 
        className="inline-block cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
      >
        <Info size={14} className="text-slate-500" />
      </div>
      {show && createPortal(
        <div 
          className="fixed z-[9999] w-64 p-3 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl pointer-events-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};
