import React, { useState } from 'react';
import { X, Plus, Trash2, Settings, Percent } from 'lucide-react';
import { AppSettings, MasterItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onRenameTipo: (oldName: string, newName: string) => void;
  onRenameClasificacion: (oldName: string, newName: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRenameTipo,
  onRenameClasificacion,
}) => {
  const [localTipos, setLocalTipos] = useState<MasterItem[]>(() => [...settings.tipos]);
  const [localClasificaciones, setLocalClasificaciones] = useState<MasterItem[]>(() => [
    ...settings.clasificaciones,
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic validations
    const filteredTipos = localTipos.map((t) => ({
      name: t.name.trim(),
      limitPct: Math.max(0, Number(t.limitPct) || 0),
    })).filter((t) => t.name !== '');

    const filteredClasificaciones = localClasificaciones.map((c) => ({
      name: c.name.trim(),
      limitPct: Math.max(0, Number(c.limitPct) || 0),
    })).filter((c) => c.name !== '');

    onSaveSettings({
      tipos: filteredTipos,
      clasificaciones: filteredClasificaciones,
    });
    onClose();
  };

  const handleUpdateTipo = (index: number, field: keyof MasterItem, value: any) => {
    const updated = [...localTipos];
    const oldVal = updated[index];

    if (field === 'name') {
      const oldName = oldVal.name;
      const newName = String(value);
      updated[index] = { ...oldVal, name: newName };
      setLocalTipos(updated);
      
      // If we are editing an already saved name (not a fresh new empty row), propagate renaming to existing transactions
      if (oldName.trim() !== '' && oldName !== newName && newName.trim() !== '') {
        onRenameTipo(oldName, newName);
      }
    } else {
      updated[index] = { ...oldVal, [field]: value };
      setLocalTipos(updated);
    }
  };

  const handleUpdateClasificacion = (index: number, field: keyof MasterItem, value: any) => {
    const updated = [...localClasificaciones];
    const oldVal = updated[index];

    if (field === 'name') {
      const oldName = oldVal.name;
      const newName = String(value);
      updated[index] = { ...oldVal, name: newName };
      setLocalClasificaciones(updated);

      // If we are editing an already saved name, propagate renaming to existing transactions
      if (oldName.trim() !== '' && oldName !== newName && newName.trim() !== '') {
        onRenameClasificacion(oldName, newName);
      }
    } else {
      updated[index] = { ...oldVal, [field]: value };
      setLocalClasificaciones(updated);
    }
  };

  const handleAddTipo = () => {
    setLocalTipos([...localTipos, { name: '', limitPct: 0 }]);
  };

  const handleAddClasificacion = () => {
    setLocalClasificaciones([...localClasificaciones, { name: '', limitPct: 0 }]);
  };

  const handleDeleteTipo = (index: number) => {
    const updated = localTipos.filter((_, i) => i !== index);
    setLocalTipos(updated);
  };

  const handleDeleteClasificacion = (index: number) => {
    const updated = localClasificaciones.filter((_, i) => i !== index);
    setLocalClasificaciones(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Configuración de Datos Maestros
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Gestiona tus tipos y clasificaciones personalizadas con sus respectivos límites de consumo mensual.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tables workspace split view */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Table 1: TIPOS */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Maestro de Tipos (Tf / Gastos)
              </h4>
              <button
                type="button"
                onClick={handleAddTipo}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir Tipo</span>
              </button>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/30 flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-3 pl-4">Tipo</th>
                    <th className="p-3 text-right w-28">Límite %</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localTipos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400 font-medium italic">
                        No hay tipos definidos. Crea uno nuevo.
                      </td>
                    </tr>
                  ) : (
                    localTipos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 pl-4">
                          <input
                            type="text"
                            value={item.name}
                            placeholder="p. ej. Suscripciones"
                            onChange={(e) => handleUpdateTipo(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1 transition-all font-sans text-xs text-slate-800 font-semibold"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <div className="inline-flex items-center gap-1 border border-transparent hover:border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded px-1.5 py-0.5 bg-transparent w-20 justify-end transition-all">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.limitPct || ''}
                              placeholder="0"
                              onChange={(e) => handleUpdateTipo(idx, 'limitPct', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent text-right font-mono font-bold text-xs text-slate-700 outline-none"
                            />
                            <Percent className="w-3 h-3 text-slate-400 shrink-0" />
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteTipo(idx)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: CLASIFICACIONES */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Maestro de Clasificaciones (Gastos)
              </h4>
              <button
                type="button"
                onClick={handleAddClasificacion}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir Clasificación</span>
              </button>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/30 flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-3 pl-4">Clasificación</th>
                    <th className="p-3 text-right w-28">Límite %</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localClasificaciones.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400 font-medium italic">
                        No hay clasificaciones definidas. Crea una nueva.
                      </td>
                    </tr>
                  ) : (
                    localClasificaciones.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 pl-4">
                          <input
                            type="text"
                            value={item.name}
                            placeholder="p. ej. Transporte"
                            onChange={(e) => handleUpdateClasificacion(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1 transition-all font-sans text-xs text-slate-800 font-semibold"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <div className="inline-flex items-center gap-1 border border-transparent hover:border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded px-1.5 py-0.5 bg-transparent w-20 justify-end transition-all">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.limitPct || ''}
                              placeholder="0"
                              onChange={(e) => handleUpdateClasificacion(idx, 'limitPct', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent text-right font-mono font-bold text-xs text-slate-700 outline-none"
                            />
                            <Percent className="w-3 h-3 text-slate-400 shrink-0" />
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteClasificacion(idx)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer save/action actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
};
