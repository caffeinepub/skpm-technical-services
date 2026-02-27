import { useState, useMemo } from 'react';
import { useGetAllJobs, useGetAllTechnicians, useGetAllCustomers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import JobForm from '../components/JobForm';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { getJobStatusColor, getJobStatusLabel, getJobPriorityColor } from '../lib/utils';
import { Link } from '@tanstack/react-router';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function tsToDate(ts: bigint): Date {
  return new Date(Number(ts) / 1_000_000);
}

export default function Schedule() {
  const { data: jobs, isLoading } = useGetAllJobs();
  const { data: technicians } = useGetAllTechnicians();
  const { data: customers } = useGetAllCustomers();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const techMap = useMemo(() => new Map(technicians?.map(t => [t.id.toString(), t.name]) ?? []), [technicians]);
  const customerMap = useMemo(() => new Map(customers?.map(c => [c.id.toString(), c.name]) ?? []), [customers]);

  // Jobs with scheduled dates
  const scheduledJobs = useMemo(() =>
    (jobs ?? []).filter(j => j.scheduledDate),
    [jobs]
  );

  // Group jobs by date string YYYY-MM-DD
  const jobsByDate = useMemo(() => {
    const map = new Map<string, typeof scheduledJobs>();
    for (const job of scheduledJobs) {
      if (!job.scheduledDate) continue;
      const d = tsToDate(job.scheduledDate);
      const key = d.toISOString().split('T')[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(job);
    }
    return map;
  }, [scheduledJobs]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentDate]);

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingJobs = useMemo(() =>
    scheduledJobs
      .filter(j => j.scheduledDate && tsToDate(j.scheduledDate) >= todayStart)
      .sort((a, b) => Number(a.scheduledDate) - Number(b.scheduledDate))
      .slice(0, 20),
    [scheduledJobs]
  );

  const handleDayClick = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setShowForm(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Calendar view of scheduled jobs</p>
        </div>
        <Button onClick={() => { setSelectedDate(''); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Schedule Job
        </Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">Upcoming List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-semibold">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline" size="sm" className="h-8 text-xs"
                    onClick={() => setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                  >
                    Today
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={i} className="bg-muted/30 min-h-24 p-1" />;
                      const dateKey = date.toISOString().split('T')[0];
                      const dayJobs = jobsByDate.get(dateKey) ?? [];
                      const isToday = dateKey === new Date().toISOString().split('T')[0];
                      return (
                        <div
                          key={i}
                          className="bg-card min-h-24 p-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => handleDayClick(date)}
                        >
                          <div
                            className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'text-white' : 'text-foreground'}`}
                            style={isToday ? { background: 'oklch(0.75 0.16 65)' } : {}}
                          >
                            {date.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {dayJobs.slice(0, 3).map(job => (
                              <Link
                                key={job.id.toString()}
                                to="/jobs/$id"
                                params={{ id: job.id.toString() }}
                                onClick={e => e.stopPropagation()}
                                className={`block text-xs px-1 py-0.5 rounded truncate font-medium ${getJobStatusColor(job.status)}`}
                                title={`${job.title} — ${techMap.get(job.assignedTechnician?.toString() ?? '') ?? 'Unassigned'}`}
                              >
                                {job.title}
                              </Link>
                            ))}
                            {dayJobs.length > 3 && (
                              <p className="text-xs text-muted-foreground pl-1">+{dayJobs.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming Scheduled Jobs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : upcomingJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-medium">No upcoming scheduled jobs</p>
                </div>
              ) : (
                <div className="divide-y">
                  {upcomingJobs.map(job => (
                    <Link
                      key={job.id.toString()}
                      to="/jobs/$id"
                      params={{ id: job.id.toString() }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="text-center min-w-12">
                        <p className="text-xs text-muted-foreground">
                          {job.scheduledDate ? tsToDate(job.scheduledDate).toLocaleDateString('en-US', { month: 'short' }) : ''}
                        </p>
                        <p className="text-xl font-display font-bold leading-none">
                          {job.scheduledDate ? tsToDate(job.scheduledDate).getDate() : ''}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {customerMap.get(job.customerId.toString()) ?? '—'} ·{' '}
                          {job.assignedTechnician ? techMap.get(job.assignedTechnician.toString()) ?? 'Unassigned' : 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobPriorityColor(job.priority)}`}>
                          {job.priority}
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
        </TabsContent>
      </Tabs>

      <JobForm
        open={showForm}
        onClose={() => setShowForm(false)}
        defaultDate={selectedDate}
      />
    </div>
  );
}
