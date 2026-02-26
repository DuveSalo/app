import { useState, useEffect, useMemo, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  placeholder?: string;
  minDate?: string;
  className?: string;
}

export const DatePicker = ({
  label,
  error,
  helperText,
  value,
  onChange,
  disabled = false,
  required = false,
  id,
  placeholder = 'dd/mm/aaaa',
  minDate,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        setInputValue(format(date, 'dd/MM/yyyy'));
        return;
      }
    }
    setInputValue('');
  }, [value]);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const d = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  const minDateObj = useMemo(() => {
    if (!minDate) return undefined;
    const d = parse(minDate, 'yyyy-MM-dd', new Date());
    return isValid(d) ? d : undefined;
  }, [minDate]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
    setOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const commitInputValue = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onChange('');
      return;
    }
    const parsed = parse(trimmed, 'dd/MM/yyyy', new Date());
    if (isValid(parsed) && parsed.getFullYear() > 1900) {
      onChange(format(parsed, 'yyyy-MM-dd'));
    } else {
      if (value) {
        const date = parse(value, 'yyyy-MM-dd', new Date());
        setInputValue(isValid(date) ? format(date, 'dd/MM/yyyy') : '');
      } else {
        setInputValue('');
      }
    }
  };

  const handleInputBlur = () => {
    commitInputValue();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInputValue();
    }
  };

  const hasError = !!error;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-900 mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <input
              ref={inputRef}
              id={id}
              type="text"
              disabled={disabled}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'flex w-full h-9 rounded-md border bg-white px-3 text-sm font-medium transition-colors pr-10',
                'placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
                'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
                hasError
                  ? 'border-red-600 text-red-900 focus-visible:ring-red-600/20 focus-visible:border-red-600'
                  : 'border-neutral-200 text-neutral-900 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-300 hover:border-neutral-300',
              )}
            />
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="absolute right-0 top-0 h-full px-3 flex items-center text-neutral-400 hover:text-neutral-600 disabled:pointer-events-none"
                tabIndex={-1}
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent className="w-auto p-0 rounded-md" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={minDateObj ? { before: minDateObj } : undefined}
            defaultMonth={selectedDate || undefined}
            locale={es}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
