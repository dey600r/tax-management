import React, { useRef } from 'react';
import { Menu, Download, Upload, Calculator } from 'lucide-react';
import { AppState } from '../types';

interface HeaderProps {
  appName: string;
  onToggleSidebar: () => void;
  appState: AppState;
  onImportState: (newState: AppState) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  onToggleSidebar,
  appState,
  onImportState,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON file
  const handleExport = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nominas_irpf_export_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Datos exportados correctamente', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error al exportar los datos', 'error');
    }
  };

  // Import JSON file
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const parsed = JSON.parse(fileContent);

        // Validation of canonical AppState structure
        if (
          parsed &&
          Array.isArray(parsed.years) &&
          typeof parsed.activeYear === 'number' &&
          parsed.yearStates &&
          typeof parsed.yearStates === 'object'
        ) {
          onImportState(parsed);
          showToast('Datos importados correctamente', 'success');
        } else {
          showToast('El archivo JSON no tiene el formato correcto', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error al leer o procesar el archivo JSON', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white text-slate-800 border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-xs">
      {/* Left side: toggle sidebar and brand */}
      <div className="flex items-center gap-4">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer focus:outline-none"
          title="Menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-white text-sm shadow-xs">
            GN
          </div>
          <span className="font-sans font-black tracking-tight text-slate-950 text-base md:text-lg hidden sm:inline">
            {appName}
          </span>
          <span className="font-sans font-black tracking-tight text-slate-950 text-base sm:hidden">
            Nóminas e IRPF
          </span>
        </div>
      </div>

      {/* Right side: export & import */}
      <div className="flex items-center gap-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
          id="input-import-file"
        />
        <button
          id="btn-import-data"
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Importar JSON"
        >
          <Upload className="w-4 h-4 text-slate-500" />
          <span className="hidden md:inline">Importar</span>
        </button>
        <button
          id="btn-export-data"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Exportar JSON"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Exportar</span>
        </button>
      </div>
    </header>
  );
};
