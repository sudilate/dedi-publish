import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface TextareaWithCounterProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCounter?: boolean;
  counterClassName?: string;
}

const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(({ 
  className, 
  maxLength = 200, 
  showCounter = true, 
  counterClassName,
  value = '',
  onChange,
  ...props 
}, ref) => {
  const currentLength = typeof value === 'string' ? value.length : 0;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange?.(e);
    }
  };

  const getCounterColor = () => {
    if (currentLength > maxLength * 0.9) return 'text-red-500';
    if (currentLength > maxLength * 0.8) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-2">
      <Textarea
        className={className}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      {showCounter && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            Maximum {maxLength} characters
          </span>
          <span className={cn(getCounterColor(), counterClassName)}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

TextareaWithCounter.displayName = 'TextareaWithCounter';

export { TextareaWithCounter }; 