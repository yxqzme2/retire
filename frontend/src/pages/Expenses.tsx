import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses';
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
import { formatCurrency } from '../utils/format';
import type { ExpenseItem, ExpenseItemCreate } from '../types';
import { useForm } from '../hooks/useForm';

const categoryColors: Record<string, string> = { core: '#3B82F6', flexible: '#F59E0B', irregular: '#94A3B8' };
const categoryBadgeColors: Record<string, 'blue' | 'amber' | 'slate'> = { core: 'blue', flexible: 'amber', irregular: 'slate' };

const categoryOptions = [
  { value: 'core', label: 'Core (Essential)' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'irregular', label: 'Irregular' },
];

function ExpenseForm({ scenarioId, expense, onSubmit, onCancel, isLoading, defaultAge }: {
  scenarioId: number; expense?: ExpenseItem | null; onSubmit: (d: any) => void; onCancel: () => void; isLoading?: boolean; defaultAge: number;
}) {
  const defaults: ExpenseItemCreate = {
    scenario_id: scenarioId,
    name: expense?.name ?? '',
    category: expense?.category ?? 'core',
    annual_amount: expense?.annual_amount ?? 0,
    is_monthly: expense?.is_monthly ?? false,
    start_age: expense?.start_age ?? defaultAge,
    end_age: expense?.end_age ?? undefined,
    inflation_linked: expense?.inflation_linked ?? true,
    custom_inflation_rate: expense?.custom_inflation_rate ?? undefined,
    is_essential: expense?.is_essential ?? true,
    notes: expense?.notes ?? '',
  };
  const { values, setValue } = useForm(defaults);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(values); }} className="space-y-4">
      <Input label="Expense Name" value={values.name} onChange={(e) => setValue('name', e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Category" options={categoryOptions} value={values.category} onChange={(e) => setValue('category', e.target.value as any)} />
        <Input label={values.is_monthly ? 'Monthly Amount' : 'Annual Amount'} type="number" value={values.annual_amount} onChange={(e) => setValue('annual_amount', parseFloat(e.target.value) || 0)} leftAddon="$" min={0} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Age" type="number" value={values.start_age} onChange={(e) => setValue('start_age', parseInt(e.target.value) || defaultAge)} min={18} max={100} />
        <Input label="End Age (optional)" type="number" value={values.end_age ?? ''} onChange={(e) => setValue('end_age', parseInt(e.target.value) || undefined)} min={18} max={100} placeholder="Lifetime" />
      </div>
      {values.inflation_linked && (
        <Input label="Custom Inflation Rate % (optional)" type="number" value={values.custom_inflation_rate ?? ''} onChange={(e) => setValue('custom_inflation_rate', parseFloat(e.target.value) || undefined)} rightAddon="%" placeholder="Leave blank for default" min={0} max={20} step={0.1} />
      )}
      <div className="space-y-3">
        <Toggle label="Amount is Monthly" checked={values.is_monthly ?? false} onChange={(v) => setValue('is_monthly', v)} />
        <Toggle label="Inflation-Linked" description="Automatically inflate this expense each year" checked={values.inflation_linked ?? true} onChange={(v) => setValue('inflation_linked', v)} />
        <Toggle label="Essential" description="Core living expense (not discretionary)" checked={values.is_essential ?? true} onChange={(v) => setValue('is_essential', v)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={isLoading}>{expense ? 'Update' : 'Add'} Expense</Button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const { activeScenarioId } = useActiveScenarioStore();
  const qc = useQueryClient();
  const [editExpense, setEditExpense] = useState<ExpenseItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', activeScenarioId],
    queryFn: () => getExpenses(activeScenarioId!),
    enabled: activeScenarioId != null,
  });

  const createMut = useMutation({ mutationFn: createExpense, onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setIsFormOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateExpense(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setIsFormOpen(false); setEditExpense(null); } });
  const deleteMut = useMutation({ mutationFn: deleteExpense, onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });

  if (!activeScenarioId) return <EmptyState icon={<Receipt size={24} />} title="No scenario selected" description="Select a scenario to manage expenses." />;
  if (isLoading) return <LoadingSpinner />;

  const grouped = { core: expenses.filter((e) => e.category === 'core'), flexible: expenses.filter((e) => e.category === 'flexible'), irregular: expenses.filter((e) => e.category === 'irregular') };
  const totalByCategory = Object.entries(grouped).map(([cat, items]) => ({ name: cat.charAt(0).toUpperCase() + cat.slice(1), value: items.reduce((s, e) => s + (e.is_monthly ? e.annual_amount * 12 : e.annual_amount), 0), color: categoryColors[cat] })).filter((d) => d.value > 0);
  const grandTotal = totalByCategory.reduce((s, d) => s + d.value, 0);

  const renderGroup = (category: string, items: ExpenseItem[]) => (
    <div key={category} className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge color={categoryBadgeColors[category]}>{category.charAt(0).toUpperCase() + category.slice(1)}</Badge>
        <span className="text-slate-500 text-xs">{items.length} items · {formatCurrency(items.reduce((s, e) => s + (e.is_monthly ? e.annual_amount * 12 : e.annual_amount), 0))}/yr</span>
      </div>
      {items.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between py-2.5 border-b border-slate-700/30 hover:bg-slate-700/20 px-1 rounded group">
          <div>
            <p className="text-slate-200 text-sm font-medium">{expense.name}</p>
            <p className="text-slate-500 text-xs">Starts age {expense.start_age}{expense.end_age ? ` · ends ${expense.end_age}` : ''}{expense.inflation_linked ? ' · inflation-linked' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-100 text-sm font-medium tabular-nums">{formatCurrency(expense.is_monthly ? expense.annual_amount * 12 : expense.annual_amount)}/yr</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditExpense(expense); setIsFormOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"><Pencil size={13} /></button>
              <button onClick={() => { if (confirm(`Delete "${expense.name}"?`)) deleteMut.mutate(expense.id); }} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Expense Items" subtitle="Annual expenses by category" actions={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => { setEditExpense(null); setIsFormOpen(true); }}>Add Expense</Button>}>
            {expenses.length === 0 ? (
              <EmptyState icon={<Receipt size={20} />} title="No expenses" description="Add expense categories to project your retirement spending." />
            ) : (
              <div>
                {Object.entries(grouped).map(([cat, items]) => items.length > 0 && renderGroup(cat, items))}
                <div className="pt-3 flex justify-between">
                  <span className="text-slate-500 text-xs">{expenses.length} total expenses</span>
                  <span className="text-slate-200 font-semibold text-sm">{formatCurrency(grandTotal)}/yr</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card title="By Category">
          {totalByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={totalByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                  {totalByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No expense data" />
          )}
        </Card>
      </div>

      <Modal open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditExpense(null); }} title={editExpense ? 'Edit Expense' : 'Add Expense'} size="md">
        <ExpenseForm scenarioId={activeScenarioId} expense={editExpense} defaultAge={52} onSubmit={(data) => editExpense ? updateMut.mutate({ id: editExpense.id, data }) : createMut.mutate({ ...data, scenario_id: activeScenarioId })} onCancel={() => { setIsFormOpen(false); setEditExpense(null); }} isLoading={createMut.isPending || updateMut.isPending} />
      </Modal>
    </div>
  );
}
