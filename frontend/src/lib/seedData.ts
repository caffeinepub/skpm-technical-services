import type { backendInterface } from '../backend';
import { JobStatus, JobPriority, PaymentStatus, TechnicianStatus, CustomerType } from '../backend';

const NS = BigInt(1_000_000);

function daysAgo(n: number): bigint {
  return BigInt(Date.now() - n * 86400000) * NS;
}

function daysFromNow(n: number): bigint {
  return BigInt(Date.now() + n * 86400000) * NS;
}

export async function seedDataIfEmpty(actor: backendInterface): Promise<void> {
  try {
    const [existingCustomers, existingTechs, existingJobs] = await Promise.all([
      actor.getAllCustomers(),
      actor.getAllTechnicians(),
      actor.getAllJobs(),
    ]);

    if (existingCustomers.length > 0 || existingTechs.length > 0 || existingJobs.length > 0) {
      return; // Already seeded
    }

    const now = BigInt(Date.now()) * NS;

    // Create customers
    const customerData = [
      { name: 'James Wilson', company: 'Wilson Enterprises', email: 'james@wilsonent.com', phone: '555-0101', address: '123 Oak Street, Austin, TX 78701', customerType: CustomerType.commercial, notes: 'Long-term client, prefers morning appointments', createdAt: daysAgo(90), updatedAt: daysAgo(5) },
      { name: 'Sarah Mitchell', company: '', email: 'sarah.m@email.com', phone: '555-0102', address: '456 Maple Ave, Austin, TX 78702', customerType: CustomerType.residential, notes: 'Referred by James Wilson', createdAt: daysAgo(60), updatedAt: daysAgo(10) },
      { name: 'TechCorp Solutions', company: 'TechCorp Solutions Inc.', email: 'facilities@techcorp.com', phone: '555-0103', address: '789 Business Blvd, Austin, TX 78703', customerType: CustomerType.commercial, notes: 'Multiple locations, contact facilities manager', createdAt: daysAgo(120), updatedAt: daysAgo(2) },
      { name: 'Robert Chen', company: '', email: 'rchen@gmail.com', phone: '555-0104', address: '321 Pine Road, Austin, TX 78704', customerType: CustomerType.residential, notes: '', createdAt: daysAgo(45), updatedAt: daysAgo(45) },
      { name: 'Green Valley HOA', company: 'Green Valley HOA', email: 'admin@greenvalleyhoa.com', phone: '555-0105', address: '100 Community Drive, Austin, TX 78705', customerType: CustomerType.commercial, notes: 'Manages 200+ units, quarterly maintenance contracts', createdAt: daysAgo(180), updatedAt: daysAgo(7) },
      { name: 'Maria Rodriguez', company: '', email: 'maria.r@email.com', phone: '555-0106', address: '654 Elm Street, Austin, TX 78706', customerType: CustomerType.residential, notes: 'Prefers afternoon appointments', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
      { name: 'Austin Medical Center', company: 'Austin Medical Center', email: 'maintenance@austinmed.com', phone: '555-0107', address: '999 Health Pkwy, Austin, TX 78707', customerType: CustomerType.commercial, notes: 'Critical systems, 24/7 availability required', createdAt: daysAgo(200), updatedAt: daysAgo(1) },
      { name: 'David Thompson', company: '', email: 'dthompson@email.com', phone: '555-0108', address: '147 Cedar Lane, Austin, TX 78708', customerType: CustomerType.residential, notes: '', createdAt: daysAgo(15), updatedAt: daysAgo(15) },
      { name: 'Sunrise Restaurant Group', company: 'Sunrise Restaurant Group', email: 'ops@sunrisegroup.com', phone: '555-0109', address: '258 Food Court, Austin, TX 78709', customerType: CustomerType.commercial, notes: 'Multiple restaurant locations', createdAt: daysAgo(75), updatedAt: daysAgo(3) },
      { name: 'Linda Park', company: '', email: 'linda.park@email.com', phone: '555-0110', address: '369 Birch Way, Austin, TX 78710', customerType: CustomerType.residential, notes: 'New customer', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    ];

    const customerIds: bigint[] = [];
    for (const c of customerData) {
      const id = await actor.createCustomer({ id: BigInt(0), ...c });
      customerIds.push(id);
    }

    // Create technicians
    const techData = [
      { name: 'Carlos Mendez', email: 'carlos@skpm.com', phone: '555-0201', specialization: 'HVAC', skills: ['HVAC Installation', 'Refrigeration', 'Electrical'], status: TechnicianStatus.active, notes: 'Senior technician, 10 years experience', createdAt: daysAgo(365), updatedAt: daysAgo(1) },
      { name: 'Emily Johnson', email: 'emily@skpm.com', phone: '555-0202', specialization: 'Electrical', skills: ['Electrical Wiring', 'Panel Upgrades', 'Lighting'], status: TechnicianStatus.active, notes: 'Licensed electrician', createdAt: daysAgo(300), updatedAt: daysAgo(2) },
      { name: 'Marcus Williams', email: 'marcus@skpm.com', phone: '555-0203', specialization: 'Plumbing', skills: ['Plumbing', 'Pipe Repair', 'Water Heaters'], status: TechnicianStatus.active, notes: 'Master plumber', createdAt: daysAgo(250), updatedAt: daysAgo(3) },
      { name: 'Priya Patel', email: 'priya@skpm.com', phone: '555-0204', specialization: 'General Maintenance', skills: ['General Repairs', 'Carpentry', 'Painting'], status: TechnicianStatus.active, notes: 'Versatile technician', createdAt: daysAgo(180), updatedAt: daysAgo(5) },
      { name: 'Tom Bradley', email: 'tom@skpm.com', phone: '555-0205', specialization: 'Security Systems', skills: ['CCTV', 'Access Control', 'Alarm Systems'], status: TechnicianStatus.inactive, notes: 'On leave', createdAt: daysAgo(400), updatedAt: daysAgo(30) },
    ];

    const techIds: bigint[] = [];
    for (const t of techData) {
      const id = await actor.createTechnician({ id: BigInt(0), ...t });
      techIds.push(id);
    }

    // Create jobs
    const jobData = [
      { title: 'HVAC System Inspection', description: 'Annual HVAC inspection and filter replacement', customerId: customerIds[2], assignedTechnician: techIds[0], priority: JobPriority.medium, status: JobStatus.completed, scheduledDate: daysAgo(10), location: '789 Business Blvd, Austin, TX', notes: 'All units checked, filters replaced', createdAt: daysAgo(15), updatedAt: daysAgo(10) },
      { title: 'Electrical Panel Upgrade', description: 'Upgrade main electrical panel to 200A service', customerId: customerIds[0], assignedTechnician: techIds[1], priority: JobPriority.high, status: JobStatus.inProgress, scheduledDate: daysFromNow(2), location: '123 Oak Street, Austin, TX', notes: 'Permit obtained, materials ordered', createdAt: daysAgo(5), updatedAt: daysAgo(1) },
      { title: 'Emergency Pipe Repair', description: 'Burst pipe in basement, water damage present', customerId: customerIds[6], assignedTechnician: techIds[2], priority: JobPriority.urgent, status: JobStatus.completed, scheduledDate: daysAgo(3), location: '999 Health Pkwy, Austin, TX', notes: 'Pipe replaced, area dried out', createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { title: 'Kitchen Faucet Replacement', description: 'Replace leaking kitchen faucet', customerId: customerIds[1], assignedTechnician: techIds[2], priority: JobPriority.low, status: JobStatus.completed, scheduledDate: daysAgo(7), location: '456 Maple Ave, Austin, TX', notes: 'New faucet installed', createdAt: daysAgo(10), updatedAt: daysAgo(7) },
      { title: 'Commercial AC Maintenance', description: 'Quarterly maintenance for 5 AC units', customerId: customerIds[4], assignedTechnician: techIds[0], priority: JobPriority.medium, status: JobStatus.new_, scheduledDate: daysFromNow(5), location: '100 Community Drive, Austin, TX', notes: '', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
      { title: 'Lighting Installation', description: 'Install LED lighting throughout office', customerId: customerIds[8], assignedTechnician: techIds[1], priority: JobPriority.medium, status: JobStatus.inProgress, scheduledDate: daysFromNow(1), location: '258 Food Court, Austin, TX', notes: 'Materials on site', createdAt: daysAgo(4), updatedAt: daysAgo(1) },
      { title: 'Water Heater Replacement', description: 'Replace 10-year-old water heater', customerId: customerIds[3], assignedTechnician: techIds[2], priority: JobPriority.high, status: JobStatus.new_, scheduledDate: daysFromNow(3), location: '321 Pine Road, Austin, TX', notes: 'Customer requested tankless unit', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
      { title: 'General Home Inspection', description: 'Pre-purchase home inspection', customerId: customerIds[5], assignedTechnician: techIds[3], priority: JobPriority.medium, status: JobStatus.completed, scheduledDate: daysAgo(14), location: '654 Elm Street, Austin, TX', notes: 'Report delivered to customer', createdAt: daysAgo(16), updatedAt: daysAgo(14) },
      { title: 'HVAC Emergency Repair', description: 'AC not cooling, possible compressor failure', customerId: customerIds[6], assignedTechnician: techIds[0], priority: JobPriority.urgent, status: JobStatus.onHold, scheduledDate: daysFromNow(0), location: '999 Health Pkwy, Austin, TX', notes: 'Waiting for compressor part', createdAt: daysAgo(2), updatedAt: now },
      { title: 'Electrical Outlet Repair', description: 'Multiple outlets not working in kitchen', customerId: customerIds[9], assignedTechnician: techIds[1], priority: JobPriority.medium, status: JobStatus.new_, scheduledDate: daysFromNow(4), location: '369 Birch Way, Austin, TX', notes: '', createdAt: now, updatedAt: now },
      { title: 'Roof Gutter Cleaning', description: 'Clean and inspect gutters', customerId: customerIds[1], assignedTechnician: techIds[3], priority: JobPriority.low, status: JobStatus.completed, scheduledDate: daysAgo(20), location: '456 Maple Ave, Austin, TX', notes: 'Gutters cleared, minor repair done', createdAt: daysAgo(22), updatedAt: daysAgo(20) },
      { title: 'Security Camera Installation', description: 'Install 8-camera CCTV system', customerId: customerIds[2], assignedTechnician: techIds[3], priority: JobPriority.high, status: JobStatus.new_, scheduledDate: daysFromNow(7), location: '789 Business Blvd, Austin, TX', notes: 'Equipment ordered', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
      { title: 'Plumbing Inspection', description: 'Annual plumbing system inspection', customerId: customerIds[4], assignedTechnician: techIds[2], priority: JobPriority.low, status: JobStatus.completed, scheduledDate: daysAgo(30), location: '100 Community Drive, Austin, TX', notes: 'No major issues found', createdAt: daysAgo(32), updatedAt: daysAgo(30) },
      { title: 'Generator Maintenance', description: 'Service backup generator', customerId: customerIds[6], assignedTechnician: techIds[1], priority: JobPriority.high, status: JobStatus.completed, scheduledDate: daysAgo(5), location: '999 Health Pkwy, Austin, TX', notes: 'Oil changed, tested successfully', createdAt: daysAgo(7), updatedAt: daysAgo(5) },
      { title: 'Bathroom Renovation', description: 'Full bathroom remodel including plumbing', customerId: customerIds[7], assignedTechnician: techIds[2], priority: JobPriority.medium, status: JobStatus.inProgress, scheduledDate: daysFromNow(10), location: '147 Cedar Lane, Austin, TX', notes: 'Demo complete, rough-in started', createdAt: daysAgo(8), updatedAt: daysAgo(1) },
      { title: 'Commercial Kitchen Repair', description: 'Repair commercial dishwasher and hood system', customerId: customerIds[8], assignedTechnician: techIds[0], priority: JobPriority.urgent, status: JobStatus.completed, scheduledDate: daysAgo(1), location: '258 Food Court, Austin, TX', notes: 'Both units repaired and tested', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
      { title: 'Parking Lot Lighting', description: 'Replace parking lot light fixtures', customerId: customerIds[4], assignedTechnician: techIds[1], priority: JobPriority.medium, status: JobStatus.cancelled, scheduledDate: daysAgo(15), location: '100 Community Drive, Austin, TX', notes: 'Cancelled by customer, budget constraints', createdAt: daysAgo(20), updatedAt: daysAgo(15) },
      { title: 'HVAC Filter Replacement', description: 'Replace all HVAC filters', customerId: customerIds[0], assignedTechnician: techIds[0], priority: JobPriority.low, status: JobStatus.completed, scheduledDate: daysAgo(25), location: '123 Oak Street, Austin, TX', notes: 'All 12 filters replaced', createdAt: daysAgo(27), updatedAt: daysAgo(25) },
      { title: 'Electrical Safety Audit', description: 'Full electrical safety inspection', customerId: customerIds[2], assignedTechnician: techIds[1], priority: JobPriority.high, status: JobStatus.new_, scheduledDate: daysFromNow(6), location: '789 Business Blvd, Austin, TX', notes: 'Required for insurance renewal', createdAt: now, updatedAt: now },
      { title: 'Drain Cleaning', description: 'Clear blocked drains in multiple units', customerId: customerIds[4], assignedTechnician: techIds[2], priority: JobPriority.medium, status: JobStatus.new_, scheduledDate: daysFromNow(2), location: '100 Community Drive, Austin, TX', notes: '', createdAt: now, updatedAt: now },
    ];

    const jobIds: bigint[] = [];
    for (const j of jobData) {
      const id = await actor.createJob({ id: BigInt(0), ...j });
      jobIds.push(id);
    }

    // Create invoices
    const invoiceData = [
      { invoiceNumber: 'INV-001', customerId: customerIds[2], jobId: jobIds[0], issueDate: daysAgo(9), dueDate: daysFromNow(21), lineItems: [{ description: 'HVAC Inspection (5 units)', quantity: 5, unitPrice: 150 }, { description: 'Filter Replacement', quantity: 20, unitPrice: 25 }], subtotal: 1250, taxRate: 8.25, total: 1353.13, paymentStatus: PaymentStatus.paid, notes: 'Thank you for your business', createdAt: daysAgo(9), updatedAt: daysAgo(5) },
      { invoiceNumber: 'INV-002', customerId: customerIds[6], jobId: jobIds[2], issueDate: daysAgo(2), dueDate: daysFromNow(28), lineItems: [{ description: 'Emergency Pipe Repair', quantity: 1, unitPrice: 850 }, { description: 'Materials', quantity: 1, unitPrice: 320 }], subtotal: 1170, taxRate: 8.25, total: 1266.53, paymentStatus: PaymentStatus.unpaid, notes: 'Emergency service surcharge applied', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
      { invoiceNumber: 'INV-003', customerId: customerIds[1], jobId: jobIds[3], issueDate: daysAgo(6), dueDate: daysFromNow(24), lineItems: [{ description: 'Faucet Replacement Labor', quantity: 2, unitPrice: 95 }, { description: 'Faucet Unit', quantity: 1, unitPrice: 185 }], subtotal: 375, taxRate: 8.25, total: 405.94, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(6), updatedAt: daysAgo(4) },
      { invoiceNumber: 'INV-004', customerId: customerIds[1], jobId: jobIds[10], issueDate: daysAgo(19), dueDate: daysFromNow(11), lineItems: [{ description: 'Gutter Cleaning', quantity: 1, unitPrice: 250 }, { description: 'Minor Gutter Repair', quantity: 1, unitPrice: 75 }], subtotal: 325, taxRate: 8.25, total: 351.81, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(19), updatedAt: daysAgo(17) },
      { invoiceNumber: 'INV-005', customerId: customerIds[5], jobId: jobIds[7], issueDate: daysAgo(13), dueDate: daysFromNow(17), lineItems: [{ description: 'Home Inspection', quantity: 1, unitPrice: 450 }], subtotal: 450, taxRate: 8.25, total: 487.13, paymentStatus: PaymentStatus.paid, notes: 'Inspection report included', createdAt: daysAgo(13), updatedAt: daysAgo(11) },
      { invoiceNumber: 'INV-006', customerId: customerIds[6], jobId: jobIds[13], issueDate: daysAgo(4), dueDate: daysFromNow(26), lineItems: [{ description: 'Generator Service', quantity: 1, unitPrice: 380 }, { description: 'Oil & Filters', quantity: 1, unitPrice: 85 }], subtotal: 465, taxRate: 8.25, total: 503.36, paymentStatus: PaymentStatus.unpaid, notes: '', createdAt: daysAgo(4), updatedAt: daysAgo(4) },
      { invoiceNumber: 'INV-007', customerId: customerIds[4], jobId: jobIds[12], issueDate: daysAgo(29), dueDate: daysAgo(1), lineItems: [{ description: 'Plumbing Inspection (200 units)', quantity: 1, unitPrice: 1200 }], subtotal: 1200, taxRate: 8.25, total: 1299, paymentStatus: PaymentStatus.overdue, notes: 'Payment overdue', createdAt: daysAgo(29), updatedAt: daysAgo(1) },
      { invoiceNumber: 'INV-008', customerId: customerIds[8], jobId: jobIds[15], issueDate: daysAgo(0), dueDate: daysFromNow(30), lineItems: [{ description: 'Commercial Kitchen Repair', quantity: 1, unitPrice: 650 }, { description: 'Hood System Service', quantity: 1, unitPrice: 420 }, { description: 'Parts', quantity: 1, unitPrice: 280 }], subtotal: 1350, taxRate: 8.25, total: 1461.38, paymentStatus: PaymentStatus.unpaid, notes: 'Urgent repair completed', createdAt: now, updatedAt: now },
      { invoiceNumber: 'INV-009', customerId: customerIds[0], jobId: jobIds[17], issueDate: daysAgo(24), dueDate: daysFromNow(6), lineItems: [{ description: 'HVAC Filter Replacement (12 units)', quantity: 12, unitPrice: 45 }], subtotal: 540, taxRate: 8.25, total: 584.55, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(24), updatedAt: daysAgo(20) },
      { invoiceNumber: 'INV-010', customerId: customerIds[3], jobId: undefined, issueDate: daysAgo(45), dueDate: daysAgo(15), lineItems: [{ description: 'Plumbing Consultation', quantity: 1, unitPrice: 150 }], subtotal: 150, taxRate: 8.25, total: 162.38, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(45), updatedAt: daysAgo(40) },
      { invoiceNumber: 'INV-011', customerId: customerIds[2], jobId: undefined, issueDate: daysAgo(60), dueDate: daysAgo(30), lineItems: [{ description: 'Annual Maintenance Contract Q1', quantity: 1, unitPrice: 2400 }], subtotal: 2400, taxRate: 8.25, total: 2598, paymentStatus: PaymentStatus.paid, notes: 'Quarterly contract payment', createdAt: daysAgo(60), updatedAt: daysAgo(55) },
      { invoiceNumber: 'INV-012', customerId: customerIds[6], jobId: undefined, issueDate: daysAgo(90), dueDate: daysAgo(60), lineItems: [{ description: 'Emergency Response Retainer', quantity: 1, unitPrice: 1800 }], subtotal: 1800, taxRate: 8.25, total: 1948.5, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(90), updatedAt: daysAgo(85) },
      { invoiceNumber: 'INV-013', customerId: customerIds[4], jobId: undefined, issueDate: daysAgo(120), dueDate: daysAgo(90), lineItems: [{ description: 'HOA Maintenance Contract Q4', quantity: 1, unitPrice: 3200 }], subtotal: 3200, taxRate: 8.25, total: 3464, paymentStatus: PaymentStatus.paid, notes: '', createdAt: daysAgo(120), updatedAt: daysAgo(115) },
      { invoiceNumber: 'INV-014', customerId: customerIds[8], jobId: jobIds[5], issueDate: daysAgo(3), dueDate: daysFromNow(27), lineItems: [{ description: 'LED Lighting Installation (partial)', quantity: 1, unitPrice: 800 }], subtotal: 800, taxRate: 8.25, total: 866, paymentStatus: PaymentStatus.partial, notes: '50% deposit received', createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { invoiceNumber: 'INV-015', customerId: customerIds[7], jobId: jobIds[14], issueDate: daysAgo(7), dueDate: daysFromNow(23), lineItems: [{ description: 'Bathroom Renovation (Phase 1)', quantity: 1, unitPrice: 2200 }, { description: 'Materials', quantity: 1, unitPrice: 850 }], subtotal: 3050, taxRate: 8.25, total: 3301.63, paymentStatus: PaymentStatus.partial, notes: 'Phase 1 of 3', createdAt: daysAgo(7), updatedAt: daysAgo(5) },
    ];

    for (const inv of invoiceData) {
      await actor.createInvoice({
        id: BigInt(0),
        ...inv,
        jobId: inv.jobId,
      });
    }

    // Create inventory items
    const inventoryData = [
      { name: 'HVAC Air Filter 16x20x1', sku: 'HVAC-F-001', category: 'HVAC', quantityInStock: BigInt(45), minimumStockThreshold: BigInt(10), unitCost: 12.99, supplier: 'FilterPro Supply', notes: 'Standard residential filter', createdAt: daysAgo(180), updatedAt: daysAgo(10) },
      { name: 'HVAC Air Filter 20x25x1', sku: 'HVAC-F-002', category: 'HVAC', quantityInStock: BigInt(30), minimumStockThreshold: BigInt(10), unitCost: 15.99, supplier: 'FilterPro Supply', notes: 'Commercial grade', createdAt: daysAgo(180), updatedAt: daysAgo(10) },
      { name: 'Refrigerant R-410A (25lb)', sku: 'HVAC-R-001', category: 'HVAC', quantityInStock: BigInt(8), minimumStockThreshold: BigInt(5), unitCost: 185.00, supplier: 'HVAC Wholesale', notes: 'Requires EPA certification', createdAt: daysAgo(90), updatedAt: daysAgo(5) },
      { name: 'Capacitor 45/5 MFD', sku: 'HVAC-C-001', category: 'HVAC', quantityInStock: BigInt(3), minimumStockThreshold: BigInt(5), unitCost: 28.50, supplier: 'HVAC Wholesale', notes: 'Low stock - reorder needed', createdAt: daysAgo(90), updatedAt: daysAgo(3) },
      { name: 'Circuit Breaker 20A', sku: 'ELEC-CB-020', category: 'Electrical', quantityInStock: BigInt(25), minimumStockThreshold: BigInt(8), unitCost: 18.75, supplier: 'ElecSupply Co', notes: 'Single pole', createdAt: daysAgo(120), updatedAt: daysAgo(15) },
      { name: 'Circuit Breaker 30A', sku: 'ELEC-CB-030', category: 'Electrical', quantityInStock: BigInt(15), minimumStockThreshold: BigInt(5), unitCost: 22.50, supplier: 'ElecSupply Co', notes: 'Double pole', createdAt: daysAgo(120), updatedAt: daysAgo(15) },
      { name: 'Electrical Outlet (GFCI)', sku: 'ELEC-OUT-GFCI', category: 'Electrical', quantityInStock: BigInt(40), minimumStockThreshold: BigInt(10), unitCost: 24.99, supplier: 'ElecSupply Co', notes: 'Tamper resistant', createdAt: daysAgo(90), updatedAt: daysAgo(7) },
      { name: 'Wire 12 AWG (100ft)', sku: 'ELEC-W-12', category: 'Electrical', quantityInStock: BigInt(12), minimumStockThreshold: BigInt(5), unitCost: 45.00, supplier: 'ElecSupply Co', notes: 'THHN copper', createdAt: daysAgo(60), updatedAt: daysAgo(20) },
      { name: 'PVC Pipe 1/2" (10ft)', sku: 'PLMB-P-05', category: 'Plumbing', quantityInStock: BigInt(50), minimumStockThreshold: BigInt(15), unitCost: 8.50, supplier: 'PlumbRight Supply', notes: 'Schedule 40', createdAt: daysAgo(150), updatedAt: daysAgo(12) },
      { name: 'PVC Pipe 3/4" (10ft)', sku: 'PLMB-P-075', category: 'Plumbing', quantityInStock: BigInt(35), minimumStockThreshold: BigInt(10), unitCost: 11.25, supplier: 'PlumbRight Supply', notes: 'Schedule 40', createdAt: daysAgo(150), updatedAt: daysAgo(12) },
      { name: 'Ball Valve 1/2"', sku: 'PLMB-V-05', category: 'Plumbing', quantityInStock: BigInt(20), minimumStockThreshold: BigInt(8), unitCost: 15.99, supplier: 'PlumbRight Supply', notes: 'Brass construction', createdAt: daysAgo(90), updatedAt: daysAgo(8) },
      { name: 'Pipe Fittings Assortment', sku: 'PLMB-FIT-AST', category: 'Plumbing', quantityInStock: BigInt(4), minimumStockThreshold: BigInt(5), unitCost: 35.00, supplier: 'PlumbRight Supply', notes: 'Low stock', createdAt: daysAgo(90), updatedAt: daysAgo(5) },
      { name: 'Teflon Tape (10-pack)', sku: 'PLMB-TT-010', category: 'Plumbing', quantityInStock: BigInt(60), minimumStockThreshold: BigInt(20), unitCost: 12.00, supplier: 'PlumbRight Supply', notes: '', createdAt: daysAgo(180), updatedAt: daysAgo(30) },
      { name: 'LED Bulb A19 (10-pack)', sku: 'LIGHT-LED-A19', category: 'Lighting', quantityInStock: BigInt(80), minimumStockThreshold: BigInt(20), unitCost: 22.99, supplier: 'LightTech Dist', notes: '60W equivalent, 5000K', createdAt: daysAgo(60), updatedAt: daysAgo(5) },
      { name: 'LED Panel Light 2x4', sku: 'LIGHT-LED-P24', category: 'Lighting', quantityInStock: BigInt(18), minimumStockThreshold: BigInt(6), unitCost: 65.00, supplier: 'LightTech Dist', notes: 'Commercial grade', createdAt: daysAgo(60), updatedAt: daysAgo(5) },
      { name: 'Caulk Silicone (12oz)', sku: 'GEN-CAULK-SIL', category: 'General', quantityInStock: BigInt(30), minimumStockThreshold: BigInt(10), unitCost: 8.99, supplier: 'General Supply Co', notes: 'Clear, waterproof', createdAt: daysAgo(120), updatedAt: daysAgo(20) },
      { name: 'Drywall Screws (1lb)', sku: 'GEN-SCREW-DW', category: 'General', quantityInStock: BigInt(25), minimumStockThreshold: BigInt(8), unitCost: 6.50, supplier: 'General Supply Co', notes: '', createdAt: daysAgo(120), updatedAt: daysAgo(20) },
      { name: 'Safety Gloves (pair)', sku: 'SAFE-GLOVE-01', category: 'Safety', quantityInStock: BigInt(2), minimumStockThreshold: BigInt(10), unitCost: 14.99, supplier: 'SafeWork Supply', notes: 'Critical low stock', createdAt: daysAgo(90), updatedAt: daysAgo(2) },
      { name: 'Safety Glasses', sku: 'SAFE-GLASS-01', category: 'Safety', quantityInStock: BigInt(8), minimumStockThreshold: BigInt(10), unitCost: 9.99, supplier: 'SafeWork Supply', notes: 'Low stock', createdAt: daysAgo(90), updatedAt: daysAgo(10) },
      { name: 'Thermostat Digital', sku: 'HVAC-THERM-01', category: 'HVAC', quantityInStock: BigInt(10), minimumStockThreshold: BigInt(3), unitCost: 89.99, supplier: 'HVAC Wholesale', notes: 'Programmable', createdAt: daysAgo(60), updatedAt: daysAgo(15) },
      { name: 'Drain Snake 25ft', sku: 'PLMB-SNAKE-25', category: 'Plumbing', quantityInStock: BigInt(5), minimumStockThreshold: BigInt(2), unitCost: 45.00, supplier: 'PlumbRight Supply', notes: 'Manual', createdAt: daysAgo(180), updatedAt: daysAgo(30) },
      { name: 'Electrical Tape (10-pack)', sku: 'ELEC-TAPE-10', category: 'Electrical', quantityInStock: BigInt(35), minimumStockThreshold: BigInt(10), unitCost: 15.00, supplier: 'ElecSupply Co', notes: '', createdAt: daysAgo(120), updatedAt: daysAgo(25) },
      { name: 'Conduit 1/2" EMT (10ft)', sku: 'ELEC-COND-05', category: 'Electrical', quantityInStock: BigInt(20), minimumStockThreshold: BigInt(8), unitCost: 12.50, supplier: 'ElecSupply Co', notes: '', createdAt: daysAgo(90), updatedAt: daysAgo(15) },
      { name: 'Water Heater Element', sku: 'PLMB-WHE-001', category: 'Plumbing', quantityInStock: BigInt(6), minimumStockThreshold: BigInt(3), unitCost: 35.00, supplier: 'PlumbRight Supply', notes: '4500W', createdAt: daysAgo(60), updatedAt: daysAgo(10) },
      { name: 'Smoke Detector', sku: 'SAFE-SMOKE-01', category: 'Safety', quantityInStock: BigInt(15), minimumStockThreshold: BigInt(5), unitCost: 28.99, supplier: 'SafeWork Supply', notes: '10-year battery', createdAt: daysAgo(90), updatedAt: daysAgo(20) },
      { name: 'CO Detector', sku: 'SAFE-CO-01', category: 'Safety', quantityInStock: BigInt(10), minimumStockThreshold: BigInt(4), unitCost: 34.99, supplier: 'SafeWork Supply', notes: 'Combination unit', createdAt: daysAgo(90), updatedAt: daysAgo(20) },
      { name: 'Pipe Insulation 1/2"', sku: 'PLMB-INS-05', category: 'Plumbing', quantityInStock: BigInt(40), minimumStockThreshold: BigInt(15), unitCost: 5.50, supplier: 'PlumbRight Supply', notes: 'Foam, 6ft sections', createdAt: daysAgo(120), updatedAt: daysAgo(30) },
      { name: 'Junction Box 4"', sku: 'ELEC-JB-4', category: 'Electrical', quantityInStock: BigInt(30), minimumStockThreshold: BigInt(10), unitCost: 4.99, supplier: 'ElecSupply Co', notes: 'Metal', createdAt: daysAgo(120), updatedAt: daysAgo(25) },
      { name: 'Pressure Gauge', sku: 'PLMB-PG-001', category: 'Plumbing', quantityInStock: BigInt(8), minimumStockThreshold: BigInt(3), unitCost: 22.00, supplier: 'PlumbRight Supply', notes: '0-200 PSI', createdAt: daysAgo(90), updatedAt: daysAgo(15) },
      { name: 'Voltage Tester', sku: 'ELEC-VT-001', category: 'Electrical', quantityInStock: BigInt(7), minimumStockThreshold: BigInt(3), unitCost: 38.00, supplier: 'ElecSupply Co', notes: 'Non-contact', createdAt: daysAgo(180), updatedAt: daysAgo(60) },
    ];

    for (const item of inventoryData) {
      await actor.createInventoryItem({ id: BigInt(0), ...item });
    }

  } catch (err) {
    console.warn('Seed data error (may already exist):', err);
  }
}
