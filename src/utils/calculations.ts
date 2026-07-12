import {
  EmployeeData,
  SalaryConcept,
  BenefitConcept,
  MonthId,
  MonthState,
  SocialSecurityConfigRow,
  TaxBracket,
  TaxExemptions,
  YearState,
} from '../types';

export const MONTHS_ORDER: MonthId[] = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'extra1',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
  'extra2',
];

export const MONTH_LABELS: Record<MonthId, string> = {
  enero: 'Enero',
  febrero: 'Febrero',
  marzo: 'Marzo',
  abril: 'Abril',
  mayo: 'Mayo',
  junio: 'Junio',
  extra1: 'Paga Extra 1',
  julio: 'Julio',
  agosto: 'Agosto',
  septiembre: 'Septiembre',
  octubre: 'Octubre',
  noviembre: 'Noviembre',
  diciembre: 'Diciembre',
  extra2: 'Paga Extra 2',
};

// Default Spain 2026 Social Security Percentages
export const getDefaultSocialSecurityConfig = (): SocialSecurityConfigRow[] => [
  { id: 'desempleo', name: 'Desempleo', pctEmpleado: 1.55, pctEmpresa: 5.50 },
  { id: 'fp', name: 'Formación Profesional', pctEmpleado: 0.10, pctEmpresa: 0.60 },
  { id: 'cc', name: 'Contingencias Comunes', pctEmpleado: 4.70, pctEmpresa: 23.60 },
  { id: 'mei', name: 'MEI', pctEmpleado: 0.15, pctEmpresa: 0.75 },
  { id: 'fogasa', name: 'FOGASA', pctEmpleado: 0.00, pctEmpresa: 0.20 },
  { id: 'atep', name: 'AT/EP', pctEmpleado: 0.00, pctEmpresa: 1.50 },
];

// Default Spain 2026 Estatal Brackets
export const getDefaultEstatalBrackets = (): TaxBracket[] => [
  { inicio: 0, fin: 12449.99, pct: 9.50 },
  { inicio: 12450.00, fin: 20199.99, pct: 12.00 },
  { inicio: 20200.00, fin: 35199.99, pct: 15.00 },
  { inicio: 35200.00, fin: 59999.99, pct: 18.50 },
  { inicio: 60000.00, fin: 299999.99, pct: 22.50 },
  { inicio: 300000.00, fin: null, pct: 24.50 },
];

// Default Spain 2026 Regional Valencia Brackets
export const getDefaultRegionalBrackets = (): TaxBracket[] => [
  { inicio: 0, fin: 12449.99, pct: 9.50 },
  { inicio: 12450.00, fin: 20199.99, pct: 12.00 },
  { inicio: 20200.00, fin: 35199.99, pct: 15.00 },
  { inicio: 35200.00, fin: 59999.99, pct: 18.50 },
  { inicio: 60000.00, fin: 299999.99, pct: 22.50 },
  { inicio: 300000.00, fin: null, pct: 24.50 },
];

// Default Exemptions
export const getDefaultTaxExemptions = (): TaxExemptions => ({
  minimoPersonalEstatal: 5550.00,
  minimoPersonalAutonomico: 5956.65,
  descendientesEstatal: 0,
  descendientesAutonomico: 0,
  ascendientesEstatal: 0,
  ascendientesAutonomico: 0,
  minusvaliasEstatal: 0,
  minusvaliasAutonomico: 0,
  dynamicExemptions: [],
});

export const createDefaultEmployeeData = (): EmployeeData => ({
  nombre: '',
  numEmpleado: '',
  numDias: 30,
  pagasExtra: 2,
  horasExtra: 0,
  pctDeducibleSeguroMedico: 0,
  trienios: 0,
});

export const createDefaultSalaryConcepts = (): SalaryConcept[] => [
  { id: 'sueldo', name: 'Sueldo Base', precioHora: 50.00, isSystem: true, isEditable: true },
  { id: 'antiguedad', name: 'Antiguedad', precioHora: 0, isSystem: true, isEditable: false },
  { id: 'plus_convenio', name: 'PLUS Convenio', precioHora: 5.00, isSystem: true, isEditable: true },
  { id: 'plus_voluntario', name: 'PLUS Voluntario', precioHora: 10.00, isSystem: true, isEditable: true },
  { id: 'no_competencia', name: 'Pacto no competencia', precioHora: 4.00, isSystem: true, isEditable: true },
  { id: 'dedicacion_plena', name: 'Dedicación plena', precioHora: 6.00, isSystem: true, isEditable: true },
];

