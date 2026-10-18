"use strict";

/**
 * User - a person registered in the Campus Service Request System.
 * Pass level supports requesters (Student or Staff). Credit level extends
 * this class for Service Officer, Technician and Administrator roles.
 */
class User {
  #userId;
  #firstName;
  #lastName;
  #email;
  #userType;

  static USER_TYPES = ["Student", "Staff"];
  static #EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(userId, firstName, lastName, email, userType) {
    this.#userId = User.#cleanRequired(userId, "User ID");
    this.#firstName = User.#cleanRequired(firstName, "First name");
    this.#lastName = User.#cleanRequired(lastName, "Last name");
    this.#email = User.#cleanEmail(email);
    this.#userType = User.#cleanType(userType);
    this.validate();
  }

  // ---------- private helpers ----------
  static #cleanRequired(value, label) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${label} is required.`);
    }
    return value.trim();
  }

  static #cleanEmail(value) {
    const email = User.#cleanRequired(value, "Email address");
    if (!User.#EMAIL_PATTERN.test(email)) {
      throw new Error(`Invalid email address: "${email}".`);
    }
    return email;
  }

  static #cleanType(value) {
    const type = User.#cleanRequired(value, "User type");
    const match = User.USER_TYPES.find((t) => t.toLowerCase() === type.toLowerCase());
    if (!match) {
      throw new Error(`Unsupported user type "${type}". Allowed: ${User.USER_TYPES.join(", ")}.`);
    }
    return match;
  }

  // ---------- getters ----------
  get userId() { return this.#userId; }
  get firstName() { return this.#firstName; }
  get lastName() { return this.#lastName; }
  get email() { return this.#email; }
  get userType() { return this.#userType; }

  // ---------- controlled setters (the ID is never changed) ----------
  set firstName(value) { this.#firstName = User.#cleanRequired(value, "First name"); }
  set lastName(value) { this.#lastName = User.#cleanRequired(value, "Last name"); }
  set email(value) { this.#email = User.#cleanEmail(value); }
  set userType(value) { this.#userType = User.#cleanType(value); }

  // ---------- behaviour ----------
  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  /** Throws if the object is in an invalid state; returns true otherwise. */
  validate() {
    User.#cleanRequired(this.#userId, "User ID");
    User.#cleanRequired(this.#firstName, "First name");
    User.#cleanRequired(this.#lastName, "Last name");
    User.#cleanEmail(this.#email);
    User.#cleanType(this.#userType);
    return true;
  }

  displayInfo() {
    return [
      `User ID : ${this.#userId}`,
      `Name    : ${this.getFullName()}`,
      `Email   : ${this.#email}`,
      `Type    : ${this.#userType}`,
    ].join("\n");
  }
}

module.exports = User;
