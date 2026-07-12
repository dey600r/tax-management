import React from 'react';

interface PartitionsChartProps {
  bruto: number;
  retencionesIrpf: number;
  ssEmpleado: number;
  ssEmpresa: number;
  neto: number;
}

export const PartitionsChart: React.FC<PartitionsChartProps> = ({
  bruto,
  retencionesIrpf,
  ssEmpleado,
  ssEmpresa,
  neto,
}) => {
  if (bruto <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Sin detalles disponibles
        </span>
        <span className="text-slate-400 text-xxs mt-1 text-center max-w-[200px]">
          Introduce ingresos en el salario base o beneficios para generar la partición.
        </span>
      </div>
    );
  }

  // Segment values (guaranteed positive or zero)
  const vIrpf = Math.max(0, retencionesIrpf);
  const vSsEmp = Math.max(0, ssEmpleado);
  const vSsCom = Math.max(0, ssEmpresa);
  const vNeto = Math.max(0, neto);

  const total = vIrpf + vSsEmp + vSsCom + vNeto;
  if (total <= 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-xs font-mono">
        No hay datos detallados
      </div>
    );
  }

  // Calculate percentages
  const pctIrpf = (vIrpf / bruto) * 100;
  const pctSsEmp = (vSsEmp / bruto) * 100;
  const pctSsCom = (vSsCom / bruto) * 100;
  const pctNeto = (vNeto / bruto) * 100;

  // Render variables for donut chart (Radius = 70, Circumference = 2 * PI * R = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.822

  const segments = [
    { label: 'Recibido (Neto)', value: vNeto, pct: pctNeto, color: '#2563eb' }, // blue-600
    { label: 'Retenciones IRPF', value: vIrpf, pct: pctIrpf, color: '#f43f5e' }, // rose-500
    { label: 'SS Empleado', value: vSsEmp, pct: pctSsEmp, color: '#f59e0b' }, // amber-500
    { label: 'SS Empresa', value: vSsCom, pct: pctSsCom, color: '#475569' }, // slate-600
  ];

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center p-4">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const segmentPercentage = seg.value / total;
            const strokeDasharray = `${segmentPercentage * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage) * circumference);
            accumulatedPercentage += segmentPercentage;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:stroke-[18px] cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute text-center">
          <span className="block text-xxs font-semibold uppercase tracking-wider text-slate-400">
            Total Bruto
          </span>
          <span className="block text-sm font-bold font-mono text-slate-800">
            {bruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full max-w-xs">
        {segments.map((seg, idx) => {
          if (seg.value <= 0) return null;
          return (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="font-sans font-medium text-slate-600">{seg.label}</span>
              </div>
              <div className="text-right font-mono font-semibold text-slate-800">
                <span>{seg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                <span className="text-xxs text-slate-400 ml-1.5">({seg.pct.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