export const createDefaultBenefitConcepts = (): BenefitConcept[] => [
  { id: 'seguro_medico', name: 'Seguro Médico', devengos: -41.67, isSystem: true },
  { id: 'tickets', name: 'Tickets', devengos: 48.00, isSystem: true },
  { id: 'seguro_vida', name: 'Seguro Vida', devengos: 7.78, isSystem: true },
];

export const createDefaultMonthState = (): MonthState => ({
  employee: createDefaultEmployeeData(),
  salaryConcepts: createDefaultSalaryConcepts(),
  benefitConcepts: createDefaultBenefitConcepts(),
  taxOverrides: {},
});

export const createDefaultYearState = (year: number): YearState => {
  const months = {} as Record<MonthId, MonthState>;
  MONTHS_ORDER.forEach((mId) => {
    months[mId] = createDefaultMonthState();
  });
  return {
    year,
    months,
    socialSecurityConfig: getDefaultSocialSecurityConfig(),
    irpfStateBrackets: getDefaultEstatalBrackets(),
    irpfRegionalBrackets: getDefaultRegionalBrackets(),
    otrosBeneficios: 0,
    rendimientoTrabajo: 2000,
    taxExemptions: getDefaultTaxExemptions(),
  };
};

/**
 * Perform all calculations for a single month.
 */
export interface ComputedMonthResult {
  monthId: MonthId;
  salaryBaseRows: { id: string; name: string; precioHora: number; devengos: number }[];
  salaryBaseTotalPrecioHora: number;
  salaryBaseTotalDevengos: number;
  benefitsRows: { id: string; name: string; devengos: number; deducciones: number }[];
  benefitsTotalDevengos: number;
  benefitsTotalDeducciones: number;
  prorrataExtras: number;
  baseSS: number;
  baseIRPF: number;
  taxesRows: {
    id: string;
    name: string;
    base: number;
    pctEmpleado: number;
    deduccionEmpleado: number;
    pctEmpresa: number;
    empresa: number;
  }[];
  taxesTotalPctEmpleado: number;
  taxesTotalDeduccionEmpleado: number;
  taxesTotalPctEmpresa: number;
  taxesTotalEmpresa: number;
  bruto: number;
  deducciones: number;
  neto: number;
}

