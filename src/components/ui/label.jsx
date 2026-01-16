import React from 'react';
import { cn } from '../../lib/utils';
import './label.css';

export const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("aceternity-label", className)}
      {...props}
    />
  );
});

Label.displayName = "Label";
