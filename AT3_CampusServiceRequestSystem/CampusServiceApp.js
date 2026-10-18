"use strict";

const readline = require("node:readline");
const { stdin, stdout } = require("node:process");
const User = require("./User");
const StudentRequester = require("./StudentRequester");
const StaffRequester = require("./StaffRequester");
const ServiceOfficer = require("./ServiceOfficer");
const Technician = require("./Technician");
const ServiceRequest = require("./ServiceRequest");
const ICTSupportRequest = require("./ICTSupportRequest");
const MaintenanceRequest = require("./MaintenanceRequest");
const CleaningRequest = require("./CleaningRequest");
const ServiceRequestManager = require("./ServiceRequestManager");

const MENU = `
============================================
     CAMPUS SERVICE REQUEST SYSTEM
============================================
1. Register User
2. Submit Service Request
3. View Request by ID
4. View My Requests
5. View All Requests
6. Update My Request
7. Cancel My Request
8. Search Requests
9. View Request Summary
10. Exit
--------------------------------------------
 Role workflows, reports and history
--------------------------------------------
11. Service Officer Menu
12. Technician Menu
13. Filter and Sort Requests
14. View Request History
============================================`;

class CampusServiceApp {
  #manager = new ServiceRequestManager();
  #rl = null;
  #lines = [];    // lines received but not yet asked for
  #waiting = [];  // pending ask() callbacks
  #closed = false;