export function computeMonth(
  monthId: MonthId,
  state: MonthState,
  ssConfig: SocialSecurityConfigRow[]
): ComputedMonthResult {
  const { employee, salaryConcepts, benefitConcepts, taxOverrides } = state;
  const numDias = employee.numDias <= 0 ? 0 : employee.numDias;

  // 1. Calculate Antiguedad Row
  const sueldoBaseConcept = salaryConcepts.find((c) => c.id === 'sueldo');
  const sueldoBasePrecio = sueldoBaseConcept ? sueldoBaseConcept.precioHora : 0;
  const antiguedadPrecio = (sueldoBasePrecio / 20) * employee.trienios;

  // Map concepts to computed rows
  const salaryBaseRows = salaryConcepts.map((c) => {
    let precio = c.precioHora;
    if (c.id === 'antiguedad') {
      precio = antiguedadPrecio;
    }
    const devengos = numDias * precio;
    return {
      id: c.id,
      name: c.name,
      precioHora: precio,
      devengos,
    };
  });

  const salaryBaseTotalPrecioHora = salaryBaseRows.reduce((acc, r) => acc + r.precioHora, 0);
  const salaryBaseTotalDevengos = salaryBaseRows.reduce((acc, r) => acc + r.devengos, 0);

  // 2. Calculate Benefits
  const benefitsRows = benefitConcepts.map((b) => {
    let deducciones = b.devengos;
    if (b.id === 'seguro_medico') {
      deducciones = (b.devengos * employee.pctDeducibleSeguroMedico) / 100;
    }
    return {
      id: b.id,
      name: b.name,
      devengos: b.devengos,
      deducciones,
    };
  });

  const benefitsTotalDevengos = benefitsRows.reduce((acc, r) => acc + r.devengos, 0);
  const benefitsTotalDeducciones = benefitsRows.reduce((acc, r) => acc + r.deducciones, 0);

  // 3. Prorrata Extras
  // Only use Sueldo Base, Antiguedad, PLUS Convenio, PLUS Voluntario, Pacto no competencia, Dedicación plena
  const listProrrataIds = ['sueldo', 'antiguedad', 'plus_convenio', 'plus_voluntario', 'no_competencia', 'dedicacion_plena'];
  const baseForProrrata = salaryBaseRows
    .filter((r) => listProrrataIds.includes(r.id))
    .reduce((acc, r) => acc + r.devengos, 0);
  
  const prorrataExtras = employee.pagasExtra > 0 ? (baseForProrrata * employee.pagasExtra) / 12 : 0;

  // 4. Bases for Taxes
  const seguroMedicoDevengos = benefitConcepts.find((b) => b.id === 'seguro_medico')?.devengos || 0;
  
  // Base SS formula: (TOTAL Salario Base + TOTAL Beneficios) - Seguro Medico + Prorrata Extras
  const rawBaseSS = (salaryBaseTotalDevengos + benefitsTotalDevengos) - seguroMedicoDevengos + prorrataExtras;
  const baseSS = rawBaseSS < 0 ? 0 : rawBaseSS;

  // Base IRPF formula: TOTAL Salario Base + Seguro Medico devengos
  const baseIRPF = salaryBaseTotalDevengos + seguroMedicoDevengos;

  // 5. Impuestos Table
  const taxesRows: ComputedMonthResult['taxesRows'] = [];

  // Add SS rows
  ssConfig.forEach((row) => {
    const override = taxOverrides[row.id];
    const pctEmpleado = override?.pctEmpleadoOverride !== undefined ? override.pctEmpleadoOverride : row.pctEmpleado;
    const pctEmpresa = override?.pctEmpresaOverride !== undefined ? override.pctEmpresaOverride : row.pctEmpresa;

    const deduccionEmpleado = parseFloat(((baseSS * pctEmpleado) / 100).toFixed(2));
    const empresa = parseFloat(((baseSS * pctEmpresa) / 100).toFixed(2));

    taxesRows.push({
      id: row.id,
      name: row.name,
      base: baseSS,
      pctEmpleado,
      deduccionEmpleado,
      pctEmpresa,
      empresa,
    });
  });

  // Add IRPF row
  const irpfOverride = taxOverrides['irpf'];
  const pctEmpleadoIRPF = irpfOverride?.pctEmpleadoOverride !== undefined ? irpfOverride.pctEmpleadoOverride : 22.22;
  const deduccionEmpleadoIRPF = parseFloat(((baseIRPF * pctEmpleadoIRPF) / 100).toFixed(2));

  taxesRows.push({
    id: 'irpf',
    name: 'IRPF',
    base: baseIRPF,
    pctEmpleado: pctEmpleadoIRPF,
    deduccionEmpleado: deduccionEmpleadoIRPF,
    pctEmpresa: 0,
    empresa: 0,
  });

  const taxesTotalPctEmpleado = taxesRows.reduce((acc, r) => acc + r.pctEmpleado, 0);
  const taxesTotalDeduccionEmpleado = taxesRows.reduce((acc, r) => acc + r.deduccionEmpleado, 0);
  const taxesTotalPctEmpresa = taxesRows.reduce((acc, r) => acc + r.pctEmpresa, 0);
  const taxesTotalEmpresa = taxesRows.reduce((acc, r) => acc + r.empresa, 0);

  // 6. Resumen mensual
  const bruto = salaryBaseTotalDevengos + benefitsTotalDevengos;
  const deducciones = benefitsTotalDeducciones + taxesTotalDeduccionEmpleado;
  const neto = bruto - deducciones;

  return {
    monthId,
    salaryBaseRows,
    salaryBaseTotalPrecioHora,
    salaryBaseTotalDevengos,
    benefitsRows,
    benefitsTotalDevengos,
    benefitsTotalDeducciones,
    prorrataExtras,
    baseSS,
    baseIRPF,
    taxesRows,
    taxesTotalPctEmpleado,
    taxesTotalDeduccionEmpleado,
    taxesTotalPctEmpresa,
    taxesTotalEmpresa,
    bruto,
    deducciones,
    neto,
  };
}

/**
 * Compute calculations and time-series accumulators for all months of a year.
 */
export interface ComputedMonthAccumulatorRow {
  monthId: MonthId;
  label: string;
  thisMonth: {
    imponibleIrpf: number;
    retencionesIrpf: number;
    ssEmpleado: number;
    ssEmpresa: number;
    recibido: number;
  };
  accum: {
    imponibleIrpf: number;
    retencionesIrpf: number;
    ssEmpleado: number;
    ssEmpresa: number;
    recibido: number;
  };
}

