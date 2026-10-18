"use strict";

const test = require("node:test");
const assert = require("node:assert");
const User = require("./User");
const StudentRequester = require("./StudentRequester");
const StaffRequester = require("./StaffRequester");
const ServiceOfficer = require("./ServiceOfficer");
const Technician = require("./Technician");
const ServiceRequest = require("./ServiceRequest");
const ICTSupportRequest = require("./ICTSupportRequest");
const MaintenanceRequest = require("./MaintenanceRequest");
const CleaningRequest = require("./CleaningRequest");
const ServiceRequestManager = require("./ServiceRequestManager");

// ---------- helpers ----------
function setup() {
  const m = new ServiceRequestManager();
  const student = m.registerUser(new StudentRequester("S001", "Mary", "Kila", "mary@dwu.ac.pg", "Information Systems", 3));
  const staff = m.registerUser(new StaffRequester("E001", "Peter", "Wan", "peter@dwu.ac.pg", "Library"));
  const officer = m.registerUser(new ServiceOfficer("O001", "Grace", "Tau", "grace@dwu.ac.pg", "ICT Services"));
  const tech = m.registerUser(new Technician("T001", "Joe", "Bani", "joe@dwu.ac.pg", "Networking"));
  const tech2 = m.registerUser(new Technician("T002", "Ann", "Lui", "ann@dwu.ac.pg", "Electrical"));
  return { m, student, staff, officer, tech, tech2 };
}

const common = (requester, requestId, extra = {}) => ({
  requestId, requester, title: "Wi-Fi down", description: "No signal in lab", location: "Block A", priority: "Normal", ...extra,
});
const ictFields = (extra = {}) => ({
  deviceType: "Laptop", systemName: "Moodle", faultType: "Network", networkImpact: "Single User", ...extra,
});
const makeIct = (requester, id = "REQ001", commonExtra = {}, ictExtra = {}) =>
  new ICTSupportRequest(common(requester, id, commonExtra), ictFields(ictExtra));
const makeMaintenance = (requester, id = "REQ002", extra = {}, commonExtra = {}) =>
  new MaintenanceRequest(common(requester, id, { title: "Broken light", description: "Flickering", location: "Block B", ...commonExtra }), {
    building: "Block B", roomNumber: "B12", hazardLevel: "Medium", equipmentAffected: "Ceiling light", ...extra,
  });
const makeCleaning = (requester, id = "REQ003", extra = {}, commonExtra = {}) =>
  new CleaningRequest(common(requester, id, { title: "Spill", description: "Juice on floor", location: "Canteen", ...commonExtra }), {
    cleaningArea: "Canteen", hygieneRisk: "High", serviceType: "Spill Cleanup", preferredServiceTime: "13:30", ...extra,
  });

/** Runs a request through the full approved workflow. */
function runFullWorkflow(m, id) {
  m.reviewRequest(id, "O001", "Looks valid.");
  m.setRequestPriority(id, "O001", "High");
  m.assignTechnician(id, "O001", "T001");
  m.startWork(id, "T001");
  m.addProgressNote(id, "T001", "Replaced the access point.");
  m.resolveRequest(id, "T001", "Fixed.");
  m.closeRequest(id, "O001", "Verified with requester.");
}

// ---------- 1. subclass constructors call super() ----------
test("User subclasses chain to the User constructor", () => {
  const { student, staff, officer, tech } = setup();
  for (const user of [student, staff, officer, tech]) assert.ok(user instanceof User);
  assert.deepStrictEqual(
    [student.userType, staff.userType, officer.userType, tech.userType],
    ["Student", "Staff", "Service Officer", "Technician"]
  );
  assert.strictEqual(student.getFullName(), "Mary Kila"); // inherited behaviour
  assert.strictEqual(student.programme, "Information Systems");
  assert.strictEqual(student.yearLevel, 3);
  assert.strictEqual(staff.department, "Library");
  assert.strictEqual(officer.serviceSection, "ICT Services");
  assert.strictEqual(tech.speciality, "Networking");
});

test("Request subclasses chain to the ServiceRequest constructor", () => {
  const { student } = setup();
  const ict = makeIct(student);
  const maint = makeMaintenance(student);
  const clean = makeCleaning(student);
  for (const r of [ict, maint, clean]) {
    assert.ok(r instanceof ServiceRequest);
    assert.strictEqual(r.status, "Submitted");
    assert.strictEqual(r.requester.userId, "S001");
    assert.strictEqual(r.getHistory().length, 1);
  }
  assert.deepStrictEqual(
    [ict.category, maint.category, clean.category],
    ["ICT Support", "Facilities Maintenance", "Cleaning and Sanitation"]
  );
});

