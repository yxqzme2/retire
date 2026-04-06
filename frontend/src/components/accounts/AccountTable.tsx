import { useState } from 'react';
import { Pencil, Trash2, ArrowUpDown, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, deleteAccount } from '../../api/accounts';
import { AccountTypeBadge, TaxBadge } from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatCurrency, formatPercentDirect } from '../../utils/format';
import type { Account } from '../../types';

interface AccountTableProps {
  scenarioId: number;
  onEdit: (account: Account) => void;
  onAdd: () => void;
}

type SortKey = 'name' | 'current_balance' | 'withdrawal_priority' | 'expected_annual_return_percent';

export default function AccountTable({ scenarioId, onEdit, onAdd }: AccountTableProps) {
  const qc = useQueryClient();
  const [sortKey, setSortKey] = useState<SortKey>('withdrawal_priority');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', scenarioId],
    queryFn: () => getAccounts(scenarioId),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts', scenarioId] }),
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...accounts].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (isLoading) return <LoadingSpinner message="Loading accounts..." />;

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Plus size={20} />}
        title="No accounts yet"
        description="Add your retirement accounts to begin building your projection."
        action={<Button variant="primary" onClick={onAdd} leftIcon={<Plus size={14} />}>Add Account</Button>}
      />
    );
  }

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-slate-500 text-xs font-medium uppercase tracking-wider hover:text-slate-300 transition-colors"
    >
      {label}
      <ArrowUpDown size={10} className={sortKey === field ? 'text-blue-400' : ''} />
    </button>
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={onAdd} leftIcon={<Plus size={14} />} size="sm">
          Add Account
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left pb-3 pr-4"><SortHeader label="Name" field="name" /></th>
              <th className="text-left pb-3 pr-4">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Type</span>
              </th>
              <th className="text-right pb-3 pr-4"><SortHeader label="Balance" field="current_balance" /></th>
              <th className="text-right pb-3 pr-4"><SortHeader label="Return %" field="expected_annual_return_percent" /></th>
              <th className="text-left pb-3 pr-4">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Tax</span>
              </th>
              <th className="text-center pb-3 pr-4"><SortHeader label="Priority" field="withdrawal_priority" /></th>
              <th className="text-right pb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((account) => (
              <tr
                key={account.id}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-100"
              >
                <td className="py-3 pr-4">
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{account.name}</p>
                    {account.institution && (
                      <p className="text-slate-500 text-xs">{account.institution}</p>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <AccountTypeBadge type={account.account_type} />
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-slate-100 text-sm font-medium tabular-nums">
                    {formatCurrency(account.current_balance)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-slate-300 text-sm tabular-nums">
                    {formatPercentDirect(account.expected_annual_return_percent)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <TaxBadge treatment={account.tax_treatment} />
                </td>
                <td className="py-3 pr-4 text-center">
                  <span className="text-slate-400 text-sm tabular-nums">{account.withdrawal_priority}</span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(account)}
                      className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${account.name}"?`)) {
                          deleteMut.mutate(account.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between">
        <span className="text-slate-500 text-xs">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
        <span className="text-slate-400 text-sm font-medium">
          Total: {formatCurrency(accounts.reduce((s, a) => s + a.current_balance, 0))}
        </span>
      </div>
    </div>
  );
}
