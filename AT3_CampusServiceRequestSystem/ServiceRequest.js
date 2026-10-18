"use strict";

const User = require("./User");
const ServiceOfficer = require("./ServiceOfficer");
const Technician = require("./Technician");
const { cleanRequired, cleanFromList } = require("./Validation");

/**
 * ServiceRequest - one campus service request.
 * Base class for ICTSupportRequest, MaintenanceRequest and CleaningRequest.
 * It owns the controlled workflow, the role permissions and the history log.
 */
class ServiceRequest {
  #requestId;
  #requester;
  #title;
  #description;
  #location;
  #category;
  #priority;
  #status;
  #dateSubmitted;
  #dateUpdated;
  #assignedTechnician = null;
  #history = [];

  static CATEGORIES = [
    "ICT Support",
    "Facilities Maintenance",
    "Cleaning and Sanitation",
    "General Campus Service",
  ];
  static PRIORITIES = ["Low", "Normal", "High", "Urgent"];
  static STATUSES = ["Submitted", "Reviewed", "Assigned", "In Progress", "Resolved", "Closed", "Cancelled"];
  static REQUESTER_TYPES = ["Student", "Staff"];

  /** Permitted status flow. Closed and Cancelled are final. */
  static TRANSITIONS = Object.freeze({
    Submitted: ["Reviewed", "Cancelled"],
    Reviewed: ["Assigned"],
    Assigned: ["In Progress"],
    "In Progress": ["Resolved"],
    Resolved: ["Closed"],
    Closed: [],
    Cancelled: [],
  });

  static #BASE_TARGET_HOURS = { Low: 120, Normal: 72, High: 24, Urgent: 4 };

  /**
   * Accepts either the Pass-style positional arguments
   *   new ServiceRequest(id, requester, title, description, location, category, priority)
   * or a single data object (used by the specialised subclasses):
   *   new ServiceRequest({ requestId, requester, title, description, location, category, priority })
   */
  constructor(requestIdOrData, requester, title, description, location, category, priority = "Normal") {
    const data =
      requestIdOrData !== null && typeof requestIdOrData === "object"
        ? requestIdOrData
        : { requestId: requestIdOrData, requester, title, description, location, category, priority };

    if (!(data.requester instanceof User)) {
      throw new Error("A valid requester (User object) is required.");
    }
    if (!ServiceRequest.REQUESTER_TYPES.includes(data.requester.userType)) {
      throw new Error("Only Student or Staff requesters can submit service requests.");
    }
    const submitted = data.dateSubmitted ?? new Date();
    if (!(submitted instanceof Date) || Number.isNaN(submitted.getTime())) {
      throw new Error("Date submitted must be a valid date.");
    }

    this.#requestId = cleanRequired(data.requestId, "Request ID");
    this.#requester = data.requester;
    this.#title = cleanRequired(data.title, "Request title");
    this.#description = cleanRequired(data.description, "Request description");
    this.#location = cleanRequired(data.location, "Campus location");
    this.#category = cleanFromList(data.category, ServiceRequest.CATEGORIES, "category");
    this.#priority = cleanFromList(data.priority ?? "Normal", ServiceRequest.PRIORITIES, "priority");
    this.#status = "Submitted";
    this.#dateSubmitted = new Date(submitted);
    this.#dateUpdated = new Date(submitted);
    this.#record(null, "Submitted", "Request submitted", data.requester, "Request created by requester.", submitted);
    this.validate();
  }

  // ---------- private helpers ----------
  #touch() { this.#dateUpdated = new Date(); }

