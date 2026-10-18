"use strict";

const User = require("./User");
const { cleanRequired } = require("./Validation");

/** Reviews requests, sets priority, assigns technicians and closes resolved work. */
class ServiceOfficer extends User {
  #serviceSection;

  constructor(userId, firstName, lastName, email, serviceSection) {
    super(userId, firstName, lastName, email, "Service Officer"); // constructor chaining
    this.#serviceSection = cleanRequired(serviceSection, "Service section");
    this.validateSpecialisedFields();
  }

  get serviceSection() { return this.#serviceSection; }
  set serviceSection(value) { this.#serviceSection = cleanRequired(value, "Service section"); }

  validateSpecialisedFields() {
    cleanRequired(this.#serviceSection, "Service section");
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nSection : ${this.#serviceSection}`;
  }
}

module.exports = ServiceOfficer;
