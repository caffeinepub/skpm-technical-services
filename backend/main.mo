import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";

actor {
  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  // ── User Profile ──────────────────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Job Types & State ─────────────────────────────────────────────────────

  public type JobPriority = { #low; #medium; #high; #urgent };
  public type JobStatus = { #new; #inProgress; #onHold; #completed; #cancelled };

  public type Job = {
    id : Nat;
    title : Text;
    description : Text;
    customerId : Nat;
    assignedTechnician : ?Nat;
    priority : JobPriority;
    status : JobStatus;
    scheduledDate : ?Time.Time;
    location : Text;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let jobs = Map.empty<Nat, Job>();
  var nextJobId = 1;

  // ── Job CRUD (require #user) ───────────────────────────────────────────────

  public shared ({ caller }) func createJob(job : Job) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    let newJobId = nextJobId;
    let finalizedJob = { job with id = newJobId };
    jobs.add(newJobId, finalizedJob);
    nextJobId += 1;
    newJobId;
  };

  public shared ({ caller }) func updateJob(id : Nat, job : Job) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?_) { jobs.add(id, job) };
    };
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete jobs");
    };
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?_) { jobs.remove(id) };
    };
  };

  // ── Job Queries (require #user) ───────────────────────────────────────────

  public query ({ caller }) func getJob(id : Nat) : async ?Job {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.get(id);
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list jobs");
    };
    jobs.values().toArray();
  };

  public query ({ caller }) func getJobsByPriority(priority : JobPriority) : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(func(j : Job) : Bool { j.priority == priority });
  };

  public query ({ caller }) func getJobsByStatus(status : JobStatus) : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(func(j : Job) : Bool { j.status == status });
  };

  public query ({ caller }) func getJobsByTechnician(techId : Nat) : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(func(j : Job) : Bool { j.assignedTechnician == ?techId });
  };

  public query ({ caller }) func getJobsByCustomer(customerId : Nat) : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(func(j : Job) : Bool { j.customerId == customerId });
  };

  public query ({ caller }) func getJobsByDateRange(start : Time.Time, end : Time.Time) : async [Job] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(
      func(j : Job) : Bool {
        switch (j.scheduledDate) {
          case (?date) { date >= start and date <= end };
          case (null) { false };
        };
      }
    );
  };

  public query ({ caller }) func getAllPriorities() : async [JobPriority] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view priorities");
    };
    [#low, #medium, #high, #urgent];
  };

  public query ({ caller }) func getAllStatuses() : async [JobStatus] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view statuses");
    };
    [#new, #inProgress, #onHold, #completed, #cancelled];
  };

  // ── Customer Types & State ────────────────────────────────────────────────

  public type CustomerType = { #residential; #commercial };

  public type Customer = {
    id : Nat;
    name : Text;
    company : Text;
    email : Text;
    phone : Text;
    address : Text;
    customerType : CustomerType;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let customers = Map.empty<Nat, Customer>();
  var nextCustomerId = 1;

  // ── Customer CRUD ─────────────────────────────────────────────────────────

  public shared ({ caller }) func createCustomer(customer : Customer) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create customers");
    };
    let newId = nextCustomerId;
    let finalized = { customer with id = newId };
    customers.add(newId, finalized);
    nextCustomerId += 1;
    newId;
  };

  public shared ({ caller }) func updateCustomer(id : Nat, customer : Customer) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?_) { customers.add(id, customer) };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?_) { customers.remove(id) };
    };
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customers.get(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list customers");
    };
    customers.values().toArray();
  };

  public query ({ caller }) func searchCustomers(searchText : Text) : async [Customer] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search customers");
    };
    let lowerQuery = searchText.toLower();
    customers.values().toArray().filter(
      func(c : Customer) : Bool {
        c.name.toLower().contains(#text lowerQuery) or
        c.company.toLower().contains(#text lowerQuery) or
        c.email.toLower().contains(#text lowerQuery);
      }
    );
  };

  // ── Invoice Types & State ─────────────────────────────────────────────────

  public type PaymentStatus = { #unpaid; #partial; #paid; #overdue };

  public type LineItem = {
    description : Text;
    quantity : Float;
    unitPrice : Float;
  };

  public type Invoice = {
    id : Nat;
    invoiceNumber : Text;
    customerId : Nat;
    jobId : ?Nat;
    issueDate : Time.Time;
    dueDate : Time.Time;
    lineItems : [LineItem];
    subtotal : Float;
    taxRate : Float;
    total : Float;
    paymentStatus : PaymentStatus;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let invoices = Map.empty<Nat, Invoice>();
  var nextInvoiceId = 1;

  // ── Invoice CRUD ──────────────────────────────────────────────────────────

  public shared ({ caller }) func createInvoice(invoice : Invoice) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };
    let newId = nextInvoiceId;
    let finalized = { invoice with id = newId };
    invoices.add(newId, finalized);
    nextInvoiceId += 1;
    newId;
  };

  public shared ({ caller }) func updateInvoice(id : Nat, invoice : Invoice) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update invoices");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?_) { invoices.add(id, invoice) };
    };
  };

  public shared ({ caller }) func markInvoicePaid(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark invoices as paid");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?inv) {
        let updated = { inv with paymentStatus = #paid; updatedAt = Time.now() };
        invoices.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete invoices");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?_) { invoices.remove(id) };
    };
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list invoices");
    };
    invoices.values().toArray();
  };

  public query ({ caller }) func getInvoicesByCustomer(customerId : Nat) : async [Invoice] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray().filter(func(i : Invoice) : Bool { i.customerId == customerId });
  };

  public query ({ caller }) func getInvoicesByStatus(status : PaymentStatus) : async [Invoice] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray().filter(func(i : Invoice) : Bool { i.paymentStatus == status });
  };

  // ── Technician Types & State ──────────────────────────────────────────────

  public type TechnicianStatus = { #active; #inactive };

  public type Technician = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    specialization : Text;
    skills : [Text];
    status : TechnicianStatus;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let technicians = Map.empty<Nat, Technician>();
  var nextTechnicianId = 1;

  // ── Technician CRUD ───────────────────────────────────────────────────────

  public shared ({ caller }) func createTechnician(technician : Technician) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create technicians");
    };
    let newId = nextTechnicianId;
    let finalized = { technician with id = newId };
    technicians.add(newId, finalized);
    nextTechnicianId += 1;
    newId;
  };

  public shared ({ caller }) func updateTechnician(id : Nat, technician : Technician) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update technicians");
    };
    switch (technicians.get(id)) {
      case (null) { Runtime.trap("Technician does not exist") };
      case (?_) { technicians.add(id, technician) };
    };
  };

  public shared ({ caller }) func deactivateTechnician(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can deactivate technicians");
    };
    switch (technicians.get(id)) {
      case (null) { Runtime.trap("Technician does not exist") };
      case (?tech) {
        let updated = { tech with status = #inactive; updatedAt = Time.now() };
        technicians.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTechnician(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete technicians");
    };
    switch (technicians.get(id)) {
      case (null) { Runtime.trap("Technician does not exist") };
      case (?_) { technicians.remove(id) };
    };
  };

  public query ({ caller }) func getTechnician(id : Nat) : async ?Technician {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view technicians");
    };
    technicians.get(id);
  };

  public query ({ caller }) func getAllTechnicians() : async [Technician] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list technicians");
    };
    technicians.values().toArray();
  };

  // ── Inventory Types & State ───────────────────────────────────────────────

  public type InventoryItem = {
    id : Nat;
    name : Text;
    sku : Text;
    category : Text;
    quantityInStock : Nat;
    minimumStockThreshold : Nat;
    unitCost : Float;
    supplier : Text;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type StockUsageRecord = {
    id : Nat;
    itemId : Nat;
    jobId : Nat;
    quantityUsed : Nat;
    usedAt : Time.Time;
  };

  let inventory = Map.empty<Nat, InventoryItem>();
  var nextInventoryId = 1;

  let stockUsageRecords = Map.empty<Nat, StockUsageRecord>();
  var nextStockUsageId = 1;

  // ── Inventory CRUD ────────────────────────────────────────────────────────

  public shared ({ caller }) func createInventoryItem(item : InventoryItem) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create inventory items");
    };
    let newId = nextInventoryId;
    let finalized = { item with id = newId };
    inventory.add(newId, finalized);
    nextInventoryId += 1;
    newId;
  };

  public shared ({ caller }) func updateInventoryItem(id : Nat, item : InventoryItem) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update inventory items");
    };
    switch (inventory.get(id)) {
      case (null) { Runtime.trap("Inventory item does not exist") };
      case (?_) { inventory.add(id, item) };
    };
  };

  public shared ({ caller }) func deleteInventoryItem(id : Nat) : async () {
    if (not Auth.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete inventory items");
    };
    switch (inventory.get(id)) {
      case (null) { Runtime.trap("Inventory item does not exist") };
      case (?_) { inventory.remove(id) };
    };
  };

  public shared ({ caller }) func recordStockUsage(itemId : Nat, jobId : Nat, quantityUsed : Nat) : async Nat {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record stock usage");
    };
    switch (inventory.get(itemId)) {
      case (null) { Runtime.trap("Inventory item does not exist") };
      case (?item) {
        if (item.quantityInStock < quantityUsed) {
          Runtime.trap("Insufficient stock");
        };
        let updated = {
          item with
          quantityInStock = item.quantityInStock - quantityUsed;
          updatedAt = Time.now();
        };
        inventory.add(itemId, updated);
        let usageId = nextStockUsageId;
        let record : StockUsageRecord = {
          id = usageId;
          itemId = itemId;
          jobId = jobId;
          quantityUsed = quantityUsed;
          usedAt = Time.now();
        };
        stockUsageRecords.add(usageId, record);
        nextStockUsageId += 1;
        usageId;
      };
    };
  };

  public query ({ caller }) func getInventoryItem(id : Nat) : async ?InventoryItem {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };
    inventory.get(id);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list inventory");
    };
    inventory.values().toArray();
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };
    inventory.values().toArray().filter(
      func(item : InventoryItem) : Bool {
        item.quantityInStock <= item.minimumStockThreshold;
      }
    );
  };

  public query ({ caller }) func getStockUsageByJob(jobId : Nat) : async [StockUsageRecord] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view stock usage");
    };
    stockUsageRecords.values().toArray().filter(
      func(r : StockUsageRecord) : Bool { r.jobId == jobId }
    );
  };

  // ── Dashboard / Reports ───────────────────────────────────────────────────

  public type DashboardStats = {
    totalOpenJobs : Nat;
    completedJobsToday : Nat;
    pendingInvoices : Nat;
    totalRevenueThisMonth : Float;
    totalJobs : Nat;
    totalCustomers : Nat;
    totalTechnicians : Nat;
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    let now = Time.now();
    let oneDayNs : Int = 86_400_000_000_000;
    let startOfToday = now - (now % oneDayNs);
    let thirtyDaysNs : Int = 30 * oneDayNs;
    let startOfMonth = now - thirtyDaysNs;

    let allJobs = jobs.values().toArray();
    let allInvoices = invoices.values().toArray();

    let openJobs = allJobs.filter(
      func(j : Job) : Bool {
        j.status == #new or j.status == #inProgress or j.status == #onHold;
      }
    );

    let completedToday = allJobs.filter(
      func(j : Job) : Bool {
        if (j.status != #completed) { return false };
        switch (j.scheduledDate) {
          case (?d) { d >= startOfToday };
          case (null) { false };
        };
      }
    );

    let pendingInv = allInvoices.filter(
      func(i : Invoice) : Bool {
        i.paymentStatus == #unpaid or i.paymentStatus == #partial or i.paymentStatus == #overdue;
      }
    );

    var revenueThisMonth : Float = 0.0;
    for (inv in allInvoices.vals()) {
      if (inv.paymentStatus == #paid and inv.issueDate >= startOfMonth) {
        revenueThisMonth += inv.total;
      };
    };

    {
      totalOpenJobs = openJobs.size();
      completedJobsToday = completedToday.size();
      pendingInvoices = pendingInv.size();
      totalRevenueThisMonth = revenueThisMonth;
      totalJobs = allJobs.size();
      totalCustomers = customers.values().toArray().size();
      totalTechnicians = technicians.values().toArray().size();
    };
  };

  public type JobStatusSummary = {
    status : JobStatus;
    count : Nat;
  };

  public query ({ caller }) func getJobStatusSummary() : async [JobStatusSummary] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    let allJobs = jobs.values().toArray();
    let statuses : [JobStatus] = [#new, #inProgress, #onHold, #completed, #cancelled];
    statuses.map(
      func(s : JobStatus) : JobStatusSummary {
        let count = allJobs.filter(func(j : Job) : Bool { j.status == s }).size();
        { status = s; count = count };
      }
    );
  };

  public type TechnicianPerformance = {
    technicianId : Nat;
    technicianName : Text;
    completedJobs : Nat;
    assignedJobs : Nat;
  };

  public query ({ caller }) func getTechnicianPerformance() : async [TechnicianPerformance] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    let allJobs = jobs.values().toArray();
    technicians.values().toArray().map(
      func(tech : Technician) : TechnicianPerformance {
        let techJobs = allJobs.filter(
          func(j : Job) : Bool { j.assignedTechnician == ?tech.id }
        );
        let completed = techJobs.filter(
          func(j : Job) : Bool { j.status == #completed }
        );
        {
          technicianId = tech.id;
          technicianName = tech.name;
          completedJobs = completed.size();
          assignedJobs = techJobs.size();
        };
      }
    );
  };

  public type RevenueByMonth = {
    month : Text;
    invoiced : Float;
    collected : Float;
  };

  public query ({ caller }) func getRevenueReport() : async [RevenueByMonth] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    // Returns aggregate totals as a simple summary
    let allInvoices = invoices.values().toArray();
    var totalInvoiced : Float = 0.0;
    var totalCollected : Float = 0.0;
    for (inv in allInvoices.vals()) {
      totalInvoiced += inv.total;
      if (inv.paymentStatus == #paid) {
        totalCollected += inv.total;
      };
    };
    [{ month = "All Time"; invoiced = totalInvoiced; collected = totalCollected }];
  };

  public type InventoryUsageSummary = {
    itemId : Nat;
    itemName : Text;
    totalUsed : Nat;
  };

  public query ({ caller }) func getInventoryUsageReport() : async [InventoryUsageSummary] {
    if (not Auth.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    let allUsage = stockUsageRecords.values().toArray();
    inventory.values().toArray().map(
      func(item : InventoryItem) : InventoryUsageSummary {
        let usageForItem = allUsage.filter(
          func(r : StockUsageRecord) : Bool { r.itemId == item.id }
        );
        var total : Nat = 0;
        for (r in usageForItem.vals()) {
          total += r.quantityUsed;
        };
        { itemId = item.id; itemName = item.name; totalUsed = total };
      }
    );
  };
};
