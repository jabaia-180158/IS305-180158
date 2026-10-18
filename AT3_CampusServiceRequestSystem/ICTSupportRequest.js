"use strict";

const ServiceRequest = require("./ServiceRequest");
const { cleanRequired, cleanFromList } = require("./Validation");

/** An ICT fault: device, system, fault type and how widely the network is affected. */
class ICTSupportRequest extends ServiceRequest {
  #deviceType;
  #systemName;
  #faultType;
  #networkImpact;

  static DEVICE_TYPES = ["Laptop", "Desktop", "Printer", "Projector", "Mobile Device", "Network Equipment", "Other"];
  static FAULT_TYPES = ["Hardware", "Software", "Network", "Account Access", "Other"];
  static NETWORK_IMPACTS = ["None", "Single User", "Department", "Campus-wide"];

  static #IMPACT_BONUS = { None: 0, "Single User": 5, Department: 15, "Campus-wide": 30 };

  constructor(commonRequestData, specialisedData = {}) {
    super({ ...commonRequestData, category: "ICT Support" }); // constructor chaining
    this.#deviceType = cleanFromList(specialisedData.deviceType, ICTSupportRequest.DEVICE_TYPES, "device type");
    this.#systemName = cleanRequired(specialisedData.systemName, "System name");
    this.#faultType = cleanFromList(specialisedData.faultType, ICTSupportRequest.FAULT_TYPES, "fault type");
    this.#networkImpact = cleanFromList(specialisedData.networkImpact, ICTSupportRequest.NETWORK_IMPACTS, "network impact");
    this.validateSpecialisedFields();
  }

  get deviceType() { return this.#deviceType; }
  get systemName() { return this.#systemName; }
  get faultType() { return this.#faultType; }
  get networkImpact() { return this.#networkImpact; }

  // ---------- overridden methods ----------
  validateSpecialisedFields() {
    cleanFromList(this.#deviceType, ICTSupportRequest.DEVICE_TYPES, "device type");
    cleanRequired(this.#systemName, "System name");
    cleanFromList(this.#faultType, ICTSupportRequest.FAULT_TYPES, "fault type");
    cleanFromList(this.#networkImpact, ICTSupportRequest.NETWORK_IMPACTS, "network impact");
    return true;
  }

  /** A wider network impact raises the score. */
  calculatePriorityScore() {
    return super.calculatePriorityScore() + ICTSupportRequest.#IMPACT_BONUS[this.#networkImpact];
  }

  /** Campus-wide faults must be fixed within 4 hours, department faults within 24. */
  getTargetResolutionHours() {
    const base = super.getTargetResolutionHours();
    if (this.#networkImpact === "Campus-wide") return Math.min(base, 4);
    if (this.#networkImpact === "Department") return Math.min(base, 24);
    return base;
  }

  getRequestSummary() {
    return [
      super.getRequestSummary(),
      "--- ICT Support details ---",
      `Device Type: ${this.#deviceType}`,
      `System     : ${this.#systemName}`,
      `Fault Type : ${this.#faultType}`,
      `Net Impact : ${this.#networkImpact}`,
    ].join("\n");
  }
}

module.exports = ICTSupportRequest;
