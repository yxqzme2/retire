import apiClient from './client';
import type { Scenario, ScenarioCreate, ScenarioSummary, ScenarioUpdate } from '../types';

export async function getScenarios(profileId?: number): Promise<ScenarioSummary[]> {
  const params = profileId !== undefined ? { profile_id: profileId } : {};
  const res = await apiClient.get<ScenarioSummary[]>('/scenarios/', { params });
  return res.data;
}

export async function getScenario(id: number): Promise<Scenario> {
  const res = await apiClient.get<Scenario>(`/scenarios/${id}`);
  return res.data;
}

export async function createScenario(data: ScenarioCreate): Promise<Scenario> {
  const res = await apiClient.post<Scenario>('/scenarios/', data);
  return res.data;
}

export async function updateScenario(id: number, data: ScenarioUpdate): Promise<Scenario> {
  const res = await apiClient.put<Scenario>(`/scenarios/${id}`, data);
  return res.data;
}

export async function deleteScenario(id: number): Promise<void> {
  await apiClient.delete(`/scenarios/${id}`);
}

export async function duplicateScenario(id: number): Promise<Scenario> {
  const res = await apiClient.post<Scenario>(`/scenarios/${id}/duplicate`);
  return res.data;
}
