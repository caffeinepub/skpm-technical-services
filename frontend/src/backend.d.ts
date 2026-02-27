import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}
export interface JobStatusSummary {
    status: JobStatus;
    count: bigint;
}
export interface Invoice {
    id: bigint;
    issueDate: Time;
    lineItems: Array<LineItem>;
    total: number;
    paymentStatus: PaymentStatus;
    createdAt: Time;
    jobId?: bigint;
    dueDate: Time;
    updatedAt: Time;
    invoiceNumber: string;
    notes: string;
    customerId: bigint;
    taxRate: number;
    subtotal: number;
}
export interface StockUsageRecord {
    id: bigint;
    itemId: bigint;
    usedAt: Time;
    jobId: bigint;
    quantityUsed: bigint;
}
export interface DashboardStats {
    totalOpenJobs: bigint;
    totalTechnicians: bigint;
    totalRevenueThisMonth: number;
    totalJobs: bigint;
    pendingInvoices: bigint;
    completedJobsToday: bigint;
    totalCustomers: bigint;
}
export interface Technician {
    id: bigint;
    status: TechnicianStatus;
    name: string;
    createdAt: Time;
    email: string;
    updatedAt: Time;
    notes: string;
    specialization: string;
    phone: string;
    skills: Array<string>;
}
export interface Customer {
    id: bigint;
    customerType: CustomerType;
    name: string;
    createdAt: Time;
    email: string;
    updatedAt: Time;
    company: string;
    address: string;
    notes: string;
    phone: string;
}
export interface InventoryItem {
    id: bigint;
    sku: string;
    quantityInStock: bigint;
    supplier: string;
    name: string;
    createdAt: Time;
    minimumStockThreshold: bigint;
    updatedAt: Time;
    notes: string;
    category: string;
    unitCost: number;
}
export interface TechnicianPerformance {
    completedJobs: bigint;
    technicianName: string;
    technicianId: bigint;
    assignedJobs: bigint;
}
export interface Job {
    id: bigint;
    status: JobStatus;
    title: string;
    scheduledDate?: Time;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    notes: string;
    customerId: bigint;
    priority: JobPriority;
    location: string;
    assignedTechnician?: bigint;
}
export interface InventoryUsageSummary {
    itemId: bigint;
    totalUsed: bigint;
    itemName: string;
}
export interface RevenueByMonth {
    month: string;
    collected: number;
    invoiced: number;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum CustomerType {
    commercial = "commercial",
    residential = "residential"
}
export enum JobPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum JobStatus {
    new_ = "new",
    cancelled = "cancelled",
    completed = "completed",
    inProgress = "inProgress",
    onHold = "onHold"
}
export enum PaymentStatus {
    paid = "paid",
    unpaid = "unpaid",
    overdue = "overdue",
    partial = "partial"
}
export enum TechnicianStatus {
    active = "active",
    inactive = "inactive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomer(customer: Customer): Promise<bigint>;
    createInventoryItem(item: InventoryItem): Promise<bigint>;
    createInvoice(invoice: Invoice): Promise<bigint>;
    createJob(job: Job): Promise<bigint>;
    createTechnician(technician: Technician): Promise<bigint>;
    deactivateTechnician(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteInventoryItem(id: bigint): Promise<void>;
    deleteInvoice(id: bigint): Promise<void>;
    deleteJob(id: bigint): Promise<void>;
    deleteTechnician(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllJobs(): Promise<Array<Job>>;
    getAllPriorities(): Promise<Array<JobPriority>>;
    getAllStatuses(): Promise<Array<JobStatus>>;
    getAllTechnicians(): Promise<Array<Technician>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getInventoryItem(id: bigint): Promise<InventoryItem | null>;
    getInventoryUsageReport(): Promise<Array<InventoryUsageSummary>>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getInvoicesByCustomer(customerId: bigint): Promise<Array<Invoice>>;
    getInvoicesByStatus(status: PaymentStatus): Promise<Array<Invoice>>;
    getJob(id: bigint): Promise<Job | null>;
    getJobStatusSummary(): Promise<Array<JobStatusSummary>>;
    getJobsByCustomer(customerId: bigint): Promise<Array<Job>>;
    getJobsByDateRange(start: Time, end: Time): Promise<Array<Job>>;
    getJobsByPriority(priority: JobPriority): Promise<Array<Job>>;
    getJobsByStatus(status: JobStatus): Promise<Array<Job>>;
    getJobsByTechnician(techId: bigint): Promise<Array<Job>>;
    getLowStockItems(): Promise<Array<InventoryItem>>;
    getRevenueReport(): Promise<Array<RevenueByMonth>>;
    getStockUsageByJob(jobId: bigint): Promise<Array<StockUsageRecord>>;
    getTechnician(id: bigint): Promise<Technician | null>;
    getTechnicianPerformance(): Promise<Array<TechnicianPerformance>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markInvoicePaid(id: bigint): Promise<void>;
    recordStockUsage(itemId: bigint, jobId: bigint, quantityUsed: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchCustomers(searchText: string): Promise<Array<Customer>>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateInventoryItem(id: bigint, item: InventoryItem): Promise<void>;
    updateInvoice(id: bigint, invoice: Invoice): Promise<void>;
    updateJob(id: bigint, job: Job): Promise<void>;
    updateTechnician(id: bigint, technician: Technician): Promise<void>;
}