  // ---------- input / output helpers ----------
  #setupInput() {
    this.#rl = readline.createInterface({ input: stdin, terminal: false });
    this.#rl.on("line", (line) => {
      const waiter = this.#waiting.shift();
      if (waiter) waiter(line);
      else this.#lines.push(line);
    });
    this.#rl.on("close", () => {
      this.#closed = true;
      while (this.#waiting.length) this.#waiting.shift()(null);
    });
  }

  // Queue-based input so it works for typed and piped input alike.
  // Returns null when input has ended (e.g. Ctrl+D).
  #ask(prompt) {
    stdout.write(prompt);
    return new Promise((resolve) => {
      if (this.#lines.length) return resolve(this.#lines.shift().trim());
      if (this.#closed) return resolve(null);
      this.#waiting.push((line) => resolve(line === null ? null : line.trim()));
    });
  }

  async #pick(label, options) {
    console.log(`${label}:`);
    options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
    const answer = await this.#ask("Enter number or name: ");
    const index = Number(answer);
    if (Number.isInteger(index) && index >= 1 && index <= options.length) return options[index - 1];
    return answer; // let the class validation reject unsupported text
  }

  #printList(requests, emptyMessage) {
    if (requests.length === 0) return console.log(emptyMessage);
    requests.forEach((r) => console.log(`\n${r.getRequestSummary()}`));
    console.log(`\n${requests.length} request(s) shown.`);
  }

  #printBrief(requests, emptyMessage) {
    if (requests.length === 0) return console.log(emptyMessage);
    for (const r of requests) {
      const tech = r.assignedTechnician ? r.assignedTechnician.userId : "-";
      console.log(`${r.requestId.padEnd(8)} ${r.status.padEnd(12)} ${r.priority.padEnd(7)} ${r.category.padEnd(24)} tech:${tech.padEnd(6)} ${r.title}`);
    }
    console.log(`${requests.length} request(s) shown.`);
  }

  async #askUser(prompt = "Your user ID: ") {
    const id = await this.#ask(prompt);
    const user = this.#manager.findUserById(id);
    if (!user) throw new Error(`User "${id}" is not registered.`);
    return user;
  }

  // ---------- Pass menu actions ----------
  async #registerUser() {
    const id = await this.#ask("User ID: ");
    const first = await this.#ask("First name: ");
    const last = await this.#ask("Last name: ");
    const email = await this.#ask("Email address: ");
    const type = await this.#pick("User type", User.USER_TYPES);

    let user;
    switch (String(type).toLowerCase()) {
      case "student": {
        const programme = await this.#ask("Programme: ");
        const year = await this.#ask("Year level (1-6): ");
        user = new StudentRequester(id, first, last, email, programme, year);
        break;
      }
      case "staff": {
        const department = await this.#ask("Department: ");
        user = new StaffRequester(id, first, last, email, department);
        break;
      }
      case "service officer": {
        const section = await this.#ask("Service section: ");
        user = new ServiceOfficer(id, first, last, email, section);
        break;
      }
      case "technician": {
        const speciality = await this.#ask("Technical speciality: ");
        user = new Technician(id, first, last, email, speciality);
        break;
      }
      default:
        user = new User(id, first, last, email, type); // rejects an unsupported type
    }
    this.#manager.registerUser(user);
    console.log("\nUser registered successfully:\n" + user.displayInfo());
  }

  async #submitRequest() {
    const requester = await this.#askUser();
    const requestId = await this.#ask("Request ID (e.g. REQ001): ");
    const title = await this.#ask("Title: ");
    const description = await this.#ask("Description: ");
    const location = await this.#ask("Campus location: ");
    const category = await this.#pick("Category", ServiceRequest.CATEGORIES);
    const priority = await this.#pick("Priority", ServiceRequest.PRIORITIES);
    const common = { requestId, requester, title, description, location, priority };

    let request;
    switch (String(category).toLowerCase()) {
      case "ict support": {
        console.log("\nICT details:");
        request = new ICTSupportRequest(common, {
          deviceType: await this.#pick("Device type", ICTSupportRequest.DEVICE_TYPES),
          systemName: await this.#ask("System name (e.g. Moodle, Wi-Fi): "),
          faultType: await this.#pick("Fault type", ICTSupportRequest.FAULT_TYPES),
          networkImpact: await this.#pick("Network impact", ICTSupportRequest.NETWORK_IMPACTS),
        });
        break;
      }
      case "facilities maintenance": {
        console.log("\nMaintenance details:");
        request = new MaintenanceRequest(common, {
          building: await this.#ask("Building: "),
          roomNumber: await this.#ask("Room number: "),
          hazardLevel: await this.#pick("Hazard level", MaintenanceRequest.HAZARD_LEVELS),
          equipmentAffected: await this.#ask("Equipment affected: "),
        });
        break;
      }
      case "cleaning and sanitation": {
        console.log("\nCleaning details:");
        request = new CleaningRequest(common, {
          cleaningArea: await this.#ask("Cleaning area: "),
          hygieneRisk: await this.#pick("Hygiene risk", CleaningRequest.HYGIENE_RISKS),
          serviceType: await this.#pick("Service type", CleaningRequest.SERVICE_TYPES),
          preferredServiceTime: await this.#ask("Preferred service time (HH:MM, e.g. 13:30): "),
        });
        break;
      }
      default:
        // General Campus Service uses the base class; an unsupported category is rejected here
        request = new ServiceRequest({ ...common, category });
    }
    this.#manager.submitRequest(request);
    console.log("\nRequest submitted successfully:\n" + request.getRequestSummary());
  }

  async #viewById() {
    const id = await this.#ask("Request ID: ");
    const request = this.#manager.findRequestById(id);
    console.log(request ? "\n" + request.getRequestSummary() : `No request found with ID "${id}".`);
  }

  async #viewMine() {
    const userId = await this.#ask("Your user ID: ");
    this.#printList(this.#manager.getRequestsByUser(userId), "You have no requests.");
  }

  #viewAll() {
    this.#printList(this.#manager.getAllRequests(), "There are no requests in the system.");
  }

  async #updateMine() {
    const userId = await this.#ask("Your user ID: ");
    const requestId = await this.#ask("Request ID to update: ");
    console.log("Leave a field blank to keep its current value.");
    const changes = {
      title: await this.#ask("New title: "),
      description: await this.#ask("New description: "),
      location: await this.#ask("New campus location: "),
    };
    const cat = await this.#ask(`New category (1-${ServiceRequest.CATEGORIES.length} or name, blank to skip): `);
    const pri = await this.#ask(`New priority (1-${ServiceRequest.PRIORITIES.length} or name, blank to skip): `);
    const byNumber = (value, list) => (Number.isInteger(Number(value)) && list[Number(value) - 1]) || value;
    changes.category = cat === "" ? "" : byNumber(cat, ServiceRequest.CATEGORIES);
    changes.priority = pri === "" ? "" : byNumber(pri, ServiceRequest.PRIORITIES);
    const request = this.#manager.updateRequest(requestId, userId, changes);
    console.log("\nRequest updated successfully:\n" + request.getRequestSummary());
  }

  async #cancelMine() {
    const userId = await this.#ask("Your user ID: ");
    const requestId = await this.#ask("Request ID to cancel: ");
    const request = this.#manager.cancelRequest(requestId, userId);
    console.log(`\nRequest ${request.requestId} is now ${request.status}.`);
  }

  async #search() {
    const text = await this.#ask("Search text (request ID, title, location...): ");
    this.#printList(this.#manager.searchRequests(text), `No requests match "${text}".`);
  }

  #summary() {
    const s = this.#manager.getRequestSummaryByStatus();
    console.log("\nREQUEST SUMMARY BY STATUS");
    console.log("-------------------------");
    for (const [status, count] of Object.entries(s)) console.log(`${status.padEnd(12)}: ${count}`);
  }

  // ---------- Credit: role menus ----------
  /** Generic sub-menu loop. Each item is [label, async action]. Errors never leave the menu. */
  async #runSubmenu(title, items) {
    let inMenu = true;
    while (inMenu) {
      console.log(`\n---------- ${title} ----------`);
      items.forEach(([label], i) => console.log(`${i + 1}. ${label}`));
      console.log("0. Back to main menu");
      const choice = await this.#ask("Choice: ");
      if (choice === null || choice === "0") break;
      const item = items[Number(choice) - 1];
      if (!item) { console.log("Invalid choice."); continue; }
      try {
        await item[1]();
      } catch (error) {
        console.log(`\nError: ${error.message}`);
      }
    }
  }

  async #officerMenu() {
    const officer = await this.#askUser("Service Officer ID: ");
    console.log(`\nActing as: ${officer.getFullName()} (${officer.userType})`);
    const m = this.#manager;
    const show = (r, message) => console.log(`\n${message}\n` + r.getRequestSummary());

    await this.#runSubmenu("SERVICE OFFICER MENU", [
      ["View requests waiting for review", async () =>
        this.#printBrief(m.filterByStatus("Submitted"), "No requests are waiting for review.")],
      ["Review a request", async () => {
        const id = await this.#ask("Request ID: ");
        const comment = await this.#ask("Review comment (blank for default): ");
        show(m.reviewRequest(id, officer.userId, comment || undefined), "Request reviewed.");
      }],
      ["Assign priority", async () => {
        const id = await this.#ask("Request ID: ");
        const priority = await this.#pick("Priority", ServiceRequest.PRIORITIES);
        show(m.setRequestPriority(id, officer.userId, priority), "Priority assigned.");
      }],
      ["Assign Technician", async () => {
        const id = await this.#ask("Request ID: ");
        const techs = m.getTechnicians();
        if (techs.length === 0) throw new Error("No Technicians are registered yet.");
        console.log("Available Technicians:");
        techs.forEach((t) => console.log(`  ${t.userId} - ${t.getFullName()} (${t.speciality})`));
        const techId = await this.#ask("Technician ID: ");
        show(m.assignTechnician(id, officer.userId, techId), "Technician assigned.");
      }],
      ["Verify and close a Resolved request", async () => {
        const id = await this.#ask("Request ID: ");
        const comment = await this.#ask("Closing comment (blank for default): ");
        show(m.closeRequest(id, officer.userId, comment || undefined), "Request closed.");
      }],
      ["View all requests", async () => this.#printBrief(m.getAllRequests(), "There are no requests in the system.")],
    ]);
  }

  async #technicianMenu() {
    const tech = await this.#askUser("Technician ID: ");
    console.log(`\nActing as: ${tech.getFullName()} (${tech.userType})`);
    const m = this.#manager;
    const show = (r, message) => console.log(`\n${message}\n` + r.getRequestSummary());

    await this.#runSubmenu("TECHNICIAN MENU", [
      ["View my assigned requests", async () =>
        this.#printBrief(m.getRequestsAssignedTo(tech.userId), "No requests are assigned to you.")],
      ["Begin work on a request", async () => {
        const id = await this.#ask("Request ID: ");
        show(m.startWork(id, tech.userId), "Work started.");
      }],
      ["Record a progress update", async () => {
        const id = await this.#ask("Request ID: ");
        const note = await this.#ask("Progress note: ");
        show(m.addProgressNote(id, tech.userId, note), "Progress recorded.");
      }],
      ["Resolve a request", async () => {
        const id = await this.#ask("Request ID: ");
        const comment = await this.#ask("Resolution comment (blank for default): ");
        show(m.resolveRequest(id, tech.userId, comment || undefined), "Request resolved.");
      }],
    ]);
  }

  // ---------- Credit: filter, sort and history ----------
  async #filterAndSort() {
    const m = this.#manager;
    await this.#runSubmenu("FILTER AND SORT", [
      ["Filter by category", async () =>
        this.#printBrief(m.filterByCategory(await this.#pick("Category", ServiceRequest.CATEGORIES)), "No matching requests.")],
      ["Filter by status", async () =>
        this.#printBrief(m.filterByStatus(await this.#pick("Status", ServiceRequest.STATUSES)), "No matching requests.")],
      ["Filter by priority", async () =>
        this.#printBrief(m.filterByPriority(await this.#pick("Priority", ServiceRequest.PRIORITIES)), "No matching requests.")],
      ["Filter by assigned Technician", async () =>
        this.#printBrief(m.filterByTechnician(await this.#ask("Technician ID: ")), "No matching requests.")],
      ["Sort by date submitted (oldest first)", async () =>
        this.#printBrief(m.sortByDateSubmitted(), "There are no requests in the system.")],
      ["Sort by date submitted (newest first)", async () =>
        this.#printBrief(m.sortByDateSubmitted(undefined, true), "There are no requests in the system.")],
      ["Sort by priority (highest first)", async () =>
        this.#printBrief(m.sortByPriority(), "There are no requests in the system.")],
      ["Sort by priority (lowest first)", async () =>
        this.#printBrief(m.sortByPriority(undefined, false), "There are no requests in the system.")],
    ]);
  }

  async #viewHistory() {
    const id = await this.#ask("Request ID: ");
    const request = this.#manager.findRequestById(id);
    if (!request) throw new Error(`Request "${id}" was not found.`);
    const fmt = (d) => d.toLocaleString("en-GB");
    console.log(`\nHISTORY OF ${request.requestId} - ${request.title}`);
    request.getHistory().forEach((h, i) => {
      console.log(`${i + 1}. ${fmt(h.date)} | ${h.previousStatus ?? "(new)"} -> ${h.newStatus} | ${h.action}`);
      console.log(`   by ${h.actorId} (${h.actorRole}) - ${h.comment}`);
    });
  }

  // ---------- main loop ----------
  async run() {
    this.#setupInput();
    let running = true;
    while (running) {
      console.log(MENU);
      const choice = await this.#ask("Enter your choice (1-14): ");
      if (choice === null) { console.log("\nInput ended. Goodbye."); break; }
      try {
        switch (choice) {
          case "1": await this.#registerUser(); break;
          case "2": await this.#submitRequest(); break;
          case "3": await this.#viewById(); break;
          case "4": await this.#viewMine(); break;
          case "5": this.#viewAll(); break;
          case "6": await this.#updateMine(); break;
          case "7": await this.#cancelMine(); break;
          case "8": await this.#search(); break;
          case "9": this.#summary(); break;
          case "10": running = false; console.log("Goodbye."); break;
          case "11": await this.#officerMenu(); break;
          case "12": await this.#technicianMenu(); break;
          case "13": await this.#filterAndSort(); break;
          case "14": await this.#viewHistory(); break;
          default: console.log("Invalid choice. Please enter a number from 1 to 14.");
        }
      } catch (error) {
        console.log(`\nError: ${error.message}`); // rejected input never crashes the app
      }
    }
    this.#rl.close();
  }
}

if (require.main === module) {
  new CampusServiceApp().run();
}

module.exports = CampusServiceApp;
