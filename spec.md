# Specification

## Summary
**Goal:** Build a full-featured field service management web application for SKPM Technical Services with eight core modules, a professional visual theme, and realistic seed data.

**Planned changes:**
- **Dashboard:** KPI cards (open jobs, completed today, pending invoices, monthly revenue, technician utilization) plus a job-status distribution chart and recent activity feed
- **Jobs / Work Orders:** Create, list, edit, and delete jobs with fields for title, description, customer, technician, priority, status, scheduled date, location, and notes; filterable by status, priority, technician, and date range
- **CRM:** Customer records (name, company, contact info, type, notes); searchable list; detail page showing linked jobs and invoices; full CRUD
- **Invoicing & Billing:** Auto-numbered invoices linked to customers and optional jobs; line-item entry with auto-computed subtotal, tax, and total; status tracking (Unpaid/Partial/Paid/Overdue); filter by status and customer
- **Scheduling & Calendar:** Monthly and weekly calendar views showing jobs as events with technician and status info; click-to-schedule; list view of upcoming jobs
- **Inventory / Parts & Stock:** Item records (name, SKU, category, quantity, minimum threshold, unit cost, supplier); low-stock alerts; stock usage recording against a job; full CRUD
- **Technician / Staff Management:** Technician records (name, contact, specialization, status); detail page with job history; active technicians populate job-assignment dropdowns; create, edit, deactivate
- **Reports & Analytics:** Four pre-built reports (Jobs Summary, Revenue, Technician Performance, Inventory Usage) with date-range filter, bar/line charts, and tabular data
- **Seed data:** On first load, insert at least 10 customers, 5 technicians, 20 jobs, 15 invoices, 30 inventory items, and scheduled events for the current month if no records exist
- **Theme & Navigation:** Deep navy/steel-gray left sidebar with amber accent colors, card-based layouts, compact data tables, active-item highlighting, and SKPM logo at the top of the sidebar

**User-visible outcome:** Users can open the app and immediately see a populated dashboard, then navigate between all eight modules to manage jobs, customers, invoices, scheduling, inventory, technicians, and reports within a consistent professional field-service UI.
