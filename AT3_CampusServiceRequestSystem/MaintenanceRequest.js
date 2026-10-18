"use strict";

const ServiceRequest = require("./ServiceRequest");
const { cleanRequired, cleanFromList } = require("./Validation");

/** A facilities repair: building, room, hazard level and equipment affected. */
class MaintenanceRequest extends ServiceRequest {
  #building;
  #roomNumber;
  #hazardLevel;
  #equipmentAffected;

  static HAZARD_LEVELS = ["None", "Low", "Medium", "High"];

  static #HAZARD_BONUS = { None: 0, Low: 5, Medium: 15, High: 30 };

  constructor(commonRequestData, specialisedData = {}) {
    super({ ...commonRequestData, category: "Facilities Maintenance" }); // constructor chaining
    this.#building = cleanRequired(specialisedData.building, "Building");
    this.#roomNumber = cleanRequired(specialisedData.roomNumber, "Room number");
    this.#hazardLevel = cleanFromList(specialisedData.hazardLevel, MaintenanceRequest.HAZARD_LEVELS, "hazard level");
    this.#equipmentAffected = cleanRequired(specialisedData.equipmentAffected, "Equipment affected");
    this.validateSpecialisedFields();
  }

  get building() { return this.#building; }
  get roomNumber() { return this.#roomNumber; }
  get hazardLevel() { return this.#hazardLevel; }
  get equipmentAffected() { return this.#equipmentAffected; }

  // ---------- overridden methods ----------
  validateSpecialisedFields() {
    cleanRequired(this.#building, "Building");
    cleanRequired(this.#roomNumber, "Room number");
    cleanFromList(this.#hazardLevel, MaintenanceRequest.HAZARD_LEVELS, "hazard level");
    cleanRequired(this.#equipmentAffected, "Equipment affected");
    return true;
  }

  /** A higher hazard level raises the score. */
  calculatePriorityScore() {
    return super.calculatePriorityScore() + MaintenanceRequest.#HAZARD_BONUS[this.#hazardLevel];
  }

  /** High hazards must be attended within 8 hours, medium within 48. */
  getTargetResolutionHours() {
    const base = super.getTargetResolutionHours();
    if (this.#hazardLevel === "High") return Math.min(base, 8);
    if (this.#hazardLevel === "Medium") return Math.min(base, 48);
    return base;
  }

  getRequestSummary() {
    return [
      super.getRequestSummary(),
      "--- Maintenance details ---",
      `Building   : ${this.#building}`,
      `Room       : ${this.#roomNumber}`,
      `Hazard     : ${this.#hazardLevel}`,
      `Equipment  : ${this.#equipmentAffected}`,
    ].join("\n");
  }
}

module.exports = MaintenanceRequest;
