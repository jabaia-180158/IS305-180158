"use strict";

const ServiceRequest = require("./ServiceRequest");
const { cleanRequired, cleanFromList, cleanTime } = require("./Validation");

/** A cleaning job: area, hygiene risk, type of service and preferred time. */
class CleaningRequest extends ServiceRequest {
  #cleaningArea;
  #hygieneRisk;
  #serviceType;
  #preferredServiceTime;

  static HYGIENE_RISKS = ["Low", "Medium", "High"];
  static SERVICE_TYPES = ["Routine", "Spill Cleanup", "Deep Clean", "Waste Removal"];

  static #RISK_BONUS = { Low: 0, Medium: 10, High: 25 };

  constructor(commonRequestData, specialisedData = {}) {
    super({ ...commonRequestData, category: "Cleaning and Sanitation" }); // constructor chaining
    this.#cleaningArea = cleanRequired(specialisedData.cleaningArea, "Cleaning area");
    this.#hygieneRisk = cleanFromList(specialisedData.hygieneRisk, CleaningRequest.HYGIENE_RISKS, "hygiene risk");
    this.#serviceType = cleanFromList(specialisedData.serviceType, CleaningRequest.SERVICE_TYPES, "service type");
    this.#preferredServiceTime = cleanTime(specialisedData.preferredServiceTime, "Preferred service time");
    this.validateSpecialisedFields();
  }

  get cleaningArea() { return this.#cleaningArea; }
  get hygieneRisk() { return this.#hygieneRisk; }
  get serviceType() { return this.#serviceType; }
  get preferredServiceTime() { return this.#preferredServiceTime; }

  // ---------- overridden methods ----------
  validateSpecialisedFields() {
    cleanRequired(this.#cleaningArea, "Cleaning area");
    cleanFromList(this.#hygieneRisk, CleaningRequest.HYGIENE_RISKS, "hygiene risk");
    cleanFromList(this.#serviceType, CleaningRequest.SERVICE_TYPES, "service type");
    cleanTime(this.#preferredServiceTime, "Preferred service time");
    return true;
  }

  /** A higher hygiene risk raises the score. */
  calculatePriorityScore() {
    return super.calculatePriorityScore() + CleaningRequest.#RISK_BONUS[this.#hygieneRisk];
  }

  /** High hygiene risk within 12 hours; spill cleanups within 6. */
  getTargetResolutionHours() {
    let hours = super.getTargetResolutionHours();
    if (this.#hygieneRisk === "High") hours = Math.min(hours, 12);
    if (this.#serviceType === "Spill Cleanup") hours = Math.min(hours, 6);
    return hours;
  }

  getRequestSummary() {
    return [
      super.getRequestSummary(),
      "--- Cleaning details ---",
      `Area       : ${this.#cleaningArea}`,
      `Hygiene    : ${this.#hygieneRisk} risk`,
      `Service    : ${this.#serviceType}`,
      `Pref. Time : ${this.#preferredServiceTime}`,
    ].join("\n");
  }
}

module.exports = CleaningRequest;