// ---------- 2. specialised fields are validated ----------
test("Specialised user fields are validated", () => {
  assert.throws(() => new StudentRequester("S9", "A", "B", "a@b.com", "", 2), /Programme is required/);
  assert.throws(() => new StudentRequester("S9", "A", "B", "a@b.com", "IS", 0), /Year level must be a whole number/);
  assert.throws(() => new StudentRequester("S9", "A", "B", "a@b.com", "IS", "abc"), /Year level must be a whole number/);
  assert.throws(() => new StaffRequester("E9", "A", "B", "a@b.com", " "), /Department is required/);
  assert.throws(() => new ServiceOfficer("O9", "A", "B", "a@b.com", ""), /Service section is required/);
  assert.throws(() => new Technician("T9", "A", "B", "a@b.com", ""), /Technical speciality is required/);
  assert.throws(() => new StudentRequester("", "A", "B", "a@b.com", "IS", 1), /User ID is required/); // base rules still apply
});

test("Specialised request fields are validated", () => {
  const { student } = setup();
  assert.throws(() => makeIct(student, "R1", {}, { deviceType: "Toaster" }), /Unsupported device type/);
  assert.throws(() => makeIct(student, "R1", {}, { systemName: "" }), /System name is required/);
  assert.throws(() => makeIct(student, "R1", {}, { faultType: "Magic" }), /Unsupported fault type/);
  assert.throws(() => makeIct(student, "R1", {}, { networkImpact: "Galaxy" }), /Unsupported network impact/);
  assert.throws(() => makeMaintenance(student, "R2", { hazardLevel: "Extreme" }), /Unsupported hazard level/);
  assert.throws(() => makeMaintenance(student, "R2", { roomNumber: "" }), /Room number is required/);
  assert.throws(() => makeCleaning(student, "R3", { hygieneRisk: "Scary" }), /Unsupported hygiene risk/);
  assert.throws(() => makeCleaning(student, "R3", { preferredServiceTime: "25:99" }), /HH:MM/);
  assert.throws(() => makeCleaning(student, "R3", { serviceType: "Vibes" }), /Unsupported service type/);
  // base-class rules still apply to subclasses
  assert.throws(() => makeIct(student, ""), /Request ID is required/);
});

test("Only Student or Staff can be requesters", () => {
  const { officer, tech } = setup();
  assert.throws(() => makeIct(officer), /Only Student or Staff/);
  assert.throws(() => makeIct(tech), /Only Student or Staff/);
});

// ---------- 3. only Service Officers can assign Technicians ----------
test("Only Service Officers can review and assign Technicians", () => {
  const { m, student, tech } = setup();
  m.submitRequest(makeIct(student));
  assert.throws(() => m.reviewRequest("REQ001", "S001"), /only a Service Officer can review/);
  assert.throws(() => m.reviewRequest("REQ001", "T001"), /only a Service Officer can review/);
  m.reviewRequest("REQ001", "O001");
  assert.throws(() => m.assignTechnician("REQ001", "S001", "T001"), /only a Service Officer can assign a Technician/);
  assert.throws(() => m.assignTechnician("REQ001", "T001", "T001"), /only a Service Officer can assign a Technician/);
  assert.strictEqual(m.findRequestById("REQ001").status, "Reviewed"); // nothing changed
  m.assignTechnician("REQ001", "O001", "T001");
  assert.strictEqual(m.findRequestById("REQ001").status, "Assigned");
  assert.strictEqual(m.findRequestById("REQ001").assignedTechnician.userId, tech.userId);
});

test("An officer cannot assign a non-Technician", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  m.reviewRequest("REQ001", "O001");
  assert.throws(() => m.assignTechnician("REQ001", "O001", "S001"), /must be a Technician/);
});

