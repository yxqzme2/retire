/**
 * Global UI state store using Zustand.
 *
 * Handles:
 * - activeScenarioId: the currently selected scenario
 * - comparisonScenarioIds: scenarios selected for comparison view
 * - sidebarOpen: mobile sidebar visibility
 *
 * Note: activeScenarioId is also persisted to localStorage for
 * reload persistence. The hooks/useScenario.ts builds on top of this.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  // Active scenario
  activeScenarioId: number | null;
  setActiveScenario: (id: number | null) => void;

  // Comparison mode
  comparisonScenarioIds: number[];
  addToComparison: (id: number) => void;
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Active scenario
      activeScenarioId: null,
      setActiveScenario: (id) => set({ activeScenarioId: id }),

      // Comparison
      comparisonScenarioIds: [],
      addToComparison: (id) =>
        set((state) => ({
          comparisonScenarioIds: state.comparisonScenarioIds.includes(id)
            ? state.comparisonScenarioIds
            : [...state.comparisonScenarioIds.slice(-3), id], // max 4
        })),
      removeFromComparison: (id) =>
        set((state) => ({
          comparisonScenarioIds: state.comparisonScenarioIds.filter((x) => x !== id),
        })),
      clearComparison: () => set({ comparisonScenarioIds: [] }),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'retirevision-ui',
      partialize: (state) => ({
        activeScenarioId: state.activeScenarioId,
        comparisonScenarioIds: state.comparisonScenarioIds,
      }),
    },
  ),
);

// Convenience selectors
export const useActiveScenarioId = () => useAppStore((s) => s.activeScenarioId);
export const useSetActiveScenario = () => useAppStore((s) => s.setActiveScenario);
export const useComparisonIds = () => useAppStore((s) => s.comparisonScenarioIds);
export const useSidebar = () =>
  useAppStore((s) => ({
    open: s.sidebarOpen,
    toggle: s.toggleSidebar,
    set: s.setSidebarOpen,
  }));
