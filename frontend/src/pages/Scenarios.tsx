import { useState } from 'react';
import { Plus, LayoutGrid, Columns, GitBranch } from 'lucide-react';
import { useScenarios, useCreateScenario, useDeleteScenario, useDuplicateScenario, useActiveScenarioStore } from '../hooks/useScenario';
import { useRunProjection } from '../hooks/useProjection';
import { useQuery } from '@tanstack/react-query';
import { getProfiles } from '../api/profiles';
import ScenarioCard from '../components/scenarios/ScenarioCard';
import ScenarioComparison from '../components/scenarios/ScenarioComparison';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useForm } from '../hooks/useForm';

function CreateScenarioForm({ profileId, onSubmit, onCancel, isLoading }: {
  profileId: number; onSubmit: (d: any) => void; onCancel: () => void; isLoading?: boolean;
}) {
  const { values, setValue } = useForm({ name: '', description: '', is_base_case: false, profile_id: profileId });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(values); }} className="space-y-4">
      <Input label="Scenario Name" value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder="e.g. Conservative, Early Retirement" required />
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
        <textarea value={values.description} onChange={(e) => setValue('description', e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="What makes this scenario unique?" />
      </div>
      <Toggle label="Set as Base Case" checked={values.is_base_case} onChange={(v) => setValue('is_base_case', v)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={isLoading}>Create Scenario</Button>
      </div>
    </form>
  );
}

export default function Scenarios() {
  const { data: scenarios = [], isLoading } = useScenarios();
  const { data: profiles = [] } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });
  const { activeScenarioId, setActiveScenarioId } = useActiveScenarioStore();
  const createMut = useCreateScenario();
  const deleteMut = useDeleteScenario();
  const duplicateMut = useDuplicateScenario();
  const { mutate: runProjection, isPending: isRunning, variables: runningId } = useRunProjection();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const profileId = profiles[0]?.id ?? 1;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isComparing ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<Columns size={14} />}
            onClick={() => setIsComparing(!isComparing)}
          >
            Compare
          </Button>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>
          New Scenario
        </Button>
      </div>

      {isComparing && scenarios.length >= 2 && (
        <ScenarioComparison scenarios={scenarios.slice(0, 3)} />
      )}

      {scenarios.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={24} />}
          title="No scenarios yet"
          description="Create scenarios to compare different retirement strategies side-by-side."
          action={<Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>Create Scenario</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isActive={scenario.id === activeScenarioId}
              isRunning={isRunning && runningId === scenario.id}
              onEdit={() => {}}
              onDuplicate={(id) => duplicateMut.mutate(id)}
              onDelete={(id) => deleteMut.mutate(id)}
              onRun={(id) => runProjection(id)}
              onSelect={(id) => setActiveScenarioId(id)}
            />
          ))}
        </div>
      )}

      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Scenario" size="md">
        <CreateScenarioForm
          profileId={profileId}
          onSubmit={(data) => { createMut.mutate(data); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={createMut.isPending}
        />
      </Modal>
    </div>
  );
}
