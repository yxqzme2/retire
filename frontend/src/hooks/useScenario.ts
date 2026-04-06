import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getScenarios,
  getScenario,
  createScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
} from '../api/scenarios';
import type { ScenarioCreate, ScenarioUpdate } from '../types';
import { useAppStore } from '../store/store';

// ─── Active scenario store (delegates to Zustand) ─────────────────────────────

/**
 * Thin adapter so existing callers keep the same API surface while the
 * underlying implementation is now the Zustand-persisted store in store.ts.
 */
export function useActiveScenarioStore() {
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);

  return {
    activeScenarioId,
    // Preserve the previous name so no callsites need to change
    setActiveScenarioId: setActiveScenario,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useScenarios(profileId?: number) {
  return useQuery({
    queryKey: ['scenarios', profileId],
    queryFn: () => getScenarios(profileId),
    staleTime: 30_000,
  });
}

export function useScenario(scenarioId: number | null) {
  return useQuery({
    queryKey: ['scenario', scenarioId],
    queryFn: () => getScenario(scenarioId!),
    enabled: scenarioId != null,
    staleTime: 30_000,
  });
}

export function useActiveScenario() {
  const { activeScenarioId } = useActiveScenarioStore();
  return useScenario(activeScenarioId);
}

export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScenarioCreate) => createScenario(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scenarios'] }),
  });
}

export function useUpdateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScenarioUpdate }) => updateScenario(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['scenarios'] });
      qc.invalidateQueries({ queryKey: ['scenario', id] });
    },
  });
}

export function useDeleteScenario() {
  const qc = useQueryClient();
  const { activeScenarioId, setActiveScenarioId } = useActiveScenarioStore();
  return useMutation({
    mutationFn: (id: number) => deleteScenario(id),
    onSuccess: (_, id) => {
      if (activeScenarioId === id) setActiveScenarioId(null);
      qc.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useDuplicateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => duplicateScenario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scenarios'] }),
  });
}