export interface ComputedYearResult {
  year: number;
  months: Record<MonthId, ComputedMonthResult>;
  accumulators: ComputedMonthAccumulatorRow[];
  annualSummary: {
    salarioBruto: number;
    otrosBeneficios: number;
    totalIngresos: number;
    exenciones: {
      totalEstatal: number;
      totalAutonomico: number;
      impuestosEstatal: number;
      impuestosAutonomico: number;
    };
    baseCotizacion: {
      rendimientoTrabajoTotal: number;
      rendimientoTrabajoPagado: number;
      ssEmpleadoTotal: number;
      ssEmpleadoPagado: number;
      ssEmpresaTotal: number;
      ssEmpresaPagado: number;
      totalBaseColTotal: number;
      totalBaseColPagado: number;
      baseIrpfTotal: number;
      baseIrpfPagado: number;
    };
    irpfNecesario: {
      estatalEuro: number;
      estatalPct: number;
      autonomicoEuro: number;
      autonomicoPct: number;
      totalEuro: number;
      totalPct: number;
      difference: number;
    };
    borradorRenta: {
      retencionIrpf: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
      retencionCapital: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
      cuotasLiquidas: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
      ssEmpleado: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
      ssEmpresa: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
      total: { pagadoEuro: number; pagadoPct: number; borradorEuro: number };
    };
  };
}

