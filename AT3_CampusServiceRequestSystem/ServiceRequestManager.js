"use strict";

const User = require("./User");
const Technician = require("./Technician");
const ServiceRequest = require("./ServiceRequest");
const { cleanFromList } = require("./Validation");

/**
 * ServiceRequestManager - owns the users and requests (plain arrays, no database).
 * It looks up the people involved and delegates the rules to the request objects.
 */
class ServiceRequestManager {
  #users = [];
  #requests = [];

  // ---------- users ----------
  registerUser(user) {
    if (!(user instanceof User)) throw new Error("registerUser requires a User object.");
    user.validate();
    if (this.findUserById(user.userId)) {
      throw new Error(`Duplicate user ID: "${user.userId}" is already registered.`);
    }
    this.#users.push(user);
    return user;
  }

  findUserById(userId) {
    const id = String(userId ?? "").trim().toLowerCase();
    return this.#users.find((u) => u.userId.toLowerCase() === id) ?? null;
  }

  getTechnicians() {
    return this.#users.filter((u) => u instanceof Technician);
  }

  #getUser(userId) {
    const user = this.findUserById(userId);
    if (!user) throw new Error(`User "${userId}" is not registered.`);
    return user;
  }

  // ---------- requests ----------
  submitRequest(request) {
    if (!(request instanceof ServiceRequest)) throw new Error("submitRequest requires a ServiceRequest object.");
    request.validate();
    request.validateSpecialisedFields();
    if (!this.findUserById(request.requester.userId)) {
      throw new Error(`Requester "${request.requester.userId}" is not registered.`);
    }
    if (this.findRequestById(request.requestId)) {
      throw new Error(`Duplicate request ID: "${request.requestId}" already exists.`);
    }
    this.#requests.push(request);
    return request;
  }

  findRequestById(requestId) {
    const id = String(requestId ?? "").trim().toLowerCase();
    return this.#requests.find((r) => r.requestId.toLowerCase() === id) ?? null;
  }

  #getRequest(requestId) {
    const request = this.findRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" was not found.`);
    return request;
  }

  getRequestsByUser(userId) {
    this.#getUser(userId);
    const id = String(userId).trim().toLowerCase();
    return this.#requests.filter((r) => r.requester.userId.toLowerCase() === id);
  }

  getAllRequests() {
    return [...this.#requests]; // copy so callers cannot alter the internal array
  }

  // ---------- requester actions (ownership enforced here) ----------
  #getOwnedRequest(requestId, userId) {
    const request = this.#getRequest(requestId);
    this.#getUser(userId);
    if (request.requester.userId.toLowerCase() !== String(userId).trim().toLowerCase()) {
      throw new Error("Access denied: you can only change your own requests.");
    }
    return request;
  }

  updateRequest(requestId, userId, changes) {
    const request = this.#getOwnedRequest(requestId, userId);
    request.updateDetails(changes);
    return request;
  }

  cancelRequest(requestId, userId) {
    const request = this.#getOwnedRequest(requestId, userId);
    request.cancelRequest(this.#getUser(userId));
    return request;
  }

  // ---------- Service Officer workflow ----------
  reviewRequest(requestId, officerId, comment) {
    const request = this.#getRequest(requestId);
    request.review(this.#getUser(officerId), comment);
    return request;
  }

  setRequestPriority(requestId, officerId, priority, comment) {
    const request = this.#getRequest(requestId);
    request.assignPriority(this.#getUser(officerId), priority, comment);
    return request;
  }

  assignTechnician(requestId, officerId, technicianId, comment) {
    const request = this.#getRequest(requestId);
    request.assignTechnician(this.#getUser(officerId), this.#getUser(technicianId), comment);
    return request;
  }

  closeRequest(requestId, officerId, comment) {
    const request = this.#getRequest(requestId);
    request.close(this.#getUser(officerId), comment);
    return request;
  }

  // ---------- Technician workflow ----------
  startWork(requestId, technicianId, comment) {
    const request = this.#getRequest(requestId);
    request.beginWork(this.#getUser(technicianId), comment);
    return request;
  }

  addProgressNote(requestId, technicianId, note) {
    const request = this.#getRequest(requestId);
    request.addProgressNote(this.#getUser(technicianId), note);
    return request;
  }

  resolveRequest(requestId, technicianId, comment) {
    const request = this.#getRequest(requestId);
    request.resolve(this.#getUser(technicianId), comment);
    return request;
  }

  getRequestsAssignedTo(technicianId) {
    return this.filterByTechnician(technicianId);
  }

  // ---------- search, filter and sort ----------
  /** Matches request ID, title, description, location, category, priority, status or requester name. */
  searchRequests(searchText) {
    const text = String(searchText ?? "").trim().toLowerCase();
    if (text === "") throw new Error("Please enter some search text.");
    return this.#requests.filter((r) =>
      [r.requestId, r.title, r.description, r.location, r.category, r.priority, r.status, r.requester.getFullName()]
        .some((field) => field.toLowerCase().includes(text))
    );
  }

  filterByCategory(category) {
    const wanted = cleanFromList(category, ServiceRequest.CATEGORIES, "category");
    return this.#requests.filter((r) => r.category === wanted);
  }

  filterByStatus(status) {
    const wanted = cleanFromList(status, ServiceRequest.STATUSES, "status");
    return this.#requests.filter((r) => r.status === wanted);
  }

  filterByPriority(priority) {
    const wanted = cleanFromList(priority, ServiceRequest.PRIORITIES, "priority");
    return this.#requests.filter((r) => r.priority === wanted);
  }

  filterByTechnician(technicianId) {
    const user = this.#getUser(technicianId);
    if (!(user instanceof Technician)) throw new Error(`User "${technicianId}" is not a Technician.`);
    return this.#requests.filter(
      (r) => r.assignedTechnician !== null && r.assignedTechnician.userId === user.userId
    );
  }

  /** Sorts a copy. Pass a filtered list to sort it, or nothing to sort every request. */
  sortByDateSubmitted(requests = this.#requests, newestFirst = false) {
    const direction = newestFirst ? -1 : 1;
    return [...requests].sort((a, b) => direction * (a.dateSubmitted - b.dateSubmitted));
  }

  sortByPriority(requests = this.#requests, highestFirst = true) {
    const direction = highestFirst ? -1 : 1;
    return [...requests].sort(
      (a, b) => direction * (ServiceRequest.priorityRank(a.priority) - ServiceRequest.priorityRank(b.priority))
    );
  }

  getRequestSummaryByStatus() {
    const summary = {};
    for (const status of ServiceRequest.STATUSES) summary[status] = 0;
    for (const r of this.#requests) summary[r.status] += 1;
    summary.Total = this.#requests.length;
    return summary;
  }
}

module.exports = ServiceRequestManager;
