import apiClient from './client';
import type { IncomeStream, IncomeStreamCreate, IncomeStreamUpdate } from '../types';

export async function getIncomeStreams(scenarioId?: number): Promise<IncomeStream[]> {
  const params = scenarioId !== undefined ? { scenario_id: scenarioId } : {};
  const res = await apiClient.get<IncomeStream[]>('/income/', { params });
  return res.data;
}

export async function getIncomeStream(id: number): Promise<IncomeStream> {
  const res = await apiClient.get<IncomeStream>(`/income/${id}`);
  return res.data;
}

export async function createIncomeStream(data: IncomeStreamCreate): Promise<IncomeStream> {
  const res = await apiClient.post<IncomeStream>('/income/', data);
  return res.data;
}

export async function updateIncomeStream(id: number, data: IncomeStreamUpdate): Promise<IncomeStream> {
  const res = await apiClient.put<IncomeStream>(`/income/${id}`, data);
  return res.data;
}

export async function deleteIncomeStream(id: number): Promise<void> {
  await apiClient.delete(`/income/${id}`);
}
