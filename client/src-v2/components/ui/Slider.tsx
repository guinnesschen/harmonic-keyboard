import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, value, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {(label || showValue) && (
          <div className="flex justify-between text-sm">
            {label && <span className="text-gray-600">{label}</span>}
            {showValue && <span className="text-gray-500 font-mono">{value}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
            'accent-gray-900',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