test("Only a Service Officer can set priority and close", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  m.reviewRequest("REQ001", "O001");
  assert.throws(() => m.setRequestPriority("REQ001", "S001", "Urgent"), /only a Service Officer can assign a priority/);
  m.setRequestPriority("REQ001", "O001", "Urgent");
  assert.strictEqual(m.findRequestById("REQ001").priority, "Urgent");
  m.assignTechnician("REQ001", "O001", "T001");
  m.startWork("REQ001", "T001");
  m.resolveRequest("REQ001", "T001");
  assert.throws(() => m.closeRequest("REQ001", "T001"), /only a Service Officer can close/);
  assert.throws(() => m.closeRequest("REQ001", "S001"), /only a Service Officer can close/);
  m.closeRequest("REQ001", "O001");
  assert.strictEqual(m.findRequestById("REQ001").status, "Closed");
});

// ---------- 4. only assigned Technicians can update work progress ----------
test("Only the assigned Technician can start, update and resolve work", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  m.reviewRequest("REQ001", "O001");
  m.assignTechnician("REQ001", "O001", "T001");
  for (const who of ["T002", "S001", "O001"]) {
    assert.throws(() => m.startWork("REQ001", who), /only the assigned Technician/);
  }
  m.startWork("REQ001", "T001");
  assert.throws(() => m.addProgressNote("REQ001", "T002", "sneaky"), /only the assigned Technician/);
  assert.throws(() => m.resolveRequest("REQ001", "T002"), /only the assigned Technician/);
  assert.throws(() => m.addProgressNote("REQ001", "T001", "  "), /Progress note is required/);
  m.addProgressNote("REQ001", "T001", "Cable replaced.");
  m.resolveRequest("REQ001", "T001");
  assert.strictEqual(m.findRequestById("REQ001").status, "Resolved");
});

test("A Technician cannot work on a request that is not assigned to anyone", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  assert.throws(() => m.startWork("REQ001", "T001"), /only the assigned Technician/);
});

// ---------- 5. invalid status transitions are rejected ----------
test("Invalid status transitions are rejected", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  assert.throws(() => m.assignTechnician("REQ001", "O001", "T001"), /Invalid status transition.*Submitted to Assigned/);
  assert.throws(() => m.closeRequest("REQ001", "O001"), /Invalid status transition.*Submitted to Closed/);
  m.reviewRequest("REQ001", "O001");
  assert.throws(() => m.reviewRequest("REQ001", "O001"), /Invalid status transition.*Reviewed to Reviewed/);
  m.assignTechnician("REQ001", "O001", "T001");
  assert.throws(() => m.resolveRequest("REQ001", "T001"), /Invalid status transition.*Assigned to Resolved/);
  m.startWork("REQ001", "T001");
  assert.throws(() => m.startWork("REQ001", "T001"), /Invalid status transition/);
  assert.throws(() => m.closeRequest("REQ001", "O001"), /Invalid status transition.*In Progress to Closed/);
  m.resolveRequest("REQ001", "T001");
  assert.throws(() => m.addProgressNote("REQ001", "T001", "late note"), /work must be In Progress/);
});

test("Cancelled and Closed are final", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student, "REQ001"));
  m.submitRequest(makeIct(student, "REQ002"));
  m.cancelRequest("REQ001", "S001");
  assert.throws(() => m.reviewRequest("REQ001", "O001"), /Invalid status transition.*Cancelled to Reviewed/);
  assert.throws(() => m.cancelRequest("REQ001", "S001"), /already Cancelled/);
  runFullWorkflow(m, "REQ002");
  assert.throws(() => m.reviewRequest("REQ002", "O001"), /Invalid status transition.*Closed to Reviewed/);
  assert.throws(() => m.cancelRequest("REQ002", "S001"), /Only Submitted requests can be cancelled/);
});

test("Requesters can only update or cancel their own Submitted requests", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  assert.throws(() => m.updateRequest("REQ001", "E001", { title: "Hack" }), /Access denied/);
  assert.throws(() => m.cancelRequest("REQ001", "E001"), /Access denied/);
  m.updateRequest("REQ001", "S001", { title: "Updated title" });
  assert.strictEqual(m.findRequestById("REQ001").title, "Updated title");
  m.reviewRequest("REQ001", "O001");
  assert.throws(() => m.updateRequest("REQ001", "S001", { title: "Too late" }), /already Reviewed/);
  assert.throws(() => m.cancelRequest("REQ001", "S001"), /Only Submitted requests can be cancelled/);
});

