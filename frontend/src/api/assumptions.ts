import apiClient from './client';
import type { AssumptionSet, AssumptionSetUpdate } from '../types';

export async function getAssumptions(scenarioId: number): Promise<AssumptionSet> {
  const res = await apiClient.get<AssumptionSet>(`/assumptions/scenario/${scenarioId}`);
  return res.data;
}

export async function updateAssumptions(scenarioId: number, data: AssumptionSetUpdate): Promise<AssumptionSet> {
  const res = await apiClient.put<AssumptionSet>(`/assumptions/scenario/${scenarioId}`, data);
  return res.data;
}
