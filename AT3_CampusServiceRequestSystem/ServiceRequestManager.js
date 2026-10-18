"use strict";

const User = require("./User");
const ServiceRequest = require("./ServiceRequest");

/**
 * ServiceRequestManager - owns the users and requests (plain arrays, no database)
 * and enforces the business rules between them.
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

  // ---------- requests ----------
  submitRequest(request) {
    if (!(request instanceof ServiceRequest)) throw new Error("submitRequest requires a ServiceRequest object.");
    request.validate();
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

  getRequestsByUser(userId) {
    if (!this.findUserById(userId)) throw new Error(`User "${userId}" is not registered.`);
    const id = String(userId).trim().toLowerCase();
    return this.#requests.filter((r) => r.requester.userId.toLowerCase() === id);
  }

  getAllRequests() {
    return [...this.#requests]; // copy so callers cannot alter the internal array
  }

  /** Returns the request owned by userId, or throws a clear error. */
  #getOwnedRequest(requestId, userId) {
    const request = this.findRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" was not found.`);
    if (!this.findUserById(userId)) throw new Error(`User "${userId}" is not registered.`);
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
    request.cancelRequest();
    return request;
  }

  searchRequests(searchText) {
    const text = String(searchText ?? "").trim().toLowerCase();
    if (text === "") throw new Error("Please enter some search text.");
    return this.#requests.filter((r) =>
      [r.requestId, r.title, r.description, r.location, r.category, r.priority, r.status, r.requester.getFullName()]
        .some((field) => field.toLowerCase().includes(text))
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