// ---------- 6. specialised summaries and overridden behaviour ----------
test("Specialised summaries show the correct information", () => {
  const { student } = setup();
  const ict = makeIct(student, "REQ001", {}, { deviceType: "Printer", systemName: "Library print server", networkImpact: "Department" });
  const maint = makeMaintenance(student);
  const clean = makeCleaning(student);

  const ictText = ict.getRequestSummary();
  assert.match(ictText, /Request ID : REQ001/);            // common data from the base class
  assert.match(ictText, /ICT Support details/);
  assert.match(ictText, /Device Type: Printer/);
  assert.match(ictText, /Library print server/);
  assert.match(ictText, /Net Impact : Department/);

  const maintText = maint.getRequestSummary();
  assert.match(maintText, /Maintenance details/);
  assert.match(maintText, /Building   : Block B/);
  assert.match(maintText, /Room       : B12/);
  assert.match(maintText, /Hazard     : Medium/);
  assert.match(maintText, /Ceiling light/);
  assert.doesNotMatch(maintText, /ICT Support details/);

  const cleanText = clean.getRequestSummary();
  assert.match(cleanText, /Cleaning details/);
  assert.match(cleanText, /Hygiene    : High risk/);
  assert.match(cleanText, /Service    : Spill Cleanup/);
  assert.match(cleanText, /Pref. Time : 13:30/);
});

test("Overridden methods give each request type its own behaviour", () => {
  const { student } = setup();
  const plain = new ServiceRequest("REQ000", student, "Lost key", "Key lost", "Admin", "General Campus Service", "Normal");
  assert.strictEqual(plain.calculatePriorityScore(), 20);
  assert.strictEqual(plain.getTargetResolutionHours(), 72);

  const campusWide = makeIct(student, "R1", {}, { networkImpact: "Campus-wide" });
  assert.strictEqual(campusWide.calculatePriorityScore(), 50);   // 20 + 30
  assert.strictEqual(campusWide.getTargetResolutionHours(), 4);

  const highHazard = makeMaintenance(student, "R2", { hazardLevel: "High" });
  assert.strictEqual(highHazard.calculatePriorityScore(), 50);   // 20 + 30
  assert.strictEqual(highHazard.getTargetResolutionHours(), 8);

  const spill = makeCleaning(student, "R3");                      // High risk + Spill Cleanup
  assert.strictEqual(spill.calculatePriorityScore(), 45);        // 20 + 25
  assert.strictEqual(spill.getTargetResolutionHours(), 6);

  // same priority, different behaviour through the same base-class reference
  const requests = [plain, campusWide, highHazard, spill];
  assert.deepStrictEqual(requests.map((r) => r.getTargetResolutionHours()), [72, 4, 8, 6]);
});

// ---------- 7. search, filter and sort ----------
function seedRequests() {
  const ctx = setup();
  const { m, student, staff } = ctx;
  m.submitRequest(makeIct(student, "REQ001", { title: "Wi-Fi down", priority: "High", dateSubmitted: new Date("2026-10-03T09:00:00") }));
  m.submitRequest(makeMaintenance(staff, "REQ002", {}, { priority: "Low", dateSubmitted: new Date("2026-10-01T09:00:00") }));
  m.submitRequest(makeCleaning(student, "REQ003", {}, { priority: "Urgent", dateSubmitted: new Date("2026-10-02T09:00:00") }));
  m.submitRequest(new ServiceRequest("REQ004", student, "Lost key", "Key lost", "Admin", "General Campus Service", "Normal"));
  m.reviewRequest("REQ001", "O001");
  m.assignTechnician("REQ001", "O001", "T001");
  m.reviewRequest("REQ002", "O001");
  m.assignTechnician("REQ002", "O001", "T002");
  return ctx;
}
const ids = (list) => list.map((r) => r.requestId);

test("Search by request ID or title", () => {
  const { m } = seedRequests();
  assert.deepStrictEqual(ids(m.searchRequests("REQ003")), ["REQ003"]);
  assert.deepStrictEqual(ids(m.searchRequests("wi-fi")), ["REQ001"]);
  assert.deepStrictEqual(ids(m.searchRequests("LOST KEY")), ["REQ004"]);
  assert.deepStrictEqual(m.searchRequests("nothing matches this"), []);
  assert.throws(() => m.searchRequests("  "), /search text/);
});

