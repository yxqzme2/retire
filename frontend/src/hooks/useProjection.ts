import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runProjection, getProjectionResults, getProjectionSummary } from '../api/projections';
import { useActiveScenarioStore } from './useScenario';

export function useProjectionResults(scenarioId: number | null) {
  return useQuery({
    queryKey: ['projection-results', scenarioId],
    queryFn: () => getProjectionResults(scenarioId!),
    enabled: scenarioId != null,
    staleTime: 60_000,
    retry: false,
  });
}

export function useProjectionSummary(scenarioId: number | null) {
  return useQuery({
    queryKey: ['projection-summary', scenarioId],
    queryFn: () => getProjectionSummary(scenarioId!),
    enabled: scenarioId != null,
    staleTime: 60_000,
    retry: false,
  });
}

export function useProjection(scenarioId: number | null) {
  const results = useProjectionResults(scenarioId);
  const summary = useProjectionSummary(scenarioId);
  return { results, summary };
}

export function useRunProjection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scenarioId: number) => runProjection(scenarioId),
    onSuccess: (_, scenarioId) => {
      qc.invalidateQueries({ queryKey: ['projection-results', scenarioId] });
      qc.invalidateQueries({ queryKey: ['projection-summary', scenarioId] });
      qc.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

// Convenience hook that uses the active scenario
export function useActiveProjection() {
  const { activeScenarioId } = useActiveScenarioStore();
  return useProjection(activeScenarioId);
}

export function useRunActiveProjection() {
  const { activeScenarioId } = useActiveScenarioStore();
  const mutation = useRunProjection();

  return {
    ...mutation,
    runActive: () => {
      if (activeScenarioId) {
        mutation.mutate(activeScenarioId);
      }
    },
  };
}
