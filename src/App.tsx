import { useState, useEffect } from 'react';
import { AppState, ActiveView, MonthId, EmployeeData, YearState, MonthState, InvestmentRow, TransferRow, ExpenseRow } from './types';
import { Header } from './components/Header';
import { Sidenav } from './components/Sidenav';
import { YearTabs } from './components/YearTabs';
import { MonthAccordion } from './components/MonthAccordion';
import { AnnualSummaryView } from './components/AnnualSummaryView';
import { FloatingEditPanel } from './components/FloatingEditPanel';
import { DashboardView, DashboardYearSummary } from './components/DashboardView';
import { SavingsExpensesView } from './components/SavingsExpensesView';
import { createDefaultYearState, computeYear, MONTH_LABELS } from './utils/calculations';

const LOCAL_STORAGE_KEY = 'gestor_nominas_state_v1';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.years) && parsed.years.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    const initialYear = 2026;
    const initialYearState = createDefaultYearState(initialYear);
    return {
      years: [initialYear],
      activeYear: initialYear,
      activeView: 'cuenta-anual',
      yearStates: {
        [initialYear]: initialYearState,
      },
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{
    type: 'ss_config' | 'bracket_state' | 'bracket_regional' | 'otros_beneficios' | 'rendimiento_trabajo' | 'exemption' | 'exemption_dynamic' | 'salary' | 'benefit' | 'tax_empl' | 'tax_comp';
    monthId?: MonthId;
    rowId: string;
    field: string;
    label: string;
    val: string | number;
    isText?: boolean;
    bracketIdx?: number;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-persist state to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [appState]);

  // Toast auto-dismiss after 3 seconds
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const handleImportState = (newState: AppState) => {
    setAppState(newState);
  };

  // State calculations helper
  const getActiveYearState = (): YearState => {
    const yrState = appState.yearStates[appState.activeYear];
    if (yrState) return yrState;
    return createDefaultYearState(appState.activeYear);
  };

  const activeState = getActiveYearState();
  const computedYear = computeYear(activeState);

  // Compute all years summaries for Dashboard View
  const dashboardSummaries: DashboardYearSummary[] = appState.years.map((yr) => {
    const yrState = appState.yearStates[yr] || createDefaultYearState(yr);
    const comp = computeYear(yrState);

    // Calculate annual expenses
    let totalGastado = 0;
    const expensesByCategory: Record<string, number> = {
      Vivienda: 0,
      Alimentacion: 0,
      Ocio: 0,
      Trabajo: 0,
      Vehiculos: 0,
      Inversion: 0,
      Regalos: 0,
      Ahorro: 0,
      Ropa: 0,
    };

    const expensesByType: Record<string, number> = {
      'Gasto Fijo': 0,
      'Gasto Estimado': 0,
      'Inversion Fija': 0,
      'Inversion Estimada': 0,
      'Ahorro': 0,
    };

    const MONTHS_KEYS = Object.keys(comp.months);
    MONTHS_KEYS.forEach((mId) => {
      const mExpenses = yrState.expenses?.[mId] || [];
      mExpenses.forEach((exp) => {
        const importVal = exp.importe || 0;
        totalGastado += importVal;
        const cat = exp.clasificacion;
        if (expensesByCategory[cat] !== undefined) {
          expensesByCategory[cat] += importVal;
        } else {
          expensesByCategory[cat] = importVal;
        }

        let tipo = exp.tipo || 'Gasto Estimado';
        if (tipo === 'Inversion estimada') {
          tipo = 'Inversion Estimada';
        }
        if (expensesByType[tipo] !== undefined) {
          expensesByType[tipo] += importVal;
        } else {
          expensesByType[tipo] = importVal;
        }
      });
    });

    const totalNetoNomina = MONTHS_KEYS.reduce((sum, mId) => {
      return sum + (comp.months[mId as MonthId]?.neto || 0);
    }, 0);

    // Calculate annual investment gains (Base de Ahorro e Inversiones)
    const inversionesList = yrState.inversiones || [];
    const computedInversiones = inversionesList.map((row) => {
      const hasVentaYCompra = row.venta !== 0 && row.compra !== 0;
      const interesBruto = hasVentaYCompra ? Math.round((row.venta - row.compra) * 100) / 100 : row.interesBruto;
      const impuestos = interesBruto * 0.19;
      const comisionesNoDeducibles = row.comisionDeducible ? 0 : row.comisiones;
      const total = interesBruto - impuestos - comisionesNoDeducibles;
      return {
        ...row,
        interesBruto,
        impuestos,
        comisionesNoDeducibles,
        total,
      };
    });

    const totalInversionVenta = computedInversiones.reduce((sum, r) => sum + r.venta, 0);
    const totalInversionCompra = computedInversiones.reduce((sum, r) => sum + r.compra, 0);
    const totalInversionInteresBruto = computedInversiones.reduce((sum, r) => sum + r.interesBruto, 0);
    const totalInversionImpuestos = computedInversiones.reduce((sum, r) => sum + r.impuestos, 0);
    const totalInversionImpuestosEspana = computedInversiones.reduce((sum, r) => sum + r.impuestosEspana, 0);
    const totalInversionImpuestosExtranjero = computedInversiones.reduce((sum, r) => sum + r.impuestosExtranjero, 0);
    const totalInversionComisiones = computedInversiones.reduce((sum, r) => sum + r.comisiones, 0);
    const totalInversionNeto = computedInversiones.reduce((sum, r) => sum + r.total, 0);

    return {
      year: yr,
      salarioBruto: comp.annualSummary.salarioBruto,
      retencionIrpf: comp.annualSummary.borradorRenta.retencionIrpf.pagadoEuro,
      retencionCapital: comp.annualSummary.borradorRenta.retencionCapital.pagadoEuro,
      ssEmpleado: comp.annualSummary.borradorRenta.ssEmpleado.pagadoEuro,
      ssEmpresa: comp.annualSummary.borradorRenta.ssEmpresa.pagadoEuro,
      totalNetoNomina,
      totalGastado,
      expensesByCategory,
      expensesByType,
      inversiones: computedInversiones,
      totalInversionVenta,
      totalInversionCompra,
      totalInversionInteresBruto,
      totalInversionImpuestos,
      totalInversionImpuestosEspana,
      totalInversionImpuestosExtranjero,
      totalInversionComisiones,
      totalInversionNeto,
    };
  });

  // State mutations
  const updateActiveYearState = (updatedYearState: YearState) => {
    setAppState((prev) => ({
      ...prev,
      yearStates: {
        ...prev.yearStates,
        [prev.activeYear]: updatedYearState,
      },
    }));
  };

  const handleSelectYear = (yr: number) => {
    setAppState((prev) => ({
      ...prev,
      activeYear: yr,
    }));
  };

  const handleAddYear = () => {
    // Finds the next logical year (highest + 1)
    const maxYear = Math.max(...appState.years);
    const newY = maxYear + 1;

    // Clones the active year's data as the base template for the new year
    const clonedActive = JSON.parse(JSON.stringify(activeState)) as YearState;
    clonedActive.year = newY;

    setAppState((prev) => {
      const newYears = [...prev.years, newY].sort((a, b) => a - b);
      return {
        ...prev,
        years: newYears,
        activeYear: newY,
        yearStates: {
          ...prev.yearStates,
          [newY]: clonedActive,
        },
      };
    });
    showToast(`Año ${newY} creado clonando datos del ejercicio activo`, 'success');
  };

  const handleDeleteYear = (yr: number) => {
    if (appState.years.length <= 1) return;

    setAppState((prev) => {
      const newYears = prev.years.filter((y) => y !== yr);
      const newActive = prev.activeYear === yr ? newYears[0] : prev.activeYear;
      const newYearStates = { ...prev.yearStates };
      delete newYearStates[yr];

      return {
        ...prev,
        years: newYears,
        activeYear: newActive,
        yearStates: newYearStates,
      };
    });
    showToast(`Año ${yr} eliminado`, 'success');
  };

  const handleRenameYear = (oldYear: number, newYear: number): boolean => {
    if (appState.years.includes(newYear)) {
      showToast('Ese año ya existe', 'error');
      return false;
    }

    setAppState((prev) => {
      const newYears = prev.years.map((y) => (y === oldYear ? newYear : y)).sort((a, b) => a - b);
      const newActive = prev.activeYear === oldYear ? newYear : prev.activeYear;

      const newYearStates = { ...prev.yearStates };
      const currentData = { ...newYearStates[oldYear], year: newYear };
      delete newYearStates[oldYear];
      newYearStates[newYear] = currentData;

      return {
        ...prev,
        years: newYears,
        activeYear: newActive,
        yearStates: newYearStates,
      };
    });
    return true;
  };

  const handleUpdateEmployeeData = (monthId: MonthId, data: Partial<EmployeeData>) => {
    const yrState = { ...activeState };
    yrState.months[monthId].employee = {
      ...yrState.months[monthId].employee,
      ...data,
    };
    updateActiveYearState(yrState);
  };

  const handleUpdateInversiones = (inversiones: InvestmentRow[]) => {
    const yrState = { ...activeState };
    yrState.inversiones = inversiones;
    updateActiveYearState(yrState);
  };

  const handleUpdateTransfers = (transfers: Record<string, TransferRow[]>) => {
    const yrState = { ...activeState };
    yrState.transfers = transfers;
    updateActiveYearState(yrState);
  };

  const handleUpdateExpenses = (expenses: Record<string, ExpenseRow[]>) => {
    const yrState = { ...activeState };
    yrState.expenses = expenses;
    updateActiveYearState(yrState);
  };

  const handleCopyMonthData = (fromMonthId: MonthId, toMonthId: MonthId) => {
    const yrState = { ...activeState };
    // Deep clone the source month state
    const sourceMonth = JSON.parse(JSON.stringify(yrState.months[fromMonthId])) as MonthState;
    
    // Assign the cloned state to the target month
    yrState.months[toMonthId] = sourceMonth;
    
    updateActiveYearState(yrState);
    showToast(`Datos copiados de ${MONTH_LABELS[fromMonthId]} a ${MONTH_LABELS[toMonthId]}`, 'success');
  };

  // Add Dynamic Salary Concept
  const handleAddSalaryConcept = (monthId: MonthId) => {
    const yrState = { ...activeState };
    const mState = yrState.months[monthId];
    const newId = 'sal_custom_' + Date.now();
    const newConcept = {
      id: newId,
      name: 'Nuevo Concepto',
      precioHora: 0,
      isSystem: false,
      isEditable: true,
    };
    mState.salaryConcepts = [...mState.salaryConcepts, newConcept];
    updateActiveYearState(yrState);

    // Immediately trigger floating editor for renaming
    setEditingCell({
      monthId,
      type: 'salary',
      rowId: newId,
      field: 'name',
      label: 'Concepto',
      val: 'Nuevo Concepto',
      isText: true,
    });
  };

  // Delete Dynamic Salary Concept
  const handleDeleteSalaryConcept = (monthId: MonthId, id: string) => {
    const yrState = { ...activeState };
    const mState = yrState.months[monthId];
    mState.salaryConcepts = mState.salaryConcepts.filter((c) => c.id !== id);
    updateActiveYearState(yrState);
    showToast('Concepto eliminado', 'success');
  };

  // Add Dynamic Benefit
  const handleAddBenefitConcept = (monthId: MonthId) => {
    const yrState = { ...activeState };
    const mState = yrState.months[monthId];
    const newId = 'ben_custom_' + Date.now();
    const newConcept = {
      id: newId,
      name: 'Nuevo Beneficio',
      devengos: 0,
      isSystem: false,
    };
    mState.benefitConcepts = [...mState.benefitConcepts, newConcept];
    updateActiveYearState(yrState);

    // Trigger edit cell popover
    setEditingCell({
      monthId,
      type: 'benefit',
      rowId: newId,
      field: 'name',
      label: 'Beneficio',
      val: 'Nuevo Beneficio',
      isText: true,
    });
  };

  // Delete Dynamic Benefit
  const handleDeleteBenefitConcept = (monthId: MonthId, id: string) => {
    const yrState = { ...activeState };
    const mState = yrState.months[monthId];
    mState.benefitConcepts = mState.benefitConcepts.filter((c) => c.id !== id);
    updateActiveYearState(yrState);
    showToast('Beneficio eliminado', 'success');
  };

  // Add Custom Tax Exemption desgravación
  const handleAddDynamicExemption = () => {
    const yrState = { ...activeState };
    const newId = 'ex_custom_' + Date.now();
    const newEx = {
      id: newId,
      name: 'Nueva desgravación',
      estatal: 0,
      autonomico: 0,
    };
    yrState.taxExemptions.dynamicExemptions = [...yrState.taxExemptions.dynamicExemptions, newEx];
    updateActiveYearState(yrState);

    // Edit its name instantly
    setEditingCell({
      type: 'exemption_dynamic',
      rowId: newId,
      field: 'name',
      label: 'Nombre Deducción',
      val: 'Nueva desgravación',
      isText: true,
    });
  };

  const handleDeleteDynamicExemption = (id: string) => {
    const yrState = { ...activeState };
    yrState.taxExemptions.dynamicExemptions = yrState.taxExemptions.dynamicExemptions.filter((e) => e.id !== id);
    updateActiveYearState(yrState);
    showToast('Deducción eliminada', 'success');
  };

  // Floating Panel save handler
  const handleSaveFloatingPanel = (newValue: string | number) => {
    if (!editingCell) return;

    const { type, monthId, rowId, field, bracketIdx } = editingCell;
    const yrState = { ...activeState };

    switch (type) {
      case 'ss_config': {
        yrState.socialSecurityConfig = yrState.socialSecurityConfig.map((row) => {
          if (row.id === rowId) {
            return { ...row, [field]: Number(newValue) };
          }
          return row;
        });
        break;
      }
      case 'bracket_state': {
        const idx = bracketIdx!;
        const updatedBrackets = [...yrState.irpfStateBrackets];
        
        if (field === 'fin') {
          updatedBrackets[idx].fin = newValue === '' || newValue === null || isNaN(Number(newValue)) ? null : Number(newValue);
          // Auto cascade start coordinate to row N = row (N-1) + 0.01
          for (let i = 1; i < updatedBrackets.length; i++) {
            const prevFin = updatedBrackets[i - 1].fin;
            if (prevFin !== null) {
              updatedBrackets[i].inicio = parseFloat((prevFin + 0.01).toFixed(2));
            }
          }
        } else if (field === 'pct') {
          updatedBrackets[idx].pct = Number(newValue);
        } else if (field === 'inicio') {
          updatedBrackets[idx].inicio = Number(newValue);
        }
        yrState.irpfStateBrackets = updatedBrackets;
        break;
      }
      case 'bracket_regional': {
        const idx = bracketIdx!;
        const updatedBrackets = [...yrState.irpfRegionalBrackets];
        
        if (field === 'fin') {
          updatedBrackets[idx].fin = newValue === '' || newValue === null || isNaN(Number(newValue)) ? null : Number(newValue);
          for (let i = 1; i < updatedBrackets.length; i++) {
            const prevFin = updatedBrackets[i - 1].fin;
            if (prevFin !== null) {
              updatedBrackets[i].inicio = parseFloat((prevFin + 0.01).toFixed(2));
            }
          }
        } else if (field === 'pct') {
          updatedBrackets[idx].pct = Number(newValue);
        } else if (field === 'inicio') {
          updatedBrackets[idx].inicio = Number(newValue);
        }
        yrState.irpfRegionalBrackets = updatedBrackets;
        break;
      }
      case 'otros_beneficios': {
        yrState.otrosBeneficios = Number(newValue);
        break;
      }
      case 'rendimiento_trabajo': {
        yrState.rendimientoTrabajo = Number(newValue);
        break;
      }
      case 'exemption': {
        yrState.taxExemptions = {
          ...yrState.taxExemptions,
          [rowId]: Number(newValue),
        };
        break;
      }
      case 'exemption_dynamic': {
        yrState.taxExemptions.dynamicExemptions = yrState.taxExemptions.dynamicExemptions.map((dyn) => {
          if (dyn.id === rowId) {
            return { ...dyn, [field]: editingCell.isText ? String(newValue) : Number(newValue) };
          }
          return dyn;
        });
        break;
      }
      case 'salary': {
        const mId = monthId!;
        yrState.months[mId].salaryConcepts = yrState.months[mId].salaryConcepts.map((c) => {
          if (c.id === rowId) {
            return { ...c, [field]: editingCell.isText ? String(newValue) : Number(newValue) };
          }
          return c;
        });
        break;
      }
      case 'benefit': {
        const mId = monthId!;
        yrState.months[mId].benefitConcepts = yrState.months[mId].benefitConcepts.map((b) => {
          if (b.id === rowId) {
            return { ...b, [field]: editingCell.isText ? String(newValue) : Number(newValue) };
          }
          return b;
        });
        break;
      }
      case 'tax_empl': {
        const mId = monthId!;
        const prevOverride = yrState.months[mId].taxOverrides[rowId] || { id: rowId };
        yrState.months[mId].taxOverrides[rowId] = {
          ...prevOverride,
          pctEmpleadoOverride: Number(newValue),
        };
        break;
      }
      case 'tax_comp': {
        const mId = monthId!;
        const prevOverride = yrState.months[mId].taxOverrides[rowId] || { id: rowId };
        yrState.months[mId].taxOverrides[rowId] = {
          ...prevOverride,
          pctEmpresaOverride: Number(newValue),
        };
        break;
      }
    }

    updateActiveYearState(yrState);
    setEditingCell(null);
    showToast('Datos actualizados correctamente', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Fixed Top Header */}
      <Header
        appName="Gestor de Nóminas e IRPF"
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        appState={appState}
        onImportState={handleImportState}
        showToast={showToast}
      />

      {/* Sliding Navigation Sidebar */}
      <Sidenav
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={appState.activeView}
        onViewChange={(view: ActiveView) => {
          setAppState((prev) => ({ ...prev, activeView: view }));
        }}
      />

      {/* Main viewport Container (10% left/right margins on desktop as per rules) */}
      <main className="flex-1 pt-[70px] pb-12 px-4 md:px-[10%] max-w-[1600px] mx-auto w-full">
        {appState.activeView === 'dashboard' ? (
          
          /* Dashboard evolution chart and cards */
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Dashboard de Históricos
            </h2>
            <DashboardView summaries={dashboardSummaries} />
          </div>
          
        ) : appState.activeView === 'ahorros-gastos' ? (
          
          /* Savings & Expenses View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                  Gestión de Ahorros y Gastos
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Controla tus transferencias automáticas mensuales a otras entidades bancarias y planifica tu ahorro y gasto sin superar tu nómina neta.
                </p>
              </div>
            </div>

            {/* Years tabs (shared for seamless sync) */}
            <YearTabs
              years={appState.years}
              activeYear={appState.activeYear}
              onSelectYear={handleSelectYear}
              onAddYear={handleAddYear}
              onDeleteYear={handleDeleteYear}
              onRenameYear={handleRenameYear}
              showToast={showToast}
            />

            <SavingsExpensesView
              yearState={activeState}
              computedYear={computedYear}
              onUpdateTransfers={handleUpdateTransfers}
              onUpdateExpenses={handleUpdateExpenses}
              showToast={showToast}
            />
          </div>

        ) : (
          
          /* Main Workspace - Multi exercise accounting and monthly payroll logs */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                  Cuenta Anual de Nóminas
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Introduce los valores de tus nóminas mensuales y calcula las exenciones e IRPF anual de forma offline.
                </p>
              </div>
            </div>

            {/* Years tabs (ascending ordered) */}
            <YearTabs
              years={appState.years}
              activeYear={appState.activeYear}
              onSelectYear={handleSelectYear}
              onAddYear={handleAddYear}
              onDeleteYear={handleDeleteYear}
              onRenameYear={handleRenameYear}
              showToast={showToast}
            />

            {/* List of 14 Monthly Collapsible Accordion sections */}
            <MonthAccordion
              monthsData={activeState.months}
              monthsComputed={computedYear.months}
              accumulators={computedYear.accumulators}
              onUpdateEmployeeData={handleUpdateEmployeeData}
              onAddSalaryConcept={handleAddSalaryConcept}
              onDeleteSalaryConcept={handleDeleteSalaryConcept}
              onAddBenefitConcept={handleAddBenefitConcept}
              onDeleteBenefitConcept={handleDeleteBenefitConcept}
              onCopyMonthData={handleCopyMonthData}
              onTriggerEditCell={(params) => setEditingCell(params)}
            />

            {/* Final Renta Consolidated summary cards (SS, Exemptions, and Draft result) */}
            <div className="pt-4">
              <AnnualSummaryView
                yearState={activeState}
                computedYear={computedYear}
                onUpdateSocialSecurityRow={() => {}}
                onUpdateStateBracket={() => {}}
                onUpdateRegionalBracket={() => {}}
                onUpdateStateBracketInicio={() => {}}
                onUpdateRegionalBracketInicio={() => {}}
                onUpdateOtrosBeneficios={() => {}}
                onUpdateRendimientoTrabajo={() => {}}
                onUpdateExemptions={() => {}}
                onAddDynamicExemption={handleAddDynamicExemption}
                onDeleteDynamicExemption={handleDeleteDynamicExemption}
                onUpdateDynamicExemption={() => {}}
                onTriggerEditCell={(params) => setEditingCell(params)}
                onUpdateInversiones={handleUpdateInversiones}
              />
            </div>
          </div>
        )}
      </main>

      {/* Reusable Floating Cell Editor Popup Dialog */}
      {editingCell && (
        <FloatingEditPanel
          isOpen={true}
          title={`Modificar Celda`}
          subtitle={editingCell.label}
          fieldName={editingCell.isText ? 'Texto' : 'Valor numérico'}
          initialValue={editingCell.val}
          inputType={editingCell.isText ? 'text' : 'number'}
          onSave={handleSaveFloatingPanel}
          onClose={() => setEditingCell(null)}
        />
      )}

      {/* Toast Notification snackbar (bottom right) */}
      {toast && (
        <div
          id="toast-popup"
          className={`fixed bottom-4 right-4 px-4 py-2.5 rounded-lg shadow-xl text-white font-sans text-xs font-semibold flex items-center gap-2 z-50 transform translate-y-0 transition-transform duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