test("Filter by category, status, priority and Technician", () => {
  const { m } = seedRequests();
  assert.deepStrictEqual(ids(m.filterByCategory("ICT Support")), ["REQ001"]);
  assert.deepStrictEqual(ids(m.filterByCategory("general campus service")), ["REQ004"]);
  assert.deepStrictEqual(ids(m.filterByStatus("Assigned")), ["REQ001", "REQ002"]);
  assert.deepStrictEqual(ids(m.filterByStatus("Submitted")), ["REQ003", "REQ004"]);
  assert.deepStrictEqual(ids(m.filterByPriority("Urgent")), ["REQ003"]);
  assert.deepStrictEqual(ids(m.filterByTechnician("T001")), ["REQ001"]);
  assert.deepStrictEqual(ids(m.filterByTechnician("T002")), ["REQ002"]);
  assert.throws(() => m.filterByCategory("Catering"), /Unsupported category/);
  assert.throws(() => m.filterByStatus("Lost"), /Unsupported status/);
  assert.throws(() => m.filterByTechnician("S001"), /not a Technician/);
});

test("Sort by date submitted and by priority", () => {
  const { m } = seedRequests();
  assert.deepStrictEqual(ids(m.sortByDateSubmitted()).slice(0, 3), ["REQ002", "REQ003", "REQ001"]); // oldest first
  assert.deepStrictEqual(ids(m.sortByDateSubmitted(undefined, true))[0], "REQ004");                 // newest first
  assert.deepStrictEqual(ids(m.sortByPriority()), ["REQ003", "REQ001", "REQ004", "REQ002"]);        // Urgent > High > Normal > Low
  assert.deepStrictEqual(ids(m.sortByPriority(undefined, false)), ["REQ002", "REQ004", "REQ001", "REQ003"]);
  // sorting a filtered list, and the original order is untouched
  assert.deepStrictEqual(ids(m.sortByPriority(m.filterByStatus("Submitted"))), ["REQ003", "REQ004"]);
  assert.deepStrictEqual(ids(m.getAllRequests()), ["REQ001", "REQ002", "REQ003", "REQ004"]);
});

// ---------- 8. request history ----------
test("History records every approved workflow action", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  runFullWorkflow(m, "REQ001");
  const history = m.findRequestById("REQ001").getHistory();

  assert.deepStrictEqual(
    history.map((h) => [h.previousStatus, h.newStatus, h.action]),
    [
      [null, "Submitted", "Request submitted"],
      ["Submitted", "Reviewed", "Request reviewed"],
      ["Reviewed", "Reviewed", "Priority assigned"],
      ["Reviewed", "Assigned", "Technician assigned"],
      ["Assigned", "In Progress", "Work started"],
      ["In Progress", "In Progress", "Progress update"],
      ["In Progress", "Resolved", "Request resolved"],
      ["Resolved", "Closed", "Request closed"],
    ]
  );
  assert.deepStrictEqual(
    history.map((h) => h.actorId),
    ["S001", "O001", "O001", "O001", "T001", "T001", "T001", "O001"]
  );
  assert.strictEqual(history[1].actorRole, "Service Officer");
  assert.strictEqual(history[5].actorRole, "Technician");
  assert.strictEqual(history[1].comment, "Looks valid.");
  assert.strictEqual(history[5].comment, "Replaced the access point.");
  for (const entry of history) assert.ok(entry.date instanceof Date && !Number.isNaN(entry.date.getTime()));
});

test("Rejected actions are not written to the history", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  assert.throws(() => m.assignTechnician("REQ001", "S001", "T001"));
  assert.throws(() => m.closeRequest("REQ001", "O001"));
  assert.strictEqual(m.findRequestById("REQ001").getHistory().length, 1);
});

test("History cannot be altered from outside", () => {
  const { m, student } = setup();
  m.submitRequest(makeIct(student));
  const copy = m.findRequestById("REQ001").getHistory();
  copy.push({ fake: true });
  copy[0].newStatus = "Closed";
  assert.strictEqual(m.findRequestById("REQ001").getHistory().length, 1);
  assert.strictEqual(m.findRequestById("REQ001").getHistory()[0].newStatus, "Submitted");
});

test("Cancelling records history and status summary counts every status", () => {
  const { m, student } = seedRequests();
  m.cancelRequest("REQ003", "S001");
  const last = m.findRequestById("REQ003").getHistory().at(-1);
  assert.deepStrictEqual([last.previousStatus, last.newStatus, last.actorId], ["Submitted", "Cancelled", "S001"]);
  assert.deepStrictEqual(m.getRequestSummaryByStatus(), {
    Submitted: 1, Reviewed: 0, Assigned: 2, "In Progress": 0, Resolved: 0, Closed: 0, Cancelled: 1, Total: 4,
  });
});
