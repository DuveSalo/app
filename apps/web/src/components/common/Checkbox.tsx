import { forwardRef, type ChangeEvent, type ElementRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ id, label, checked, defaultChecked, onCheckedChange, onChange, disabled, className, name }, ref) => {
  const handleCheckedChange = (newChecked: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || id || '',
          checked: newChecked,
          type: 'checkbox',
        },
      } as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          'peer h-[18px] w-[18px] shrink-0 rounded-md border border-neutral-300 bg-white transition-all duration-200 shadow-xs',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/15 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-brand-700 data-[state=checked]:border-brand-700 data-[state=checked]:text-white',
          'hover:border-neutral-400'
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" strokeWidth={2.5} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm text-neutral-700 font-medium cursor-pointer select-none',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
