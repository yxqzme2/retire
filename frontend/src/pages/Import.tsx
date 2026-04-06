import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, Download, FolderInput, CheckCircle2, XCircle, FileDown } from 'lucide-react';
import { previewImport, confirmImport, getImportHistory, getTemplateUrl, getExportUrl } from '../api/import_export';
import { useActiveScenarioStore } from '../hooks/useScenario';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import type { ImportType, ImportResult } from '../types';

const importTypeOptions = [
  { value: 'accounts', label: 'Accounts' },
  { value: 'income', label: 'Income Streams' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'assumptions', label: 'Assumptions' },
  { value: 'events', label: 'One-Time Events' },
];

export default function Import() {
  const { activeScenarioId } = useActiveScenarioStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<ImportType>('accounts');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; status: string } | null>(null);

  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: getImportHistory,
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setPreview(null);
    setImportResult(null);
    setIsPreviewing(true);
    try {
      const result = await previewImport(importType, file);
      setPreview(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile || !activeScenarioId) return;
    setIsUploading(true);
    try {
      const result = await confirmImport(importType, activeScenarioId, selectedFile, overwrite);
      setImportResult(result);
      setPreview(null);
      setSelectedFile(null);
      refetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <Card title="Import Data" subtitle="Upload CSV files to populate your scenario data">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <Select
              label="Import Type"
              options={importTypeOptions}
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as ImportType);
                setPreview(null);
                setSelectedFile(null);
              }}
            />
            <div className="flex flex-col justify-end">
              <a
                href={getTemplateUrl(importType)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                download
              >
                <Download size={14} />
                Template CSV
              </a>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40'}`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            <Upload size={28} className={`mx-auto mb-3 ${isDragging ? 'text-blue-400' : 'text-slate-600'}`} />
            {selectedFile ? (
              <p className="text-slate-300 font-medium">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-slate-400 font-medium">Drop CSV here or click to browse</p>
                <p className="text-slate-600 text-xs mt-1">Accepts .csv files</p>
              </>
            )}
          </div>

          {isPreviewing && <LoadingSpinner message="Parsing CSV..." />}

          {/* Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge color={preview.valid_rows > 0 ? 'emerald' : 'red'}>
                  {preview.valid_rows} valid row{preview.valid_rows !== 1 ? 's' : ''}
                </Badge>
                {preview.invalid_rows > 0 && <Badge color="amber">{preview.invalid_rows} invalid</Badge>}
              </div>

              {preview.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                  <p className="text-red-400 text-xs font-medium mb-1">Validation Errors:</p>
                  {preview.errors.slice(0, 5).map((err, i) => <p key={i} className="text-red-300 text-xs">{err}</p>)}
                  {preview.errors.length > 5 && <p className="text-red-400 text-xs mt-1">+{preview.errors.length - 5} more errors</p>}
                </div>
              )}

              {preview.preview.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-slate-500 text-xs mb-2">Preview (first {Math.min(10, preview.preview.length)} rows):</p>
                  <table className="w-full text-xs border border-slate-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-800">
                        {Object.keys(preview.preview[0]).slice(0, 6).map((k) => (
                          <th key={k} className="px-3 py-2 text-left text-slate-400 font-medium border-b border-slate-700 whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          {Object.values(row).slice(0, 6).map((v, j) => (
                            <td key={j} className="px-3 py-2 text-slate-300 truncate max-w-[120px]">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Toggle label="Overwrite existing data" checked={overwrite} onChange={setOverwrite} />
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={isUploading}
                  disabled={preview.valid_rows === 0 || !activeScenarioId}
                >
                  Import {preview.valid_rows} Row{preview.valid_rows !== 1 ? 's' : ''}
                </Button>
              </div>
              {!activeScenarioId && <p className="text-amber-400 text-xs">Select a scenario before importing.</p>}
            </div>
          )}

          {/* Result */}
          {importResult && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${importResult.status === 'success' ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-amber-900/20 border-amber-800/40'}`}>
              {importResult.status === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-amber-400" />}
              <p className="text-sm text-slate-200">
                Imported <strong>{importResult.imported}</strong> records
                {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Download templates */}
      <Card title="Download Templates">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {importTypeOptions.map((opt) => (
            <a
              key={opt.value}
              href={getTemplateUrl(opt.value as ImportType)}
              download
              className="flex flex-col items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-700/50 transition-all text-center"
            >
              <Download size={16} className="text-blue-400" />
              <span className="text-slate-300 text-xs font-medium">{opt.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Export Data */}
      <Card
        title="Export Data"
        subtitle="Download your scenario data as CSV files — useful for backup or editing outside the app"
      >
        {!activeScenarioId ? (
          <p className="text-amber-400 text-sm">Select a scenario from the sidebar to enable exports.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(
              [
                { type: 'accounts',     label: 'Accounts',         description: 'Balances, returns, contributions' },
                { type: 'income',       label: 'Income Streams',   description: 'Pension, SS, other income' },
                { type: 'expenses',     label: 'Expenses',         description: 'Recurring & one-time costs' },
                { type: 'assumptions',  label: 'Assumptions',      description: 'Rates, strategy, toggles' },
                { type: 'events',       label: 'One-Time Events',  description: 'Lump-sum inflows & outflows' },
              ] as const
            ).map(({ type, label, description }) => (
              <a
                key={type}
                href={getExportUrl(type as 'accounts' | 'income' | 'expenses', activeScenarioId)}
                download
                className="flex flex-col items-start gap-2 p-4 bg-slate-800 border border-slate-700 rounded-xl
                           hover:border-emerald-600/50 hover:bg-slate-700/60 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center
                                group-hover:bg-emerald-500/20 transition-colors">
                  <FileDown size={15} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium leading-tight">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">{description}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>

      {/* Import history */}
      <Card title="Import History">
        {historyLoading ? <LoadingSpinner /> : history.length === 0 ? (
          <EmptyState icon={<FolderInput size={20} />} title="No imports yet" description="Upload a CSV to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['File', 'Type', 'Imported', 'Skipped', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-slate-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2.5 pr-4 text-slate-200 truncate max-w-[150px]">{h.filename}</td>
                  <td className="py-2.5 pr-4"><Badge color="slate" size="sm">{h.import_type}</Badge></td>
                  <td className="py-2.5 pr-4 text-emerald-400 tabular-nums">{h.records_imported}</td>
                  <td className="py-2.5 pr-4 text-slate-500 tabular-nums">{h.records_skipped}</td>
                  <td className="py-2.5 pr-4">
                    <Badge color={h.status === 'success' ? 'emerald' : h.status === 'partial' ? 'amber' : 'red'} size="sm">{h.status}</Badge>
                  </td>
                  <td className="py-2.5 text-slate-500 text-xs">{new Date(h.imported_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
