import apiClient from './client';
import type { ProjectionResult, ProjectionSummary } from '../types';

export async function runProjection(scenarioId: number): Promise<ProjectionSummary> {
  const res = await apiClient.post<ProjectionSummary>(`/projections/scenarios/${scenarioId}/run`);
  return res.data;
}

export async function getProjectionResults(scenarioId: number): Promise<ProjectionResult[]> {
  const res = await apiClient.get<ProjectionResult[]>(`/projections/scenarios/${scenarioId}/results`);
  return res.data;
}

export async function getProjectionSummary(scenarioId: number): Promise<ProjectionSummary> {
  const res = await apiClient.get<ProjectionSummary>(`/projections/scenarios/${scenarioId}/summary`);
  return res.data;
}
