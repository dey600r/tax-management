import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface FloatingEditPanelProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  fieldName: string;
  initialValue: string | number;
  inputType?: 'number' | 'text';
  min?: number;
  max?: number;
  onSave: (value: string | number) => void;
  onClose: () => void;
}

export const FloatingEditPanel: React.FC<FloatingEditPanelProps> = ({
  isOpen,
  title,
  subtitle,
  fieldName,
  initialValue,
  inputType = 'number',
  min,
  max,
  onSave,
  onClose,
}) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue.toString());
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        alert('Por favor, introduce un número válido.');
        return;
      }
      if (min !== undefined && num < min) {
        alert(`El valor mínimo permitido es ${min}.`);
        return;
      }
      if (max !== undefined && num > max) {
        alert(`El valor máximo permitido es ${max}.`);
        return;
      }
      onSave(num);
    } else {
      if (!value.trim()) {
        alert('El texto no puede estar vacío.');
        return;
      }
      onSave(value.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="floating-edit-overlay">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
          <div>
            <h3 className="font-sans font-semibold tracking-tight text-sm uppercase">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none p-1 hover:bg-slate-800 rounded"
            id="btn-close-floating-panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4" id="floating-edit-form">
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {fieldName}
            </label>
            <input
              type={inputType === 'number' ? 'number' : 'text'}
              step={inputType === 'number' ? 'any' : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans shadow-2xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              id="btn-cancel-floating-edit"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              id="btn-save-floating-edit"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
