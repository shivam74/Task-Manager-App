import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Loader from '../components/ui/Loader';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load analytics');
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const blocks = [
    { label: 'Total users', value: data?.users?.total ?? '—', hint: 'Everyone in the workspace' },
    {
      label: 'Admins',
      value: data?.users?.admins ?? '—',
      hint: 'Users with full access',
    },
    {
      label: 'Regular users',
      value: data?.users?.users ?? '—',
      hint: 'Standard accounts',
    },
    {
      label: 'Total tasks',
      value: data?.tasks?.total ?? '—',
      hint: 'Across all statuses',
    },
    {
      label: 'Pending',
      value: data?.tasks?.pending ?? '—',
      hint: 'Not started yet',
    },
    {
      label: 'In progress',
      value: data?.tasks?.inProgress ?? '—',
      hint: 'Active work',
    },
    {
      label: 'Completed',
      value: data?.tasks?.completed ?? '—',
      hint: 'Done',
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Organization-wide metrics. Only administrators can view this page.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {blocks.map((b) => (
          <Card key={b.label} noPadding className="border-slate-200/90 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-500">{b.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{b.value}</p>
              <p className="mt-1 text-xs text-slate-500">{b.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card noPadding className="border-slate-200/90 shadow-sm">
        <CardHeader
          title="How this works"
          subtitle="Counts come from live MongoDB data — same RBAC rules apply to task listings elsewhere."
        />
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Admins see every task; users only see tasks they created or are assigned to.</li>
            <li>User management and analytics require an admin role on both API and UI.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
