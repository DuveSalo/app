import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Textarea as BaseTextarea } from '@/components/ui/textarea';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <BaseTextarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={hasError || undefined}
          className={cn('min-h-[80px]', hasError && 'aria-invalid:border-destructive', className)}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
