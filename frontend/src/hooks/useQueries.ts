import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Job, Customer, Invoice, Technician, InventoryItem,
  UserProfile, JobStatus, JobPriority, PaymentStatus
} from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobStatusSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['jobStatusSummary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobStatusSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export function useGetAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJob(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Job | null>({
    queryKey: ['job', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getJob(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetJobsByStatus(status: JobStatus | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ['jobs', 'status', status],
    queryFn: async () => {
      if (!actor || !status) return [];
      return actor.getJobsByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}

export function useGetJobsByTechnician(techId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ['jobs', 'technician', techId?.toString()],
    queryFn: async () => {
      if (!actor || techId === null) return [];
      return actor.getJobsByTechnician(techId);
    },
    enabled: !!actor && !isFetching && techId !== null,
  });
}

export function useGetJobsByCustomer(customerId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ['jobs', 'customer', customerId?.toString()],
    queryFn: async () => {
      if (!actor || customerId === null) return [];
      return actor.getJobsByCustomer(customerId);
    },
    enabled: !!actor && !isFetching && customerId !== null,
  });
}

export function useGetJobsByDateRange(start: bigint | null, end: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ['jobs', 'dateRange', start?.toString(), end?.toString()],
    queryFn: async () => {
      if (!actor || start === null || end === null) return [];
      return actor.getJobsByDateRange(start, end);
    },
    enabled: !!actor && !isFetching && start !== null && end !== null,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: Job) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJob(job);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['jobStatusSummary'] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, job }: { id: bigint; job: Job }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJob(id, job);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['jobStatusSummary'] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteJob(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['jobStatusSummary'] });
    },
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomer(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Customer | null>({
    queryKey: ['customer', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSearchCustomers(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ['customers', 'search', searchText],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchText.trim()) return actor.getAllCustomers();
      return actor.searchCustomers(searchText);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Customer) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomer(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, customer }: { id: bigint; customer: Customer }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(id, customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInvoice(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice | null>({
    queryKey: ['invoice', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetInvoicesByCustomer(customerId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ['invoices', 'customer', customerId?.toString()],
    queryFn: async () => {
      if (!actor || customerId === null) return [];
      return actor.getInvoicesByCustomer(customerId);
    },
    enabled: !!actor && !isFetching && customerId !== null,
  });
}

export function useGetInvoicesByStatus(status: PaymentStatus | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ['invoices', 'status', status],
    queryFn: async () => {
      if (!actor || !status) return [];
      return actor.getInvoicesByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvoice(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, invoice }: { id: bigint; invoice: Invoice }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInvoice(id, invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useMarkInvoicePaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markInvoicePaid(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInvoice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Technicians ───────────────────────────────────────────────────────────────

export function useGetAllTechnicians() {
  const { actor, isFetching } = useActor();
  return useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTechnicians();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTechnician(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Technician | null>({
    queryKey: ['technician', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTechnician(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateTechnician() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (technician: Technician) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTechnician(technician);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateTechnician() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, technician }: { id: bigint; technician: Technician }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTechnician(id, technician);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });
}

export function useDeactivateTechnician() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deactivateTechnician(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });
}

export function useDeleteTechnician() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTechnician(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export function useGetAllInventoryItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInventoryItem(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem | null>({
    queryKey: ['inventoryItem', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getInventoryItem(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetLowStockItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory', 'lowStock'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStockUsageByJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['stockUsage', 'job', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getStockUsageByJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useCreateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInventoryItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: bigint; item: InventoryItem }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInventoryItem(id, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInventoryItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useRecordStockUsage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, jobId, quantityUsed }: { itemId: bigint; jobId: bigint; quantityUsed: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordStockUsage(itemId, jobId, quantityUsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockUsage'] });
    },
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function useGetRevenueReport() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['revenueReport'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRevenueReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTechnicianPerformance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['technicianPerformance'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTechnicianPerformance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInventoryUsageReport() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['inventoryUsageReport'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInventoryUsageReport();
    },
    enabled: !!actor && !isFetching,
  });
}
