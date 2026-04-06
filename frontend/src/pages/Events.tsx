import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CalendarDays, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/events';
import { useActiveScenarioStore } from '../hooks/useScenario';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/format';
import type { OneTimeEvent, OneTimeEventCreate } from '../types';
import { useForm } from '../hooks/useForm';

function EventForm({ scenarioId, event, onSubmit, onCancel, isLoading }: {
  scenarioId: number; event?: OneTimeEvent | null; onSubmit: (d: any) => void; onCancel: () => void; isLoading?: boolean;
}) {
  const defaults: OneTimeEventCreate = {
    scenario_id: scenarioId,
    name: event?.name ?? '',
    age: event?.age ?? 65,
    amount: event?.amount ?? 0,
    is_inflow: event?.is_inflow ?? false,
    description: event?.description ?? '',
  };
  const { values, setValue } = useForm(defaults);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(values); }} className="space-y-4">
      <Input label="Event Name" value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder="e.g. Home Renovation" required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Age" type="number" value={values.age} onChange={(e) => setValue('age', parseInt(e.target.value) || 65)} min={40} max={100} />
        <Input label="Amount" type="number" value={values.amount} onChange={(e) => setValue('amount', parseFloat(e.target.value) || 0)} leftAddon="$" min={0} step={1000} />
      </div>
      <Toggle label="Money Inflow (income / windfall)" description="Enable if this event brings money IN (inheritance, sale of home, etc.)" checked={values.is_inflow ?? false} onChange={(v) => setValue('is_inflow', v)} />
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
        <textarea value={values.description ?? ''} onChange={(e) => setValue('description', e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600" placeholder="Optional description..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={isLoading}>{event ? 'Update' : 'Add'} Event</Button>
      </div>
    </form>
  );
}

export default function Events() {
  const { activeScenarioId } = useActiveScenarioStore();
  const qc = useQueryClient();
  const [editEvent, setEditEvent] = useState<OneTimeEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', activeScenarioId],
    queryFn: () => getEvents(activeScenarioId!),
    enabled: activeScenarioId != null,
  });

  const createMut = useMutation({ mutationFn: createEvent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setIsFormOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateEvent(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setIsFormOpen(false); setEditEvent(null); } });
  const deleteMut = useMutation({ mutationFn: deleteEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });

  if (!activeScenarioId) return <EmptyState icon={<CalendarDays size={24} />} title="No scenario selected" />;

  const sorted = [...events].sort((a, b) => a.age - b.age);

  return (
    <div className="space-y-6">
      <Card title="One-Time Events" subtitle="Major financial events — windfalls, large purchases, inheritances" actions={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => { setEditEvent(null); setIsFormOpen(true); }}>Add Event</Button>}>
        {events.length === 0 ? (
          <EmptyState icon={<CalendarDays size={20} />} title="No events yet" description="Add one-time financial events like home purchases, inheritances, or large expenses." action={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsFormOpen(true)}>Add Event</Button>} />
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700/50" />
            <div className="space-y-1">
              {sorted.map((event) => (
                <div key={event.id} className="flex items-start gap-4 pl-14 py-3 relative hover:bg-slate-700/20 rounded-lg px-4 group">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${event.is_inflow ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                    {event.is_inflow ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                  </div>
                  {/* Age badge */}
                  <div className="absolute left-12 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-400">Age {event.age}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-5 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-200 font-medium text-sm">{event.name}</p>
                        {event.description && <p className="text-slate-500 text-xs mt-0.5">{event.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`font-semibold text-sm tabular-nums ${event.is_inflow ? 'text-emerald-400' : 'text-red-400'}`}>
                          {event.is_inflow ? '+' : '-'}{formatCurrency(event.amount)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditEvent(event); setIsFormOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md"><Pencil size={13} /></button>
                          <button onClick={() => { if (confirm(`Delete "${event.name}"?`)) deleteMut.mutate(event.id); }} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditEvent(null); }} title={editEvent ? 'Edit Event' : 'Add One-Time Event'} size="md">
        <EventForm scenarioId={activeScenarioId} event={editEvent} onSubmit={(data) => editEvent ? updateMut.mutate({ id: editEvent.id, data }) : createMut.mutate({ ...data, scenario_id: activeScenarioId })} onCancel={() => { setIsFormOpen(false); setEditEvent(null); }} isLoading={createMut.isPending || updateMut.isPending} />
      </Modal>
    </div>
  );
}
