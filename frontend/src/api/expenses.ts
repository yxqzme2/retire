import apiClient from './client';
import type { ExpenseItem, ExpenseItemCreate, ExpenseItemUpdate } from '../types';

export async function getExpenses(scenarioId?: number): Promise<ExpenseItem[]> {
  const params = scenarioId !== undefined ? { scenario_id: scenarioId } : {};
  const res = await apiClient.get<ExpenseItem[]>('/expenses/', { params });
  return res.data;
}

export async function getExpense(id: number): Promise<ExpenseItem> {
  const res = await apiClient.get<ExpenseItem>(`/expenses/${id}`);
  return res.data;
}

export async function createExpense(data: ExpenseItemCreate): Promise<ExpenseItem> {
  const res = await apiClient.post<ExpenseItem>('/expenses/', data);
  return res.data;
}

export async function updateExpense(id: number, data: ExpenseItemUpdate): Promise<ExpenseItem> {
  const res = await apiClient.put<ExpenseItem>(`/expenses/${id}`, data);
  return res.data;
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}
