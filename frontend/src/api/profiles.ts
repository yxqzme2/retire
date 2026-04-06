import apiClient from './client';
import type { Profile, ProfileCreate, ProfileUpdate } from '../types';

export async function getProfiles(): Promise<Profile[]> {
  const res = await apiClient.get<Profile[]>('/profiles/');
  return res.data;
}

export async function getProfile(id: number): Promise<Profile> {
  const res = await apiClient.get<Profile>(`/profiles/${id}`);
  return res.data;
}

export async function createProfile(data: ProfileCreate): Promise<Profile> {
  const res = await apiClient.post<Profile>('/profiles/', data);
  return res.data;
}

export async function updateProfile(id: number, data: ProfileUpdate): Promise<Profile> {
  const res = await apiClient.put<Profile>(`/profiles/${id}`, data);
  return res.data;
}
