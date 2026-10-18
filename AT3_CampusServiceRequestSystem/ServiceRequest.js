"use strict";

const User = require("./User");

/**
 * ServiceRequest - one campus service request raised by a requester.
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

  static CATEGORIES = [
    "ICT Support",
    "Facilities Maintenance",
    "Cleaning and Sanitation",
    "General Campus Service",
  ];
  static PRIORITIES = ["Low", "Normal", "High", "Urgent"];
  static STATUSES = ["Submitted", "Cancelled"]; // Pass-level statuses

  constructor(requestId, requester, title, description, location, category, priority = "Normal") {
    if (!(requester instanceof User)) {
      throw new Error("A valid requester (User object) is required.");
    }
    this.#requestId = ServiceRequest.#cleanRequired(requestId, "Request ID");
    this.#requester = requester;
    this.#title = ServiceRequest.#cleanRequired(title, "Request title");
    this.#description = ServiceRequest.#cleanRequired(description, "Request description");
    this.#location = ServiceRequest.#cleanRequired(location, "Campus location");
    this.#category = ServiceRequest.#cleanFromList(category, ServiceRequest.CATEGORIES, "category");
    this.#priority = ServiceRequest.#cleanFromList(priority, ServiceRequest.PRIORITIES, "priority");
    this.#status = "Submitted";
    this.#dateSubmitted = new Date();
    this.#dateUpdated = this.#dateSubmitted;
    this.validate();
  }

  // ---------- private helpers ----------
  static #cleanRequired(value, label) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${label} is required.`);
    }
    return value.trim();
  }

  static #cleanFromList(value, list, label) {
    const text = ServiceRequest.#cleanRequired(value, label.charAt(0).toUpperCase() + label.slice(1));
    const match = list.find((item) => item.toLowerCase() === text.toLowerCase());
    if (!match) {
      throw new Error(`Unsupported ${label} "${text}". Allowed: ${list.join(", ")}.`);
    }
    return match;
  }

  #touch() { this.#dateUpdated = new Date(); }

  #assertSubmitted(action) {
    if (this.#status !== "Submitted") {
      throw new Error(`Cannot ${action}: request ${this.#requestId} is already ${this.#status}.`);
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
  get dateSubmitted() { return new Date(this.#dateSubmitted); }
  get dateUpdated() { return new Date(this.#dateUpdated); }

  // ---------- controlled setters (only while Submitted) ----------
  set title(v) { this.#assertSubmitted("edit"); this.#title = ServiceRequest.#cleanRequired(v, "Request title"); this.#touch(); }
  set description(v) { this.#assertSubmitted("edit"); this.#description = ServiceRequest.#cleanRequired(v, "Request description"); this.#touch(); }
  set location(v) { this.#assertSubmitted("edit"); this.#location = ServiceRequest.#cleanRequired(v, "Campus location"); this.#touch(); }
  set category(v) { this.#assertSubmitted("edit"); this.#category = ServiceRequest.#cleanFromList(v, ServiceRequest.CATEGORIES, "category"); this.#touch(); }
  set priority(v) { this.#assertSubmitted("edit"); this.#priority = ServiceRequest.#cleanFromList(v, ServiceRequest.PRIORITIES, "priority"); this.#touch(); }

  // ---------- behaviour ----------
  validate() {
    if (!(this.#requester instanceof User)) throw new Error("A valid requester is required.");
    ServiceRequest.#cleanRequired(this.#requestId, "Request ID");
    ServiceRequest.#cleanRequired(this.#title, "Request title");
    ServiceRequest.#cleanRequired(this.#description, "Request description");
    ServiceRequest.#cleanRequired(this.#location, "Campus location");
    ServiceRequest.#cleanFromList(this.#category, ServiceRequest.CATEGORIES, "category");
    ServiceRequest.#cleanFromList(this.#priority, ServiceRequest.PRIORITIES, "priority");
    if (!ServiceRequest.STATUSES.includes(this.#status)) throw new Error(`Invalid status "${this.#status}".`);
    return true;
  }

  /**
   * Apply changes (title, description, location, category, priority).
   * All values are checked first, so a bad value changes nothing.
   */
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
    if (keys.includes("title")) next.title = ServiceRequest.#cleanRequired(changes.title, "Request title");
    if (keys.includes("description")) next.description = ServiceRequest.#cleanRequired(changes.description, "Request description");
    if (keys.includes("location")) next.location = ServiceRequest.#cleanRequired(changes.location, "Campus location");
    if (keys.includes("category")) next.category = ServiceRequest.#cleanFromList(changes.category, ServiceRequest.CATEGORIES, "category");
    if (keys.includes("priority")) next.priority = ServiceRequest.#cleanFromList(changes.priority, ServiceRequest.PRIORITIES, "priority");

    this.#title = next.title;
    this.#description = next.description;
    this.#location = next.location;
    this.#category = next.category;
    this.#priority = next.priority;
    this.#touch();
    return true;
  }

  cancelRequest() {
    if (this.#status === "Cancelled") {
      throw new Error(`Request ${this.#requestId} is already Cancelled.`);
    }
    this.#status = "Cancelled";
    this.#touch();
    return true;
  }

  getRequestSummary() {
    const fmt = (d) => d.toLocaleString("en-GB");
    return [
      `Request ID : ${this.#requestId}`,
      `Requester  : ${this.#requester.getFullName()} (${this.#requester.userId})`,
      `Title      : ${this.#title}`,
      `Description: ${this.#description}`,
      `Location   : ${this.#location}`,
      `Category   : ${this.#category}`,
      `Priority   : ${this.#priority}`,
      `Status     : ${this.#status}`,
      `Submitted  : ${fmt(this.#dateSubmitted)}`,
      `Updated    : ${fmt(this.#dateUpdated)}`,
    ].join("\n");
  }
}

module.exports = ServiceRequest;
