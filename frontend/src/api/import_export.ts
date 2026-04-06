import apiClient from './client';
import type { ImportHistory, ImportResult, ImportType } from '../types';

export async function previewImport(importType: ImportType, file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<ImportResult>(`/import/${importType}/preview`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function confirmImport(
  importType: ImportType,
  scenarioId: number,
  file: File,
  overwrite = false,
): Promise<{ imported: number; skipped: number; errors: string[]; status: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(
    `/import/${importType}/confirm?scenario_id=${scenarioId}&overwrite=${overwrite}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}

export async function getImportHistory(): Promise<ImportHistory[]> {
  const res = await apiClient.get<ImportHistory[]>('/import/history');
  return res.data;
}

export function getTemplateUrl(importType: ImportType): string {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
  return `${base}/import/templates/${importType}`;
}

export function getExportUrl(exportType: 'accounts' | 'income' | 'expenses', scenarioId: number): string {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
  return `${base}/import/export/${exportType}?scenario_id=${scenarioId}`;
}
