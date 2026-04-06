import apiClient from './client';
import type { OneTimeEvent, OneTimeEventCreate, OneTimeEventUpdate } from '../types';

export async function getEvents(scenarioId?: number): Promise<OneTimeEvent[]> {
  const params = scenarioId !== undefined ? { scenario_id: scenarioId } : {};
  const res = await apiClient.get<OneTimeEvent[]>('/events/', { params });
  return res.data;
}

export async function getEvent(id: number): Promise<OneTimeEvent> {
  const res = await apiClient.get<OneTimeEvent>(`/events/${id}`);
  return res.data;
}

export async function createEvent(data: OneTimeEventCreate): Promise<OneTimeEvent> {
  const res = await apiClient.post<OneTimeEvent>('/events/', data);
  return res.data;
}

export async function updateEvent(id: number, data: OneTimeEventUpdate): Promise<OneTimeEvent> {
  const res = await apiClient.put<OneTimeEvent>(`/events/${id}`, data);
  return res.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}
