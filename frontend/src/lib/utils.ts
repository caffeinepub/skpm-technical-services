import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JobStatus, JobPriority, PaymentStatus, TechnicianStatus, CustomerType } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(timestamp: bigint | number | null | undefined): string {
  if (!timestamp) return '—';
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms));
}

export function formatDateTime(timestamp: bigint | number | null | undefined): string {
  if (!timestamp) return '—';
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(ms));
}

export function timestampToDateInput(timestamp: bigint | null | undefined): string {
  if (!timestamp) return '';
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split('T')[0];
}

export function dateInputToTimestamp(dateStr: string): bigint {
  if (!dateStr) return BigInt(0);
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function nowTimestamp(): bigint {
  return BigInt(Date.now()) * BigInt(1_000_000);
}

export function getJobStatusLabel(status: JobStatus): string {
  const map: Record<string, string> = {
    new_: 'New', new: 'New',
    inProgress: 'In Progress',
    onHold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status as string] ?? String(status);
}

export function getJobStatusColor(status: JobStatus): string {
  const map: Record<string, string> = {
    new_: 'bg-blue-100 text-blue-800',
    new: 'bg-blue-100 text-blue-800',
    inProgress: 'bg-amber-100 text-amber-800',
    onHold: 'bg-gray-100 text-gray-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status as string] ?? 'bg-gray-100 text-gray-700';
}

export function getJobPriorityLabel(priority: JobPriority): string {
  const map: Record<string, string> = {
    low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
  };
  return map[priority as string] ?? String(priority);
}

export function getJobPriorityColor(priority: JobPriority): string {
  const map: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return map[priority as string] ?? 'bg-gray-100 text-gray-600';
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const map: Record<string, string> = {
    unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid', overdue: 'Overdue',
  };
  return map[status as string] ?? String(status);
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const map: Record<string, string> = {
    unpaid: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-700',
  };
  return map[status as string] ?? 'bg-gray-100 text-gray-700';
}

export function getTechnicianStatusColor(status: TechnicianStatus): string {
  return status === TechnicianStatus.active
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-600';
}

export function getCustomerTypeLabel(type: CustomerType): string {
  return type === CustomerType.commercial ? 'Commercial' : 'Residential';
}

export function getCustomerTypeColor(type: CustomerType): string {
  return type === CustomerType.commercial
    ? 'bg-purple-100 text-purple-700'
    : 'bg-teal-100 text-teal-700';
}
