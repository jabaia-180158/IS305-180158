"use strict";

const test = require("node:test");
const assert = require("node:assert");
const User = require("./User");
const ServiceRequest = require("./ServiceRequest");
const ServiceRequestManager = require("./ServiceRequestManager");

const makeUser = (id = "S001") => new User(id, "Mary", "Kila", "mary@dwu.ac.pg", "Student");
const makeRequest = (id, user, category = "ICT Support") =>
  new ServiceRequest(id, user, "Wi-Fi down", "No signal in lab", "Block A Lab 2", category, "High");

test("Valid user registration adds the user", () => {
  const m = new ServiceRequestManager();
  m.registerUser(makeUser());
  assert.ok(m.findUserById("S001"));
});

test("Duplicate user ID is rejected", () => {
  const m = new ServiceRequestManager();
  m.registerUser(makeUser());
  assert.throws(() => m.registerUser(makeUser()), /Duplicate user ID/);
});

test("Invalid user data is rejected", () => {
  assert.throws(() => new User("", "A", "B", "a@b.com", "Student"), /User ID is required/);
  assert.throws(() => new User("S9", "", "B", "a@b.com", "Student"), /First name is required/);
  assert.throws(() => new User("S9", "A", "", "a@b.com", "Student"), /Last name is required/);
  assert.throws(() => new User("S9", "A", "B", "not-an-email", "Student"), /Invalid email/);
});

test("Valid request submission is stored with Submitted status", () => {
  const m = new ServiceRequestManager();
  const u = m.registerUser(makeUser());
  const r = m.submitRequest(makeRequest("REQ001", u));
  assert.strictEqual(r.status, "Submitted");
  assert.strictEqual(m.getAllRequests().length, 1);
});

test("Invalid category is rejected clearly", () => {
  const u = makeUser();
  assert.throws(() => makeRequest("REQ002", u, "Catering"), /Unsupported category/);
});

test("Duplicate request ID is rejected", () => {
  const m = new ServiceRequestManager();
  const u = m.registerUser(makeUser());
  m.submitRequest(makeRequest("REQ001", u));
  assert.throws(() => m.submitRequest(makeRequest("REQ001", u)), /Duplicate request ID/);
});

test("View requester records shows only that user's requests", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser("S001"));
  const b = m.registerUser(makeUser("S002"));
  m.submitRequest(makeRequest("REQ001", a));
  m.submitRequest(makeRequest("REQ002", b));
  const mine = m.getRequestsByUser("S001");
  assert.strictEqual(mine.length, 1);
  assert.strictEqual(mine[0].requestId, "REQ001");
});

test("Update by another user is rejected", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser("S001"));
  m.registerUser(makeUser("S002"));
  m.submitRequest(makeRequest("REQ001", a));
  assert.throws(() => m.updateRequest("REQ001", "S002", { title: "Hack" }), /Access denied/);
});

test("Owner can update; invalid update changes nothing", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser());
  m.submitRequest(makeRequest("REQ001", a));
  m.updateRequest("REQ001", "S001", { title: "New title", priority: "Urgent" });
  assert.strictEqual(m.findRequestById("REQ001").title, "New title");
  assert.throws(() => m.updateRequest("REQ001", "S001", { title: "Changed", category: "Bogus" }), /Unsupported category/);
  assert.strictEqual(m.findRequestById("REQ001").title, "New title");
});

test("Cancel Submitted request sets status to Cancelled", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser());
  m.submitRequest(makeRequest("REQ001", a));
  m.cancelRequest("REQ001", "S001");
  assert.strictEqual(m.findRequestById("REQ001").status, "Cancelled");
});

test("Cancelling another user's or an already Cancelled request is rejected", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser("S001"));
  m.registerUser(makeUser("S002"));
  m.submitRequest(makeRequest("REQ001", a));
  assert.throws(() => m.cancelRequest("REQ001", "S002"), /Access denied/);
  m.cancelRequest("REQ001", "S001");
  assert.throws(() => m.cancelRequest("REQ001", "S001"), /already Cancelled/);
});

test("Search and status summary work", () => {
  const m = new ServiceRequestManager();
  const a = m.registerUser(makeUser());
  m.submitRequest(makeRequest("REQ001", a));
  m.submitRequest(makeRequest("REQ002", a));
  m.cancelRequest("REQ002", "S001");
  assert.strictEqual(m.searchRequests("wi-fi").length, 2);
  assert.deepStrictEqual(m.getRequestSummaryByStatus(), { Submitted: 1, Reviewed: 0, Assigned: 0, "In Progress": 0, Resolved: 0, Closed: 0, Cancelled: 1, Total: 2 });
});
