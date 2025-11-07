
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface DynamicListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  minItems?: number;
  addButtonLabel?: string;
}

export const DynamicListInput: React.FC<DynamicListInputProps> = ({
  label,
  items,
  onChange,
  placeholder = 'Escriba aquí...',
  minItems = 0,
  addButtonLabel
}) => {
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
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 p-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              <textarea
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}`}
                rows={1}
                className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-sm text-gray-900 placeholder-gray-400 p-0"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= minItems}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                aria-label={`Eliminar ${label.toLowerCase()} ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
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
          <Plus className="w-4 h-4" />
          <span>{addButtonLabel || `Agregar ${label.toLowerCase()}`}</span>
        </Button>
      </div>
    </div>
  );
};



