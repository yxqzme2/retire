import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { getIncomeStreams, createIncomeStream, updateIncomeStream, deleteIncomeStream } from '../api/income';
import { useActiveScenarioStore } from '../hooks/useScenario';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatPercentDirect } from '../utils/format';
import type { IncomeStream, IncomeStreamCreate } from '../types';
import { useForm } from '../hooks/useForm';

const streamTypeOptions = [
  { value: 'pension', label: 'Pension' },
  { value: 'social_security', label: 'Social Security' },
  { value: 'part_time', label: 'Part-Time Work' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'annuity', label: 'Annuity' },
  { value: 'other', label: 'Other' },
];

const streamTypeColors: Record<string, 'blue' | 'emerald' | 'amber' | 'red' | 'slate' | 'purple'> = {
  pension: 'blue',
  social_security: 'emerald',
  part_time: 'amber',
  rental: 'purple',
  annuity: 'slate',
  other: 'slate',
};

function IncomeForm({ scenarioId, stream, onSubmit, onCancel, isLoading }: {
  scenarioId: number;
  stream?: IncomeStream | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const defaultValues: IncomeStreamCreate = {
    scenario_id: scenarioId,
    name: stream?.name ?? '',
    stream_type: stream?.stream_type ?? 'pension',
    start_age: stream?.start_age ?? 65,
    end_age: stream?.end_age ?? undefined,
    annual_amount: stream?.annual_amount ?? 0,
    is_monthly: stream?.is_monthly ?? false,
    cola_percent: stream?.cola_percent ?? 0,
    is_taxable: stream?.is_taxable ?? true,
    is_partially_taxable: stream?.is_partially_taxable ?? false,
    notes: stream?.notes ?? '',
  };
  const { values, setValue } = useForm(defaultValues);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(values); }} className="space-y-4">
      <Input label="Name" value={values.name} onChange={(e) => setValue('name', e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" options={streamTypeOptions} value={values.stream_type} onChange={(e) => setValue('stream_type', e.target.value as any)} />
        <Input label="Start Age" type="number" value={values.start_age} onChange={(e) => setValue('start_age', parseInt(e.target.value))} min={40} max={90} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={values.is_monthly ? 'Monthly Amount' : 'Annual Amount'}
          type="number"
          value={values.annual_amount}
          onChange={(e) => setValue('annual_amount', parseFloat(e.target.value) || 0)}
          leftAddon="$"
        />
        <Input label="End Age (optional)" type="number" value={values.end_age ?? ''} onChange={(e) => setValue('end_age', parseInt(e.target.value) || undefined)} min={40} max={100} placeholder="Leave blank for lifetime" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="COLA %" type="number" value={values.cola_percent} onChange={(e) => setValue('cola_percent', parseFloat(e.target.value) || 0)} rightAddon="%" min={0} max={10} step={0.5} />
      </div>
      <div className="space-y-3">
        <Toggle label="Amount is Monthly" checked={values.is_monthly ?? false} onChange={(v) => setValue('is_monthly', v)} />
        <Toggle label="Taxable" checked={values.is_taxable ?? true} onChange={(v) => setValue('is_taxable', v)} />
        <Toggle label="Partially Taxable (e.g. Social Security)" checked={values.is_partially_taxable ?? false} onChange={(v) => setValue('is_partially_taxable', v)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={isLoading}>{stream ? 'Update' : 'Add'} Income Stream</Button>
      </div>
    </form>
  );
}

export default function Income() {
  const { activeScenarioId } = useActiveScenarioStore();
  const qc = useQueryClient();
  const [editStream, setEditStream] = useState<IncomeStream | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['income', activeScenarioId],
    queryFn: () => getIncomeStreams(activeScenarioId!),
    enabled: activeScenarioId != null,
  });

  const createMut = useMutation({ mutationFn: createIncomeStream, onSuccess: () => { qc.invalidateQueries({ queryKey: ['income'] }); setIsFormOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateIncomeStream(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['income'] }); setIsFormOpen(false); setEditStream(null); } });
  const deleteMut = useMutation({ mutationFn: deleteIncomeStream, onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }) });

  if (!activeScenarioId) return <EmptyState icon={<TrendingUp size={24} />} title="No scenario selected" description="Select a scenario to manage income streams." />;
  if (isLoading) return <LoadingSpinner />;

  const totalAnnual = streams.reduce((s, stream) => s + (stream.is_monthly ? stream.annual_amount * 12 : stream.annual_amount), 0);

  return (
    <div className="space-y-6">
      <Card
        title="Income Streams"
        subtitle="Pension, Social Security, part-time work, and other retirement income"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => { setEditStream(null); setIsFormOpen(true); }}>
            Add Income
          </Button>
        }
      >
        {streams.length === 0 ? (
          <EmptyState icon={<TrendingUp size={20} />} title="No income streams" description="Add pension, Social Security, or other income sources." />
        ) : (
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Name', 'Type', 'Start Age', 'Annual Amount', 'COLA', 'Actions'].map((h) => (
                    <th key={h} className={`text-${h === 'Annual Amount' || h === 'COLA' ? 'right' : h === 'Actions' ? 'right' : 'left'} pb-3 pr-4 text-slate-500 text-xs font-medium uppercase tracking-wider`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {streams.map((stream) => (
                  <tr key={stream.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="py-3 pr-4"><p className="text-slate-200 text-sm font-medium">{stream.name}</p></td>
                    <td className="py-3 pr-4"><Badge color={streamTypeColors[stream.stream_type] ?? 'slate'}>{stream.stream_type.replace('_', ' ')}</Badge></td>
                    <td className="py-3 pr-4"><span className="text-slate-300 text-sm">Age {stream.start_age}{stream.end_age ? `–${stream.end_age}` : '+'}</span></td>
                    <td className="py-3 pr-4 text-right"><span className="text-slate-100 text-sm font-medium tabular-nums">{formatCurrency(stream.is_monthly ? stream.annual_amount * 12 : stream.annual_amount)}/yr</span></td>
                    <td className="py-3 pr-4 text-right"><span className="text-slate-400 text-sm tabular-nums">{formatPercentDirect(stream.cola_percent)}</span></td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditStream(stream); setIsFormOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => { if (confirm(`Delete "${stream.name}"?`)) deleteMut.mutate(stream.id); }} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between">
              <span className="text-slate-500 text-xs">{streams.length} stream{streams.length !== 1 ? 's' : ''}</span>
              <span className="text-slate-400 text-sm font-medium">Total: {formatCurrency(totalAnnual)}/yr</span>
            </div>
          </div>
        )}
      </Card>

      <Modal open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditStream(null); }} title={editStream ? 'Edit Income Stream' : 'Add Income Stream'} size="md">
        <IncomeForm scenarioId={activeScenarioId} stream={editStream} onSubmit={(data) => editStream ? updateMut.mutate({ id: editStream.id, data }) : createMut.mutate({ ...data, scenario_id: activeScenarioId })} onCancel={() => { setIsFormOpen(false); setEditStream(null); }} isLoading={createMut.isPending || updateMut.isPending} />
      </Modal>
    </div>
  );
}
