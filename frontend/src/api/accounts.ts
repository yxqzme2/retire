import apiClient from './client';
import type { Account, AccountCreate, AccountUpdate } from '../types';

export async function getAccounts(scenarioId?: number): Promise<Account[]> {
  const params = scenarioId !== undefined ? { scenario_id: scenarioId } : {};
  const res = await apiClient.get<Account[]>('/accounts/', { params });
  return res.data;
}

export async function getAccount(id: number): Promise<Account> {
  const res = await apiClient.get<Account>(`/accounts/${id}`);
  return res.data;
}

export async function createAccount(data: AccountCreate): Promise<Account> {
  const res = await apiClient.post<Account>('/accounts/', data);
  return res.data;
}

export async function updateAccount(id: number, data: AccountUpdate): Promise<Account> {
  const res = await apiClient.put<Account>(`/accounts/${id}`, data);
  return res.data;
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient.delete(`/accounts/${id}`);
}
