import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface DynamicListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  minItems?: number;
  addButtonLabel?: string;
  description?: string;
}

export const DynamicListInput = ({
  label,
  items,
  onChange,
  placeholder = 'Escriba aquí...',
  minItems = 0,
  addButtonLabel,
  description
}: DynamicListInputProps) => {
  const addItem = () => {
    onChange([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-900 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-neutral-500 italic mb-3">{description}</p>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-md border border-neutral-200">
            <div className="flex items-center gap-3 p-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <textarea
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}`}
                rows={1}
                className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-sm text-neutral-900 placeholder-neutral-400 p-0"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= minItems}
                className="flex-shrink-0 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-neutral-400 disabled:hover:bg-transparent"
                aria-label={`Eliminar ${label.toLowerCase()} ${index + 1}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          <Plus className="w-5 h-5" />
          <span>{addButtonLabel || `Agregar ${label.toLowerCase()}`}</span>
        </Button>
      </div>
    </div>
  );
};
