import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getProfiles, updateProfile } from '../api/profiles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Profile, ProfileUpdate, FilingStatus } from '../types';
import { useForm } from '../hooks/useForm';

const filingStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
  { value: 'married_filing_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
].map((s) => ({ value: s, label: s }));

export default function Settings() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });
  const profile = profiles[0];

  const { values, setValue, setValues } = useForm<ProfileUpdate>({});

  useEffect(() => {
    if (profile) {
      setValues({
        name: profile.name,
        current_age: profile.current_age,
        spouse_age: profile.spouse_age ?? undefined,
        retirement_age: profile.retirement_age,
        spouse_retirement_age: profile.spouse_retirement_age ?? undefined,
        projection_end_age: profile.projection_end_age,
        filing_status: profile.filing_status,
        retirement_state: profile.retirement_state,
        inflation_rate: profile.inflation_rate,
        healthcare_inflation_rate: profile.healthcare_inflation_rate,
        longevity_assumption: profile.longevity_assumption,
        notes: profile.notes,
      });
    }
  }, [profile?.id]);

  const updateMut = useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(profile!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <p className="text-slate-500">No profile found. Something went wrong.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile settings */}
      <Card title="Profile Settings" subtitle="Your personal retirement planning parameters">
        <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate(values); }} className="space-y-5">
          <Input label="Plan Name" value={values.name ?? ''} onChange={(e) => setValue('name', e.target.value)} placeholder="e.g. Our Retirement Plan" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Your Current Age" type="number" value={values.current_age ?? ''} onChange={(e) => setValue('current_age', parseInt(e.target.value))} min={18} max={90} />
            <Input label="Spouse Age (optional)" type="number" value={values.spouse_age ?? ''} onChange={(e) => setValue('spouse_age', parseInt(e.target.value) || undefined)} min={18} max={90} placeholder="Leave blank if single" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Your Retirement Age" type="number" value={values.retirement_age ?? ''} onChange={(e) => setValue('retirement_age', parseInt(e.target.value))} min={45} max={80} />
            <Input label="Spouse Retirement Age" type="number" value={values.spouse_retirement_age ?? ''} onChange={(e) => setValue('spouse_retirement_age', parseInt(e.target.value) || undefined)} min={45} max={80} placeholder="Optional" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Projection End Age" type="number" value={values.projection_end_age ?? ''} onChange={(e) => setValue('projection_end_age', parseInt(e.target.value))} min={70} max={110} helper="How far to project (typically 85-100)" />
            <Input label="Longevity Assumption" type="number" value={values.longevity_assumption ?? ''} onChange={(e) => setValue('longevity_assumption', parseInt(e.target.value))} min={70} max={110} helper="For planning purposes only" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Filing Status"
              options={filingStatusOptions}
              value={values.filing_status ?? 'married_filing_jointly'}
              onChange={(e) => setValue('filing_status', e.target.value as FilingStatus)}
            />
            <Select
              label="State of Residence"
              options={stateOptions}
              value={values.retirement_state ?? 'TX'}
              onChange={(e) => setValue('retirement_state', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Inflation Rate"
              type="number"
              value={((values.inflation_rate ?? 0.03) * 100).toFixed(1)}
              onChange={(e) => setValue('inflation_rate', parseFloat(e.target.value) / 100 || 0.03)}
              rightAddon="%"
              min={0}
              max={15}
              step={0.1}
            />
            <Input
              label="Healthcare Inflation Rate"
              type="number"
              value={((values.healthcare_inflation_rate ?? 0.05) * 100).toFixed(1)}
              onChange={(e) => setValue('healthcare_inflation_rate', parseFloat(e.target.value) / 100 || 0.05)}
              rightAddon="%"
              min={0}
              max={15}
              step={0.1}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea
              value={values.notes ?? ''}
              onChange={(e) => setValue('notes', e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
              placeholder="Plan notes, reminders, or context..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant={saved ? 'success' : 'primary'}
              loading={updateMut.isPending}
              leftIcon={saved ? <CheckCircle2 size={14} /> : undefined}
            >
              {saved ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* About */}
      <Card title="About RetireVision">
        <div className="text-slate-400 text-sm space-y-2">
          <p>RetireVision v1.0.0 — Self-hosted retirement planning dashboard.</p>
          <p className="text-slate-500 text-xs">Data is stored locally in SQLite. No data leaves your machine.</p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card title="Danger Zone">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-red-800/40 rounded-lg bg-red-900/10">
            <div>
              <p className="text-slate-200 text-sm font-medium">Reset All Data</p>
              <p className="text-slate-500 text-xs mt-0.5">Delete all scenarios, accounts, and projections. Cannot be undone.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowResetModal(true)}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} title="Confirm Reset" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300 text-sm">This will permanently delete all your scenarios, accounts, projections, and income data. This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { alert('To reset, delete the retire.db SQLite file and restart the backend.'); setShowResetModal(false); }}>I Understand, Reset</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
