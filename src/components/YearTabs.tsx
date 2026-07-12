import React, { useState } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';

interface YearTabsProps {
  years: number[];
  activeYear: number;
  onSelectYear: (year: number) => void;
  onAddYear: () => void;
  onDeleteYear: (year: number) => void;
  onRenameYear: (oldYear: number, newYear: number) => boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const YearTabs: React.FC<YearTabsProps> = ({
  years,
  activeYear,
  onSelectYear,
  onAddYear,
  onDeleteYear,
  onRenameYear,
  showToast,
}) => {
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (year: number) => {
    setEditingYear(year);
    setEditValue(year.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const val = e.target.value.replace(/\D/g, '');
    setEditValue(val);
  };

  const saveRename = (oldYear: number) => {
    const newY = parseInt(editValue, 10);
    if (isNaN(newY) || editValue.length !== 4) {
      showToast('El año debe tener formato de 4 dígitos (ej. 2026)', 'error');
      setEditingYear(null);
      return;
    }

    if (newY === oldYear) {
      setEditingYear(null);
      return;
    }

    if (years.includes(newY)) {
      showToast('Este año ya está registrado', 'error');
      setEditingYear(null);
      return;
    }

    const success = onRenameYear(oldYear, newY);
    if (success) {
      showToast(`Año cambiado a ${newY} correctamente`, 'success');
    }
    setEditingYear(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, oldYear: number) => {
    if (e.key === 'Enter') {
      saveRename(oldYear);
    } else if (e.key === 'Escape') {
      setEditingYear(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center bg-slate-100 border-b border-slate-200 p-2 gap-1.5" id="year-tabs-container">
      <span className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-widest px-2 mr-1">
        EJERCICIO FISCAL:
      </span>

      {years.map((yr) => {
        const isActive = yr === activeYear;
        const isEditing = yr === editingYear;

        return (
          <div
            key={yr}
            id={`year-tab-${yr}`}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg border border-b-0 text-xs font-bold transition-all duration-150 select-none ${
              isActive
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold border-t-2 border-t-blue-600 shadow-xs z-10'
                : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-200/50 cursor-pointer'
            }`}
            onClick={() => !isEditing && onSelectYear(yr)}
            onDoubleClick={() => !isEditing && startEditing(yr)}
          >
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, yr)}
                  onBlur={() => saveRename(yr)}
                  autoFocus
                  maxLength={4}
                  className="w-14 text-center px-1 py-0.5 border border-blue-500 rounded bg-white text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveRename(yr);
                  }}
                  className="p-0.5 hover:bg-blue-50 rounded text-blue-600 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="font-mono tracking-wide">{yr}</span>
            )}

            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-1.5">
                <button
                  id={`btn-edit-year-${yr}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(yr);
                  }}
                  className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="Renombrar año"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {years.length > 1 && (
                  <button
                    id={`btn-delete-year-${yr}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Seguro que deseas eliminar el año ${yr} y todos sus datos?`)) {
                        onDeleteYear(yr);
                      }
                    }}
                    className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded cursor-pointer animate-fade-in"
                    title="Eliminar año"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* "+" Add Year tab */}
      <button
        id="btn-add-year"
        onClick={onAddYear}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
        title="Crear nuevo año clonando el activo"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Añadir Ejercicio</span>
      </button>
    </div>
  );
};
