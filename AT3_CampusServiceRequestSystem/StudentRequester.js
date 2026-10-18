"use strict";

const User = require("./User");
const { cleanRequired, cleanWholeNumber } = require("./Validation");

/** A student who submits service requests. */
class StudentRequester extends User {
  #programme;
  #yearLevel;

  constructor(userId, firstName, lastName, email, programme, yearLevel) {
    super(userId, firstName, lastName, email, "Student"); // constructor chaining
    this.#programme = cleanRequired(programme, "Programme");
    this.#yearLevel = cleanWholeNumber(yearLevel, "Year level", 1, 6);
    this.validateSpecialisedFields();
  }

  get programme() { return this.#programme; }
  get yearLevel() { return this.#yearLevel; }
  set programme(value) { this.#programme = cleanRequired(value, "Programme"); }
  set yearLevel(value) { this.#yearLevel = cleanWholeNumber(value, "Year level", 1, 6); }

  validateSpecialisedFields() {
    cleanRequired(this.#programme, "Programme");
    cleanWholeNumber(this.#yearLevel, "Year level", 1, 6);
    return true;
  }

  displayInfo() {
    return `${super.displayInfo()}\nProgramme: ${this.#programme}\nYear    : ${this.#yearLevel}`;
  }
}

module.exports = StudentRequester;