export function computeYear(yearState: YearState): ComputedYearResult {
  const monthsComputed = {} as Record<MonthId, ComputedMonthResult>;

  // Compute individual months first
  MONTHS_ORDER.forEach((mId) => {
    monthsComputed[mId] = computeMonth(mId, yearState.months[mId], yearState.socialSecurityConfig);
  });

  // Calculate chronological accumulators
  const accumulators: ComputedMonthAccumulatorRow[] = [];
  let accumImponibleIrpf = 0;
  let accumRetencionesIrpf = 0;
  let accumSsEmpleado = 0;
  let accumSsEmpresa = 0;
  let accumRecibido = 0;

  MONTHS_ORDER.forEach((mId) => {
    const r = monthsComputed[mId];
    
    // Imponible IRPF = Base IRPF from Table "IMPUESTOS"
    const thisMonthImponible = r.baseIRPF;
    // Retenciones IRPF = Deducción Empleado IRPF from Table "IMPUESTOS"
    const thisMonthRetenciones = r.taxesRows.find((t) => t.id === 'irpf')?.deduccionEmpleado || 0;
    // SS Empleado = Total taxes deduction - IRPF deduction
    const thisMonthSSEmpleado = Math.max(0, r.taxesTotalDeduccionEmpleado - thisMonthRetenciones);
    // SS Empresa = Total company taxes
    const thisMonthSSEmpresa = r.taxesTotalEmpresa;
    // Recibido = Neto
    const thisMonthRecibido = r.neto;

    accumImponibleIrpf += thisMonthImponible;
    accumRetencionesIrpf += thisMonthRetenciones;
    accumSsEmpleado += thisMonthSSEmpleado;
    accumSsEmpresa += thisMonthSSEmpresa;
    accumRecibido += thisMonthRecibido;

    accumulators.push({
      monthId: mId,
      label: MONTH_LABELS[mId],
      thisMonth: {
        imponibleIrpf: thisMonthImponible,
        retencionesIrpf: thisMonthRetenciones,
        ssEmpleado: thisMonthSSEmpleado,
        ssEmpresa: thisMonthSSEmpresa,
        recibido: thisMonthRecibido,
      },
      accum: {
        imponibleIrpf: accumImponibleIrpf,
        retencionesIrpf: accumRetencionesIrpf,
        ssEmpleado: accumSsEmpleado,
        ssEmpresa: accumSsEmpresa,
        recibido: accumRecibido,
      },
    });
  });

  const lastAccum = accumulators[accumulators.length - 1].accum;

  // --- Annual Summary ---

  // 1. Resumen de nóminas
  const salarioBruto = lastAccum.imponibleIrpf; // Accumulated of Imponible IRPF in Extra2
  const otrosBeneficios = yearState.otrosBeneficios;
  const totalIngresos = salarioBruto + otrosBeneficios;

  // 2. Exenciones
  const exemptions = yearState.taxExemptions;
  const totalExemptionsEstatal =
    exemptions.minimoPersonalEstatal +
    exemptions.descendientesEstatal +
    exemptions.ascendientesEstatal +
    exemptions.minusvaliasEstatal +
    exemptions.dynamicExemptions.reduce((acc, curr) => acc + curr.estatal, 0);

  const totalExemptionsAutonomico =
    exemptions.minimoPersonalAutonomico +
    exemptions.descendientesAutonomico +
    exemptions.ascendientesAutonomico +
    exemptions.minusvaliasAutonomico +
    exemptions.dynamicExemptions.reduce((acc, curr) => acc + curr.autonomico, 0);

  const firstEstatalBracketRate = yearState.irpfStateBrackets[0]?.pct || 0;
  const firstRegionalBracketRate = yearState.irpfRegionalBrackets[0]?.pct || 0;

  const exemptionTaxesEstatal = (totalExemptionsEstatal * firstEstatalBracketRate) / 100;
  const exemptionTaxesAutonomico = (totalExemptionsAutonomico * firstRegionalBracketRate) / 100;

  // 3. Base de Cotización
  const totalSSPctEmpleado = yearState.socialSecurityConfig.reduce((acc, curr) => acc + curr.pctEmpleado, 0);
  const totalSSPctEmpresa = yearState.socialSecurityConfig.reduce((acc, curr) => acc + curr.pctEmpresa, 0);

  const rendimientoTrabajoTotal = yearState.rendimientoTrabajo;
  const rendimientoTrabajoPagado = rendimientoTrabajoTotal;

  const ssEmpleadoTotal = (totalIngresos * totalSSPctEmpleado) / 100;
  const ssEmpleadoPagado = lastAccum.ssEmpleado;

  const ssEmpresaTotal = (totalIngresos * totalSSPctEmpresa) / 100;
  const ssEmpresaPagado = lastAccum.ssEmpresa;

  const totalBaseColTotal = rendimientoTrabajoTotal + ssEmpleadoTotal;
  const totalBaseColPagado = rendimientoTrabajoPagado + ssEmpleadoPagado;

  const baseIrpfTotal = totalIngresos - totalBaseColTotal;
  const baseIrpfPagado = totalIngresos - totalBaseColPagado;

  // 4. IRPF Necesario
  // Calculate progressive brackets tax
  const taxEstatalFromBrackets = calculateProgressiveTax(baseIrpfTotal, yearState.irpfStateBrackets);
  const taxRegionalFromBrackets = calculateProgressiveTax(baseIrpfTotal, yearState.irpfRegionalBrackets);

  const estatalEuro = Math.max(0, taxEstatalFromBrackets - exemptionTaxesEstatal);
  const estatalPct = baseIrpfTotal > 0 ? (estatalEuro / baseIrpfTotal) * 100 : 0;

  const autonomicoEuro = Math.max(0, taxRegionalFromBrackets - exemptionTaxesAutonomico);
  const autonomicoPct = baseIrpfTotal > 0 ? (autonomicoEuro / baseIrpfTotal) * 100 : 0;

  const irpfNecesarioTotalEuro = estatalEuro + autonomicoEuro;
  const irpfNecesarioTotalPct = estatalPct + autonomicoPct;
  const actualIrpfRetainedInMonths = lastAccum.retencionesIrpf;
  const irpfNecesarioDifference = irpfNecesarioTotalEuro - actualIrpfRetainedInMonths;

  // 5. Borrador Renta Table (results-calculations)
  // Row 1: Retención IRPF
  const bRetencionIrpfPagadoEuro = actualIrpfRetainedInMonths;
  const bRetencionIrpfPagadoPct = totalIngresos > 0 ? (bRetencionIrpfPagadoEuro / totalIngresos) * 100 : 0;
  const bRetencionIrpfBorradorEuro = irpfNecesarioTotalEuro - bRetencionIrpfPagadoEuro;

  // Row 2: Retención Capital
  const bRetencionCapitalPagadoEuro = 0;
  const bRetencionCapitalPagadoPct = 0;
  const bRetencionCapitalBorradorEuro = 0;

  // Row 3: CUOTAS LIQUIDAS
  const bCuotasLiquidasPagadoEuro = bRetencionIrpfPagadoEuro + bRetencionCapitalPagadoEuro;
  const bCuotasLiquidasPagadoPct = totalIngresos > 0 ? (bCuotasLiquidasPagadoEuro / totalIngresos) * 100 : 0;
  const bCuotasLiquidasBorradorEuro = bRetencionIrpfBorradorEuro + bRetencionCapitalBorradorEuro;

  // Row 4: SS Empleado
  const bSsEmpleadoPagadoEuro = ssEmpleadoPagado;
  const bSsEmpleadoPagadoPct = totalIngresos > 0 ? (bSsEmpleadoPagadoEuro / totalIngresos) * 100 : 0;
  const bSsEmpleadoBorradorEuro = ssEmpleadoTotal - bSsEmpleadoPagadoEuro;

  // Row 5: SS Empresa
  const bSsEmpresaPagadoEuro = ssEmpresaPagado;
  const bSsEmpresaPagadoPct = totalIngresos > 0 ? (bSsEmpresaPagadoEuro / totalIngresos) * 100 : 0;
  const bSsEmpresaBorradorEuro = ssEmpresaTotal - bSsEmpresaPagadoEuro;

  // Row 6: TOTAL (Consolidated draft)
  const bTotalPagadoEuro = bCuotasLiquidasPagadoEuro + bSsEmpleadoPagadoEuro + bSsEmpresaPagadoEuro;
  const bTotalPagadoPct = bCuotasLiquidasPagadoPct + bSsEmpleadoPagadoPct + bSsEmpresaPagadoPct;
  const bTotalBorradorEuro = bCuotasLiquidasBorradorEuro + bSsEmpleadoBorradorEuro + bSsEmpresaBorradorEuro;

  return {
    year: yearState.year,
    months: monthsComputed,
    accumulators,
    annualSummary: {
      salarioBruto,
      otrosBeneficios,
      totalIngresos,
      exenciones: {
        totalEstatal: totalExemptionsEstatal,
        totalAutonomico: totalExemptionsAutonomico,
        impuestosEstatal: exemptionTaxesEstatal,
        impuestosAutonomico: exemptionTaxesAutonomico,
      },
      baseCotizacion: {
        rendimientoTrabajoTotal,
        rendimientoTrabajoPagado,
        ssEmpleadoTotal,
        ssEmpleadoPagado,
        ssEmpresaTotal,
        ssEmpresaPagado,
        totalBaseColTotal,
        totalBaseColPagado,
        baseIrpfTotal,
        baseIrpfPagado,
      },
      irpfNecesario: {
        estatalEuro,
        estatalPct,
        autonomicoEuro,
        autonomicoPct,
        totalEuro: irpfNecesarioTotalEuro,
        totalPct: irpfNecesarioTotalPct,
        difference: irpfNecesarioDifference,
      },
      borradorRenta: {
        retencionIrpf: {
          pagadoEuro: bRetencionIrpfPagadoEuro,
          pagadoPct: bRetencionIrpfPagadoPct,
          borradorEuro: bRetencionIrpfBorradorEuro,
        },
        retencionCapital: {
          pagadoEuro: bRetencionCapitalPagadoEuro,
          pagadoPct: bRetencionCapitalPagadoPct,
          borradorEuro: bRetencionCapitalBorradorEuro,
        },
        cuotasLiquidas: {
          pagadoEuro: bCuotasLiquidasPagadoEuro,
          pagadoPct: bCuotasLiquidasPagadoPct,
          borradorEuro: bCuotasLiquidasBorradorEuro,
        },
        ssEmpleado: {
          pagadoEuro: bSsEmpleadoPagadoEuro,
          pagadoPct: bSsEmpleadoPagadoPct,
          borradorEuro: bSsEmpleadoBorradorEuro,
        },
        ssEmpresa: {
          pagadoEuro: bSsEmpresaPagadoEuro,
          pagadoPct: bSsEmpresaPagadoPct,
          borradorEuro: bSsEmpresaBorradorEuro,
        },
        total: {
          pagadoEuro: bTotalPagadoEuro,
          pagadoPct: bTotalPagadoPct,
          borradorEuro: bTotalBorradorEuro,
        },
      },
    },
  };
}

/**
 * Calculates progressive tax according to Spanish tax brackets.
 */
export function calculateProgressiveTax(taxableBase: number, brackets: TaxBracket[]): number {
  if (taxableBase <= 0) return 0;
  let taxSum = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const inicio = bracket.inicio;
    const fin = bracket.fin;
    const pct = bracket.pct;

    if (taxableBase > inicio) {
      const taxableInBracket = fin === null ? taxableBase - inicio : Math.min(taxableBase, fin) - inicio;
      if (taxableInBracket > 0) {
        taxSum += (taxableInBracket * pct) / 100;
      }
    }
  }

  return parseFloat(taxSum.toFixed(2));
}
