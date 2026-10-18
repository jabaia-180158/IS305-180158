"use strict";

const User = require("./User");
const { cleanRequired } = require("./Validation");

/** Carries out assigned work: begins, records progress and resolves requests. */
class Technician extends User {
  #speciality;

  constructor(userId, firstName, lastName, email, speciality) {
    super(userId, firstName, lastName, email, "Technician"); // constructor chaining
    this.#speciality = cleanRequired(speciality, "Technical speciality");
    this.validateSpecialisedFields();
  }

  get speciality() { return this.#speciality; }
  set speciality(value) { this.#speciality = cleanRequired(value, "Technical speciality"); }

  validateSpecialisedFields() {
    cleanRequired(this.#speciality, "Technical speciality");
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nSpeciality: ${this.#speciality}`;
  }
}

module.exports = Technician;
