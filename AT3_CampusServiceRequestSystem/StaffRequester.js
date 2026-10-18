"use strict";

const User = require("./User");
const { cleanRequired } = require("./Validation");

/** A staff member who submits service requests. */
class StaffRequester extends User {
  #department;

  constructor(userId, firstName, lastName, email, department) {
    super(userId, firstName, lastName, email, "Staff"); // constructor chaining
    this.#department = cleanRequired(department, "Department");
    this.validateSpecialisedFields();
  }

  get department() { return this.#department; }
  set department(value) { this.#department = cleanRequired(value, "Department"); }

  validateSpecialisedFields() {
    cleanRequired(this.#department, "Department");
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nDepartment: ${this.#department}`;
  }
}

module.exports = StaffRequester;
