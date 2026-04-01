import { Plus, Trash2 } from 'lucide-react';
import {
  useFieldArray,
  type Control,
  type FieldValues,
  type ArrayPath,
  type FieldArray,
  type Path,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';

interface DynamicListInputProps<T extends FieldValues> {
  label: string;
  control: Control<T>;
  name: ArrayPath<T>;
  placeholder?: string;
  minItems?: number;
  addButtonLabel?: string;
  description?: string;
}

export const DynamicListInput = <T extends FieldValues>({
  label,
  control,
  name,
  placeholder = 'Escriba aquí...',
  minItems = 0,
  addButtonLabel,
  description,
}: DynamicListInputProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const addItem = () => {
    append({ value: '' } as FieldArray<T, typeof name>);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {description && <p className="text-xs text-muted-foreground italic mb-3">{description}</p>}
      <div className="space-y-3">
        {fields.map((fieldItem, index) => (
          <div key={fieldItem.id} className="bg-background border border-border rounded-md">
            <div className="flex items-center gap-3 p-3">
              <div className="flex-shrink-0 w-6 h-6 bg-info/10 text-info flex items-center justify-center text-xs font-medium rounded-md">
                {index + 1}
              </div>
              <textarea
                {...control.register(`${name}.${index}.value` as Path<T>)}
                placeholder={`${placeholder} ${index + 1}`}
                rows={1}
                className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-sm text-foreground placeholder-muted-foreground p-0"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length <= minItems}
                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                aria-label={`Eliminar ${label.toLowerCase()} ${index + 1}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          onClick={addItem}
          className="flex items-center gap-2 text-info hover:text-info/80 hover:bg-info/10 border-info/30"
        >
          <Plus className="w-5 h-5" />
          <span>{addButtonLabel || `Agregar ${label.toLowerCase()}`}</span>
        </Button>
      </div>
    </div>
  );
};
