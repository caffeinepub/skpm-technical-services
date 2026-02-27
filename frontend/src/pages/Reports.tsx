import {
  useGetJobStatusSummary, useGetRevenueReport,
  useGetTechnicianPerformance, useGetInventoryUsageReport
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getJobStatusLabel, formatCurrency } from '../lib/utils';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  const { data: jobStatusSummary, isLoading: statusLoading } = useGetJobStatusSummary();
  const { data: revenueReport, isLoading: revenueLoading } = useGetRevenueReport();
  const { data: techPerformance, isLoading: techLoading } = useGetTechnicianPerformance();
  const { data: inventoryUsage, isLoading: inventoryLoading } = useGetInventoryUsageReport();

  const jobStatusData = (jobStatusSummary ?? []).map(s => ({
    name: getJobStatusLabel(s.status),
    count: Number(s.count),
  }));

  const revenueData = (revenueReport ?? []).map(r => ({
    month: r.month,
    invoiced: r.invoiced,
    collected: r.collected,
  }));

  const techData = (techPerformance ?? []).map(t => ({
    name: t.technicianName.split(' ')[0],
    fullName: t.technicianName,
    assigned: Number(t.assignedJobs),
    completed: Number(t.completedJobs),
  }));

  const inventoryData = (inventoryUsage ?? [])
    .filter(i => Number(i.totalUsed) > 0)
    .sort((a, b) => Number(b.totalUsed) - Number(a.totalUsed))
    .slice(0, 10)
    .map(i => ({
      name: i.itemName.length > 20 ? i.itemName.slice(0, 18) + '…' : i.itemName,
      fullName: i.itemName,
      used: Number(i.totalUsed),
    }));

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Performance insights and operational data</p>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="jobs">Jobs Summary</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="technicians">Technician Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Usage</TabsTrigger>
        </TabsList>

        {/* Jobs Summary */}
        <TabsContent value="jobs" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: 'oklch(0.75 0.16 65)' }} />
                  Jobs by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusLoading ? <Skeleton className="h-48 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={jobStatusData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {statusLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Count</TableHead>
                        <TableHead className="font-semibold text-xs text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobStatusData.map(row => {
                        const total = jobStatusData.reduce((s, r) => s + r.count, 0);
                        const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0';
                        return (
                          <TableRow key={row.name}>
                            <TableCell className="text-sm">{row.name}</TableCell>
                            <TableCell className="text-sm text-right font-medium">{row.count}</TableCell>
                            <TableCell className="text-sm text-right text-muted-foreground">{pct}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? <Skeleton className="h-48 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenueData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(v: number) => [formatCurrency(v)]}
                      />
                      <Legend />
                      <Bar dataKey="invoiced" fill="#6366f1" radius={[4, 4, 0, 0]} name="Invoiced" />
                      <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {revenueLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs">Period</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Invoiced</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Collected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.map(row => (
                        <TableRow key={row.month}>
                          <TableCell className="text-sm font-medium">{row.month}</TableCell>
                          <TableCell className="text-sm text-right">{formatCurrency(row.invoiced)}</TableCell>
                          <TableCell className="text-sm text-right font-medium text-green-600">{formatCurrency(row.collected)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technician Performance */}
        <TabsContent value="technicians" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Jobs per Technician</CardTitle>
              </CardHeader>
              <CardContent>
                {techLoading ? <Skeleton className="h-48 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={techData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelFormatter={(label: string) => {
                          const found = techData.find(t => t.name === label);
                          return found ? found.fullName : label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="assigned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned" />
                      <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Performance Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {techLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs">Technician</TableHead>
                        <TableHead className="font-semibold text-xs text-center">Assigned</TableHead>
                        <TableHead className="font-semibold text-xs text-center">Completed</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {techData.map(row => {
                        const rate = row.assigned > 0 ? ((row.completed / row.assigned) * 100).toFixed(0) : '0';
                        return (
                          <TableRow key={row.fullName}>
                            <TableCell className="text-sm font-medium">{row.fullName}</TableCell>
                            <TableCell className="text-sm text-center">{row.assigned}</TableCell>
                            <TableCell className="text-sm text-center text-green-600 font-medium">{row.completed}</TableCell>
                            <TableCell className="text-sm text-right">{rate}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Usage */}
        <TabsContent value="inventory" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Top Parts Consumed</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? <Skeleton className="h-48 w-full" /> : inventoryData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No usage data recorded yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={inventoryData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelFormatter={(label: string) => {
                          const found = inventoryData.find(i => i.name === label);
                          return found ? found.fullName : label;
                        }}
                        formatter={(v: number) => [v, 'Units Used']}
                      />
                      <Bar dataKey="used" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Units Used" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Usage Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {inventoryLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : inventoryData.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">No usage data recorded yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs">Item</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Units Used</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryData.map(row => (
                        <TableRow key={row.fullName}>
                          <TableCell className="text-sm">{row.fullName}</TableCell>
                          <TableCell className="text-sm text-right font-medium">{row.used}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
