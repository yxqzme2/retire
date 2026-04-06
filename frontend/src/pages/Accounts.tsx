import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { useActiveScenarioStore } from '../hooks/useScenario';
import AccountTable from '../components/accounts/AccountTable';
import AccountForm from '../components/accounts/AccountForm';
import AccountBubbleChart from '../components/charts/AccountBubbleChart';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { createAccount, updateAccount } from '../api/accounts';
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/accounts';
import type { Account } from '../types';

export default function Accounts() {
  const { activeScenarioId } = useActiveScenarioStore();
  const qc = useQueryClient();
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', activeScenarioId],
    queryFn: () => getAccounts(activeScenarioId!),
    enabled: activeScenarioId != null,
  });

  const createMut = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts', activeScenarioId] });
      setIsFormOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateAccount(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts', activeScenarioId] });
      setEditAccount(null);
      setIsFormOpen(false);
    },
  });

  if (!activeScenarioId) {
    return (
      <EmptyState
        icon={<Wallet size={24} />}
        title="No scenario selected"
        description="Select a scenario from the sidebar to manage accounts."
      />
    );
  }

  const handleSubmit = (data: any) => {
    if (editAccount) {
      updateMut.mutate({ id: editAccount.id, data });
    } else {
      createMut.mutate({ ...data, scenario_id: activeScenarioId });
    }
  };

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditAccount(null);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setEditAccount(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card title="Accounts" subtitle="Manage your retirement accounts and investment portfolios">
        <AccountTable
          scenarioId={activeScenarioId}
          onEdit={handleEdit}
          onAdd={handleAdd}
        />
      </Card>

      {accounts.length > 0 && (
        <Card title="Portfolio Map" subtitle="Tax efficiency vs. liquidity by account (bubble size = balance)">
          <AccountBubbleChart accounts={accounts} />
        </Card>
      )}

      <Modal
        open={isFormOpen}
        onClose={handleClose}
        title={editAccount ? 'Edit Account' : 'Add Account'}
        size="lg"
      >
        <AccountForm
          scenarioId={activeScenarioId}
          account={editAccount}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={createMut.isPending || updateMut.isPending}
        />
      </Modal>
    </div>
  );
}
