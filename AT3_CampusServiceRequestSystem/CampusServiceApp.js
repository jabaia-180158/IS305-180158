"use strict";

const readline = require("node:readline");
const { stdin, stdout } = require("node:process");
const User = require("./User");
const ServiceRequest = require("./ServiceRequest");
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
============================================`;

class CampusServiceApp {
  #manager = new ServiceRequestManager();
  #rl = null;
  #lines = [];    // lines received but not yet asked for
  #waiting = [];  // pending ask() callbacks
  #closed = false;

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

  // ---------- menu actions ----------
  async #registerUser() {
    const id = await this.#ask("User ID: ");
    const first = await this.#ask("First name: ");
    const last = await this.#ask("Last name: ");
    const email = await this.#ask("Email address: ");
    const type = await this.#pick("User type", User.USER_TYPES);
    const user = this.#manager.registerUser(new User(id, first, last, email, type));
    console.log("\nUser registered successfully:\n" + user.displayInfo());
  }

  async #submitRequest() {
    const userId = await this.#ask("Your user ID: ");
    const user = this.#manager.findUserById(userId);
    if (!user) throw new Error(`User "${userId}" is not registered. Register first (option 1).`);
    const requestId = await this.#ask("Request ID (e.g. REQ001): ");
    const title = await this.#ask("Title: ");
    const description = await this.#ask("Description: ");
    const location = await this.#ask("Campus location: ");
    const category = await this.#pick("Category", ServiceRequest.CATEGORIES);
    const priority = await this.#pick("Priority", ServiceRequest.PRIORITIES);
    const request = this.#manager.submitRequest(
      new ServiceRequest(requestId, user, title, description, location, category, priority)
    );
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
    const text = await this.#ask("Search text: ");
    this.#printList(this.#manager.searchRequests(text), `No requests match "${text}".`);
  }

  #summary() {
    const s = this.#manager.getRequestSummaryByStatus();
    console.log("\nREQUEST SUMMARY BY STATUS");
    console.log("-------------------------");
    for (const [status, count] of Object.entries(s)) console.log(`${status.padEnd(12)}: ${count}`);
  }

  // ---------- main loop ----------
  async run() {
    this.#setupInput();
    let running = true;
    while (running) {
      console.log(MENU);
      const choice = await this.#ask("Enter your choice (1-10): ");
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
          default: console.log("Invalid choice. Please enter a number from 1 to 10.");
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
