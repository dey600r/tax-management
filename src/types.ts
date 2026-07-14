export type ActiveView = 'dashboard' | 'cuenta-anual' | 'ahorros-gastos';

export interface EmployeeData {
  nombre: string;
  numEmpleado: string;
  numDias: number;
  pagasExtra: number;
  horasExtra: number;
  pctDeducibleSeguroMedico: number;
  trienios: number;
}

export interface SalaryConcept {
  id: string;
  name: string;
  precioHora: number;
  isSystem: boolean; // default rows
  isEditable: boolean; // Antiguedad is not editable
}

export interface BenefitConcept {
  id: string;
  name: string;
  devengos: number;
  isSystem: boolean;
}

export interface TaxConceptOverride {
  id: string;
  pctEmpleadoOverride?: number;
  pctEmpresaOverride?: number;
}

export type MonthId =
  | 'enero'
  | 'febrero'
  | 'marzo'
  | 'abril'
  | 'mayo'
  | 'junio'
  | 'extra1'
  | 'julio'
  | 'agosto'
  | 'septiembre'
  | 'octubre'
  | 'noviembre'
  | 'diciembre'
  | 'extra2';

export interface MonthState {
  employee: EmployeeData;
  salaryConcepts: SalaryConcept[];
  benefitConcepts: BenefitConcept[];
  taxOverrides: Record<string, TaxConceptOverride>;
}

export interface TaxBracket {
  inicio: number;
  fin: number | null; // null represents infinite
  pct: number;
}

export interface TaxExemptions {
  minimoPersonalEstatal: number;
  minimoPersonalAutonomico: number;
  descendientesEstatal: number;
  descendientesAutonomico: number;
  ascendientesEstatal: number;
  ascendientesAutonomico: number;
  minusvaliasEstatal: number;
  minusvaliasAutonomico: number;
  dynamicExemptions: {
    id: string;
    name: string;
    estatal: number;
    autonomico: number;
  }[];
}

export interface SocialSecurityConfigRow {
  id: string;
  name: string;
  pctEmpleado: number;
  pctEmpresa: number;
}

export interface InvestmentRow {
  id: string;
  banco: string;
  venta: number;
  compra: number;
  interesBruto: number;
  impuestosEspana: number;
  impuestosExtranjero: number;
  comisiones: number;
  comisionDeducible: boolean;
}

export interface TransferRow {
  id: string;
  cuentaOrigen: string;
  cuentaDestino: string;
  concepto: string;
  tipo: 'Gasto Fijo' | 'Gasto Estimado' | 'Inversion Fija' | 'Inversion Estimada' | 'Ahorro';
  importe: number;
}

export interface YearState {
  year: number;
  months: Record<MonthId, MonthState>;
  socialSecurityConfig: SocialSecurityConfigRow[];
  irpfStateBrackets: TaxBracket[];
  irpfRegionalBrackets: TaxBracket[];
  otrosBeneficios: number;
  rendimientoTrabajo: number;
  taxExemptions: TaxExemptions;
  inversiones?: InvestmentRow[];
  transfers?: Record<string, TransferRow[]>; // key is monthId
}

export interface AppState {
  years: number[];
  activeYear: number;
  activeView: ActiveView;
  yearStates: Record<number, YearState>;
}