  #assertSubmitted(action) {
    if (this.#status !== "Submitted") {
      throw new Error(`Cannot ${action}: request ${this.#requestId} is already ${this.#status}.`);
    }
  }

  #record(previousStatus, newStatus, action, actor, comment, date = new Date()) {
    this.#history.push(
      Object.freeze({
        previousStatus,
        newStatus,
        action,
        actorId: actor ? actor.userId : "SYSTEM",
        actorRole: actor ? actor.userType : "System",
        comment: comment ?? "",
        date: new Date(date),
      })
    );
  }

  /** The only place a status changes. Rejects any move not in TRANSITIONS. */
  #transition(newStatus, action, actor, comment) {
    const allowed = ServiceRequest.TRANSITIONS[this.#status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: request ${this.#requestId} cannot move from ${this.#status} to ${newStatus}.`
      );
    }
    const previous = this.#status;
    this.#status = newStatus;
    this.#touch();
    this.#record(previous, newStatus, action, actor, comment);
  }

  static #requireOfficer(actor, task) {
    if (!(actor instanceof ServiceOfficer)) {
      throw new Error(`Access denied: only a Service Officer can ${task}.`);
    }
  }

  #requireAssignedTechnician(actor, task) {
    const isAssigned =
      actor instanceof Technician &&
      this.#assignedTechnician !== null &&
      this.#assignedTechnician.userId === actor.userId;
    if (!isAssigned) {
      throw new Error(`Access denied: only the assigned Technician can ${task}.`);
    }
  }

  // ---------- getters ----------
  get requestId() { return this.#requestId; }
  get requester() { return this.#requester; }
  get title() { return this.#title; }
  get description() { return this.#description; }
  get location() { return this.#location; }
  get category() { return this.#category; }
  get priority() { return this.#priority; }
  get status() { return this.#status; }
  get assignedTechnician() { return this.#assignedTechnician; }
  get dateSubmitted() { return new Date(this.#dateSubmitted); }
  get dateUpdated() { return new Date(this.#dateUpdated); }

  // ---------- controlled setters (only while Submitted) ----------
  set title(v) { this.#assertSubmitted("edit"); this.#title = cleanRequired(v, "Request title"); this.#touch(); }
  set description(v) { this.#assertSubmitted("edit"); this.#description = cleanRequired(v, "Request description"); this.#touch(); }
  set location(v) { this.#assertSubmitted("edit"); this.#location = cleanRequired(v, "Campus location"); this.#touch(); }
  set category(v) { this.#assertSubmitted("edit"); this.#category = cleanFromList(v, ServiceRequest.CATEGORIES, "category"); this.#touch(); }
  set priority(v) { this.#assertSubmitted("edit"); this.#priority = cleanFromList(v, ServiceRequest.PRIORITIES, "priority"); this.#touch(); }

  // ---------- validation ----------
  validate() {
    if (!(this.#requester instanceof User)) throw new Error("A valid requester is required.");
    cleanRequired(this.#requestId, "Request ID");
    cleanRequired(this.#title, "Request title");
    cleanRequired(this.#description, "Request description");
    cleanRequired(this.#location, "Campus location");
    cleanFromList(this.#category, ServiceRequest.CATEGORIES, "category");
    cleanFromList(this.#priority, ServiceRequest.PRIORITIES, "priority");
    if (!ServiceRequest.STATUSES.includes(this.#status)) throw new Error(`Invalid status "${this.#status}".`);
    return true;
  }

  /** Overridden by the specialised classes. The base request has no extra fields. */
  validateSpecialisedFields() {
    return true;
  }

  // ---------- requester actions ----------
  updateDetails(changes = {}) {
    this.#assertSubmitted("update");
    const allowed = ["title", "description", "location", "category", "priority"];
    const keys = Object.keys(changes).filter((k) => changes[k] !== undefined && changes[k] !== "");
    const unknown = keys.filter((k) => !allowed.includes(k));
    if (unknown.length > 0) throw new Error(`These fields cannot be updated: ${unknown.join(", ")}.`);
    if (keys.length === 0) throw new Error("No changes were provided.");

    const next = {
      title: this.#title,
      description: this.#description,
      location: this.#location,
      category: this.#category,
      priority: this.#priority,
    };
    if (keys.includes("title")) next.title = cleanRequired(changes.title, "Request title");
    if (keys.includes("description")) next.description = cleanRequired(changes.description, "Request description");
    if (keys.includes("location")) next.location = cleanRequired(changes.location, "Campus location");
    if (keys.includes("category")) next.category = cleanFromList(changes.category, ServiceRequest.CATEGORIES, "category");
    if (keys.includes("priority")) next.priority = cleanFromList(changes.priority, ServiceRequest.PRIORITIES, "priority");

    this.#title = next.title;
    this.#description = next.description;
    this.#location = next.location;
    this.#category = next.category;
    this.#priority = next.priority;
    this.#touch();
    return true;
  }

  /** Only a Submitted request can be cancelled. Ownership is checked by the manager. */
  cancelRequest(actor = null, comment = "Cancelled by requester.") {
    if (this.#status === "Cancelled") {
      throw new Error(`Request ${this.#requestId} is already Cancelled.`);
    }
    if (this.#status !== "Submitted") {
      throw new Error(`Cannot cancel: request ${this.#requestId} is ${this.#status}. Only Submitted requests can be cancelled.`);
    }
    this.#transition("Cancelled", "Request cancelled", actor ?? this.#requester, comment);
    return true;
  }

  // ---------- Service Officer actions ----------
  review(officer, comment = "Request reviewed.") {
    ServiceRequest.#requireOfficer(officer, "review requests");
    this.#transition("Reviewed", "Request reviewed", officer, comment);
  }

  assignPriority(officer, priority, comment) {
    ServiceRequest.#requireOfficer(officer, "assign a priority");
    if (this.#status !== "Reviewed") {
      throw new Error(`Cannot assign a priority: request ${this.#requestId} is ${this.#status}; it must be Reviewed.`);
    }
    const next = cleanFromList(priority, ServiceRequest.PRIORITIES, "priority");
    const previous = this.#priority;
    this.#priority = next;
    this.#touch();
    this.#record(this.#status, this.#status, "Priority assigned", officer, comment ?? `Priority changed from ${previous} to ${next}.`);
  }

  assignTechnician(officer, technician, comment) {
    ServiceRequest.#requireOfficer(officer, "assign a Technician");
    if (!(technician instanceof Technician)) {
      throw new Error("The assigned user must be a Technician.");
    }
    this.#transition("Assigned", "Technician assigned", officer, comment ?? `Assigned to ${technician.getFullName()} (${technician.userId}).`);
    this.#assignedTechnician = technician;
  }

  close(officer, comment = "Work verified and request closed.") {
    ServiceRequest.#requireOfficer(officer, "close a request");
    this.#transition("Closed", "Request closed", officer, comment);
  }

  // ---------- Technician actions ----------
  beginWork(technician, comment = "Work started.") {
    this.#requireAssignedTechnician(technician, "start the work");
    this.#transition("In Progress", "Work started", technician, comment);
  }

  addProgressNote(technician, note) {
    this.#requireAssignedTechnician(technician, "record progress");
    if (this.#status !== "In Progress") {
      throw new Error(`Cannot add a progress note: request ${this.#requestId} is ${this.#status}; work must be In Progress.`);
    }
    const text = cleanRequired(note, "Progress note");
    this.#touch();
    this.#record(this.#status, this.#status, "Progress update", technician, text);
  }

  resolve(technician, comment = "Work completed.") {
    this.#requireAssignedTechnician(technician, "resolve the request");
    this.#transition("Resolved", "Request resolved", technician, comment);
  }

  // ---------- history ----------
  /** Returns copies, so callers cannot alter the audit trail. */
  getHistory() {
    return this.#history.map((entry) => ({ ...entry, date: new Date(entry.date) }));
  }

  // ---------- polymorphic behaviour (overridden by subclasses) ----------
  static priorityRank(priority) {
    return ServiceRequest.PRIORITIES.indexOf(priority) + 1; // Low=1 ... Urgent=4
  }

  calculatePriorityScore() {
    return ServiceRequest.priorityRank(this.#priority) * 10;
  }

  getTargetResolutionHours() {
    return ServiceRequest.#BASE_TARGET_HOURS[this.#priority];
  }

  getRequestSummary() {
    const fmt = (d) => d.toLocaleString("en-GB");
    const tech = this.#assignedTechnician
      ? `${this.#assignedTechnician.getFullName()} (${this.#assignedTechnician.userId})`
      : "Not assigned";
    return [
      `Request ID : ${this.#requestId}`,
      `Requester  : ${this.#requester.getFullName()} (${this.#requester.userId})`,
      `Title      : ${this.#title}`,
      `Description: ${this.#description}`,
      `Location   : ${this.#location}`,
      `Category   : ${this.#category}`,
      `Priority   : ${this.#priority} (score ${this.calculatePriorityScore()})`,
      `Target     : ${this.getTargetResolutionHours()} hour(s)`,
      `Status     : ${this.#status}`,
      `Assigned To: ${tech}`,
      `Submitted  : ${fmt(this.#dateSubmitted)}`,
      `Updated    : ${fmt(this.#dateUpdated)}`,
    ].join("\n");
  }
}

module.exports = ServiceRequest;
