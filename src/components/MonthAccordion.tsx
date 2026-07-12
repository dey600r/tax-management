import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { MonthId, EmployeeData, MonthState } from '../types';
import { ComputedMonthResult, ComputedMonthAccumulatorRow, MONTHS_ORDER, MONTH_LABELS } from '../utils/calculations';
import { PartitionsChart } from './PartitionsChart';

interface MonthAccordionProps {
  monthsData: Record<MonthId, MonthState>;
  monthsComputed: Record<MonthId, ComputedMonthResult>;
  accumulators: ComputedMonthAccumulatorRow[];
  onUpdateEmployeeData: (monthId: MonthId, data: Partial<EmployeeData>) => void;
  onAddSalaryConcept: (monthId: MonthId) => void;
  onDeleteSalaryConcept: (monthId: MonthId, id: string) => void;
  onAddBenefitConcept: (monthId: MonthId) => void;
  onDeleteBenefitConcept: (monthId: MonthId, id: string) => void;
  onTriggerEditCell: (params: {
    monthId: MonthId;
    type: 'salary' | 'benefit' | 'tax_empl' | 'tax_comp';
    rowId: string;
    field: string;
    label: string;
    val: string | number;
    isText?: boolean;
  }) => void;
}

export const MonthAccordion: React.FC<MonthAccordionProps> = ({
  monthsData,
  monthsComputed,
  accumulators,
  onUpdateEmployeeData,
  onAddSalaryConcept,
  onDeleteSalaryConcept,
  onAddBenefitConcept,
  onDeleteBenefitConcept,
  onTriggerEditCell,
}) => {
  const [expandedMonth, setExpandedMonth] = useState<MonthId | null>('enero');

  const toggleMonth = (mId: MonthId) => {
    setExpandedMonth(expandedMonth === mId ? null : mId);
  };

  return (
    <div className="space-y-3" id="month-accordion-wrapper">
      {MONTHS_ORDER.map((mId) => {
        const isExpanded = expandedMonth === mId;
        const mState = monthsData[mId];
        const mComp = monthsComputed[mId];
        const mAccum = accumulators.find((a) => a.monthId === mId);

        if (!mState || !mComp || !mAccum) return null;

        const { employee } = mState;

        return (
          <div
            key={mId}
            id={`month-panel-${mId}`}
            className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
              isExpanded ? 'border-blue-600 shadow-sm ring-1 ring-blue-600/20' : 'border-slate-200 shadow-xs hover:border-slate-300'
            }`}
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleMonth(mId)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left font-sans select-none focus:outline-none cursor-pointer ${
                isExpanded ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base font-bold transition-colors ${isExpanded ? 'text-blue-600' : 'text-slate-800'}`}>
                  {MONTH_LABELS[mId]}
                </span>
                <span className="hidden sm:inline-block text-xxs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  Neto: {mComp.neto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
                {employee.nombre && (
                  <span className="hidden md:inline-block text-xs font-medium text-slate-500">
                    — {employee.nombre}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="sm:hidden text-xs font-mono font-bold text-slate-700">
                  {mComp.neto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Accordion Body */}
            {isExpanded && (
              <div className="p-4 sm:p-6 bg-white border-t border-slate-100 space-y-6 animate-slide-down">
                {/* 1. Datos Empleado Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60" id={`card-empleado-${mId}`}>
                  <h4 className="font-sans font-extrabold text-slate-800 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    DATOS EMPLEADO
                  </h4>

                  {/* Grid Layout - 4 columns on desktop, 2 on tablet, 1 on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Nombre */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Nombre
                      </span>
                      <input
                        type="text"
                        value={employee.nombre}
                        onChange={(e) => onUpdateEmployeeData(mId, { nombre: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5"
                      />
                    </div>

                    {/* Nº Empleado */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Nº Empleado
                      </span>
                      <input
                        type="text"
                        value={employee.numEmpleado}
                        onChange={(e) => onUpdateEmployeeData(mId, { numEmpleado: e.target.value })}
                        placeholder="123456"
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5"
                      />
                    </div>

                    {/* Nº Días */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Nº Días
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={employee.numDias}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateEmployeeData(mId, { numDias: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5 font-mono"
                      />
                      {employee.numDias <= 0 && (
                        <span className="absolute right-2 top-2 text-red-500" title="Días debe ser mayor a 0">
                          <ShieldAlert className="w-4 h-4 animate-pulse" />
                        </span>
                      )}
                    </div>

                    {/* Pagas Extra */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Pagas Extra Anuales
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={14}
                        value={employee.pagasExtra}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateEmployeeData(mId, { pagasExtra: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5 font-mono"
                      />
                    </div>

                    {/* % Deducible Seguro Médico */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        % Deducible Seg. Médico
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={employee.pctDeducibleSeguroMedico}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateEmployeeData(mId, { pctDeducibleSeguroMedico: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5 font-mono"
                      />
                    </div>

                    {/* Trienios */}
                    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Trienios (Antigüedad)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={employee.trienios}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateEmployeeData(mId, { trienios: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-0 mt-0.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Split Desktop Layout: Tables (Left 2/3) vs. Summaries (Right 1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-start">
                  
                  {/* Left Column (Tables) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* NOMINA Card with Tables */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs" id={`card-nomina-${mId}`}>
                      <div className="bg-slate-900 px-4 py-2.5 text-white flex items-center justify-between">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider">
                          Detalle de Nómina
                        </span>
                        <span className="text-xxs text-slate-400 font-mono">
                          Valores calculados en base a {employee.numDias} días
                        </span>
                      </div>

                      <div className="p-4 space-y-6">
                        
                        {/* A. SALARIO BASE TABLE */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wide">
                              1. Salario Base y Plus
                            </span>
                            <button
                              id={`btn-add-salary-concept-${mId}`}
                              onClick={() => onAddSalaryConcept(mId)}
                              className="flex items-center gap-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Añadir Concepto
                            </button>
                          </div>
                          
                          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                  <th className="p-2.5 font-semibold">Concepto</th>
                                  <th className="p-2.5 text-right font-semibold">Precio / Hora (€)</th>
                                  <th className="p-2.5 text-right font-semibold">Devengos (€)</th>
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {mComp.salaryBaseRows.map((r) => {
                                  // Determine if the concept belongs to the default system rows or custom rows
                                  const configRow = mState.salaryConcepts.find((c) => c.id === r.id);
                                  const isSystem = configRow?.isSystem ?? true;
                                  const isEditable = configRow?.isEditable ?? true;

                                  return (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                      <td className="p-2.5 font-sans font-medium text-slate-700 flex items-center gap-1.5">
                                        {!isSystem ? (
                                          <div className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => onTriggerEditCell({
                                              monthId: mId,
                                              type: 'salary',
                                              rowId: r.id,
                                              field: 'name',
                                              label: 'Concepto',
                                              val: r.name,
                                              isText: true
                                            })}
                                          >
                                            <span className="underline decoration-dotted decoration-slate-400">{r.name}</span>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                          </div>
                                        ) : (
                                          <span>{r.name}</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-right font-mono text-slate-700">
                                        {isEditable ? (
                                          <button
                                            type="button"
                                            onClick={() => onTriggerEditCell({
                                              monthId: mId,
                                              type: 'salary',
                                              rowId: r.id,
                                              field: 'precioHora',
                                              label: `Precio/Hora (${r.name})`,
                                              val: r.precioHora
                                            })}
                                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                          >
                                            <span>{r.precioHora.toFixed(2)}</span>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                          </button>
                                        ) : (
                                          <span className="text-slate-500 italic">{r.precioHora.toFixed(2)}</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                                        {r.devengos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        {!isSystem && (
                                          <button
                                            onClick={() => onDeleteSalaryConcept(mId, r.id)}
                                            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                                            title="Eliminar concepto"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                  <td className="p-2.5 font-sans font-bold text-slate-800">TOTAL</td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.salaryBaseTotalPrecioHora.toFixed(2)}
                                  </td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.salaryBaseTotalDevengos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* B. BENEFICIOS TABLE */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wide">
                              2. Beneficios Sociales
                            </span>
                            <button
                              id={`btn-add-benefit-${mId}`}
                              onClick={() => onAddBenefitConcept(mId)}
                              className="flex items-center gap-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Añadir Beneficio
                            </button>
                          </div>

                          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                  <th className="p-2.5 font-semibold">Concepto</th>
                                  <th className="p-2.5 text-right font-semibold">Devengos (€)</th>
                                  <th className="p-2.5 text-right font-semibold">Deducciones (€)</th>
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {mComp.benefitsRows.map((r) => {
                                  const configRow = mState.benefitConcepts.find((b) => b.id === r.id);
                                  const isSystem = configRow?.isSystem ?? true;

                                  return (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                      <td className="p-2.5 font-sans font-medium text-slate-700">
                                        {!isSystem ? (
                                          <div className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => onTriggerEditCell({
                                              monthId: mId,
                                              type: 'benefit',
                                              rowId: r.id,
                                              field: 'name',
                                              label: 'Concepto',
                                              val: r.name,
                                              isText: true
                                            })}
                                          >
                                            <span className="underline decoration-dotted decoration-slate-400">{r.name}</span>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                          </div>
                                        ) : (
                                          <span>{r.name}</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-right font-mono text-slate-700">
                                        <button
                                          type="button"
                                          onClick={() => onTriggerEditCell({
                                            monthId: mId,
                                            type: 'benefit',
                                            rowId: r.id,
                                            field: 'devengos',
                                            label: `Devengos (${r.name})`,
                                            val: r.devengos
                                          })}
                                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                        >
                                          <span>{r.devengos.toFixed(2)}</span>
                                          <Edit2 className="w-3 h-3 text-slate-400" />
                                        </button>
                                      </td>
                                      <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                                        {r.deducciones.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        {!isSystem && (
                                          <button
                                            onClick={() => onDeleteBenefitConcept(mId, r.id)}
                                            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                                            title="Eliminar beneficio"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                  <td className="p-2.5 font-sans font-bold text-slate-800">TOTAL</td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.benefitsTotalDevengos.toFixed(2)}
                                  </td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.benefitsTotalDeducciones.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* C. IMPUESTOS TABLE */}
                        <div className="space-y-2">
                          <span className="block font-sans font-bold text-xs text-slate-700 uppercase tracking-wide">
                            3. Seguridad Social e Impuestos
                          </span>
                          
                          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                  <th className="p-2.5 font-semibold">Concepto</th>
                                  <th className="p-2.5 text-right font-semibold">Base (€)</th>
                                  <th className="p-2.5 text-right font-semibold">% Empleado</th>
                                  <th className="p-2.5 text-right font-semibold">Deducción Empl. (€)</th>
                                  <th className="p-2.5 text-right font-semibold">% Empresa</th>
                                  <th className="p-2.5 text-right font-semibold">Empresa (€)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mComp.taxesRows.map((r) => {
                                  const isIrpf = r.id === 'irpf';
                                  return (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                      <td className="p-2.5 font-sans font-medium text-slate-700">{r.name}</td>
                                      <td className="p-2.5 text-right font-mono text-slate-500">
                                        {r.base.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2.5 text-right font-mono text-slate-700">
                                        {isIrpf ? (
                                          <button
                                            type="button"
                                            onClick={() => onTriggerEditCell({
                                              monthId: mId,
                                              type: 'tax_empl',
                                              rowId: r.id,
                                              field: 'pctEmpleado',
                                              label: `Porcentaje Empleado (${r.name})`,
                                              val: r.pctEmpleado
                                            })}
                                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                          >
                                            <span>{r.pctEmpleado.toFixed(2)}%</span>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                          </button>
                                        ) : (
                                          <span className="text-slate-600 font-medium">{r.pctEmpleado.toFixed(2)}%</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                                        {r.deduccionEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2.5 text-right font-mono text-slate-700">
                                        {!isIrpf ? (
                                          <span className="text-slate-600 font-medium">{r.pctEmpresa.toFixed(2)}%</span>
                                        ) : (
                                          <span className="text-slate-400 font-mono">—</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-right font-mono text-slate-700">
                                        {!isIrpf ? (
                                          <span className="font-semibold text-slate-800">
                                            {r.empresa.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-mono">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                  <td className="p-2.5 font-sans font-bold text-slate-800">TOTAL</td>
                                  <td className="p-2.5 text-right font-mono text-slate-400">—</td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">{mComp.taxesTotalPctEmpleado.toFixed(2)}%</td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.taxesTotalDeduccionEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">{mComp.taxesTotalPctEmpresa.toFixed(2)}%</td>
                                  <td className="p-2.5 text-right font-mono text-slate-800">
                                    {mComp.taxesTotalEmpresa.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Right Column (Resumen, Acumulado, Particiones) */}
                  <div className="space-y-6">
                    
                    {/* A. RESUMEN MENSUAL CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id={`card-resumen-mensual-${mId}`}>
                      <div className="bg-blue-600 text-white px-4 py-2.5 font-sans font-bold text-xs uppercase tracking-wider">
                        Resumen Mensual
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                          <span className="font-medium text-slate-500">Bruto</span>
                          <span className="font-mono font-bold text-slate-700">
                            {mComp.bruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                          <span className="font-medium text-slate-500">Deducciones</span>
                          <span className="font-mono font-bold text-rose-500">
                            -{mComp.deducciones.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-100 bg-blue-50/50 p-2 rounded-lg ring-1 ring-blue-500/10">
                          <span className="font-bold text-blue-800 uppercase tracking-wide text-xs">Recibido (Neto)</span>
                          <span className="font-mono font-extrabold text-blue-600 text-base">
                            {mComp.neto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="font-medium text-slate-400">Prorrata Extra (Prorrateado)</span>
                          <span className="font-mono text-slate-500">
                            {mComp.prorrataExtras.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* B. ACUMULADO CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id={`card-acumulado-${mId}`}>
                      <div className="bg-slate-900 text-white px-4 py-2.5 font-sans font-bold text-xs uppercase tracking-wider">
                        Acumulado Anual (Hasta este mes)
                      </div>
                      <div className="p-4">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                              <th className="pb-1.5 font-semibold">Concepto</th>
                              <th className="pb-1.5 text-right font-semibold">Este mes</th>
                              <th className="pb-1.5 text-right font-semibold">Acumulado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/30">
                              <td className="py-2 text-slate-600 font-sans font-medium">Imponible IRPF</td>
                              <td className="py-2 text-right font-mono text-slate-600">
                                {mAccum.thisMonth.imponibleIrpf.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800">
                                {mAccum.accum.imponibleIrpf.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/30">
                              <td className="py-2 text-slate-600 font-sans font-medium">Retenciones IRPF</td>
                              <td className="py-2 text-right font-mono text-slate-600">
                                {mAccum.thisMonth.retencionesIrpf.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800">
                                {mAccum.accum.retencionesIrpf.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/30">
                              <td className="py-2 text-slate-600 font-sans font-medium">SS Empleado</td>
                              <td className="py-2 text-right font-mono text-slate-600">
                                {mAccum.thisMonth.ssEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800">
                                {mAccum.accum.ssEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/30">
                              <td className="py-2 text-slate-600 font-sans font-medium">SS Empresa</td>
                              <td className="py-2 text-right font-mono text-slate-600">
                                {mAccum.thisMonth.ssEmpresa.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800">
                                {mAccum.accum.ssEmpresa.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/30 bg-slate-50/30 font-semibold">
                              <td className="py-2 text-blue-850 font-sans font-bold">Recibido Total</td>
                              <td className="py-2 text-right font-mono text-blue-600">
                                {mAccum.thisMonth.recibido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 text-right font-mono font-extrabold text-blue-600">
                                {mAccum.accum.recibido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* C. PARTICIONES CHART CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id={`card-particiones-${mId}`}>
                      <div className="bg-slate-900 text-white px-4 py-2.5 font-sans font-bold text-xs uppercase tracking-wider">
                        Partición Bruta (Este mes)
                      </div>
                      <PartitionsChart
                        bruto={mComp.bruto}
                        retencionesIrpf={mComp.taxesRows.find((t) => t.id === 'irpf')?.deduccionEmpleado || 0}
                        ssEmpleado={Math.max(0, mComp.taxesTotalDeduccionEmpleado - (mComp.taxesRows.find((t) => t.id === 'irpf')?.deduccionEmpleado || 0))}
                        ssEmpresa={mComp.taxesTotalEmpresa}
                        neto={mComp.neto}
                      />
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
