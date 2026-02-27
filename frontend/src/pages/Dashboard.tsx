import { useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { seedDataIfEmpty } from '../lib/seedData';
import {
  useGetDashboardStats, useGetJobStatusSummary, useGetAllJobs,
  useGetAllTechnicians, useGetAllCustomers
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import {
  Briefcase, CheckCircle, FileText, DollarSign,
  Users, Wrench, TrendingUp, AlertCircle
} from 'lucide-react';
import { formatCurrency, getJobStatusLabel, getJobStatusColor, getJobPriorityColor, getJobPriorityLabel } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  new_: '#3b82f6', new: '#3b82f6',
  inProgress: '#f59e0b',
  onHold: '#6b7280',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export default function Dashboard() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: statusSummary, isLoading: summaryLoading } = useGetJobStatusSummary();
  const { data: jobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: technicians } = useGetAllTechnicians();
  const { data: customers } = useGetAllCustomers();

  // Seed data on first load
  useEffect(() => {
    if (!actor || isFetching) return;
    const key = 'skpm_seeded';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    seedDataIfEmpty(actor).then(() => {
      queryClient.invalidateQueries();
    }).catch(() => {
      sessionStorage.removeItem(key);
    });
  }, [actor, isFetching, queryClient]);

  const chartData = statusSummary?.map(s => ({
    name: getJobStatusLabel(s.status),
    count: Number(s.count),
    status: s.status as string,
  })) ?? [];

  const recentJobs = [...(jobs ?? [])].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)).slice(0, 8);

  const techMap = new Map(technicians?.map(t => [t.id.toString(), t.name]) ?? []);
  const customerMap = new Map(customers?.map(c => [c.id.toString(), c.name]) ?? []);

  const kpis = [
    {
      label: 'Open Jobs',
      value: statsLoading ? null : Number(stats?.totalOpenJobs ?? 0),
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: `${Number(stats?.totalJobs ?? 0)} total jobs`,
    },
    {
      label: 'Completed Today',
      value: statsLoading ? null : Number(stats?.completedJobsToday ?? 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sub: 'jobs finished today',
    },
    {
      label: 'Pending Invoices',
      value: statsLoading ? null : Number(stats?.pendingInvoices ?? 0),
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: 'awaiting payment',
    },
    {
      label: 'Revenue (30 days)',
      value: statsLoading ? null : stats?.totalRevenueThisMonth ?? 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      isCurrency: true,
      sub: 'collected this month',
    },
    {
      label: 'Customers',
      value: statsLoading ? null : Number(stats?.totalCustomers ?? 0),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: 'total clients',
    },
    {
      label: 'Technicians',
      value: statsLoading ? null : Number(stats?.totalTechnicians ?? 0),
      icon: Wrench,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      sub: 'staff members',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your field service operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(({ label, value, icon: Icon, color, bg, isCurrency, sub }) => (
          <Card key={label} className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                  {value === null ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground mt-0.5">
                      {isCurrency ? formatCurrency(value as number) : value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-2 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Status Chart */}
        <Card className="shadow-card border-0 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'oklch(0.75 0.16 65)' }} />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(v) => [v, 'Jobs']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" style={{ color: 'oklch(0.75 0.16 65)' }} />
                Recent Activity
              </CardTitle>
              <Link to="/jobs" className="text-xs font-medium hover:underline" style={{ color: 'oklch(0.55 0.12 240)' }}>
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {jobsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No jobs yet</div>
            ) : (
              <div className="divide-y">
                {recentJobs.map(job => (
                  <Link
                    key={job.id.toString()}
                    to="/jobs/$id"
                    params={{ id: job.id.toString() }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customerMap.get(job.customerId.toString()) ?? 'Unknown'} · {techMap.get(job.assignedTechnician?.toString() ?? '') ?? 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobPriorityColor(job.priority)}`}>
                        {getJobPriorityLabel(job.priority)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobStatusColor(job.status)}`}>
                        {getJobStatusLabel(job.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
