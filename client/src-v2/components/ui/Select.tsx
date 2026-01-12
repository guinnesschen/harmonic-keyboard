import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm text-gray-600">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full h-10 px-3 rounded-md border border-gray-300 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
