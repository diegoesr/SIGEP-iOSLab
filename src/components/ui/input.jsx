import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import './input.css';

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const input = ref ? ref.current : inputRef.current;
    const container = containerRef.current;
    
    if (!input || !container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = () => {
      container.style.setProperty('--mouse-x', '50%');
      container.style.setProperty('--mouse-y', '50%');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  const combinedRef = (node) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    inputRef.current = node;
  };

  return (
    <div ref={containerRef} className="input-wrapper">
      <input
        type={type}
        className={cn("aceternity-input", className)}
        ref={combinedRef}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";
