# Campus Service Request Management System

**IS305 Object-Oriented Programming - Assessment Task 3 (Major Project)**
Name: Joseph ABAIA | Student ID: 180158

A Node.js console application that records, assigns, processes and monitors campus
service requests. Data is held in JavaScript objects and arrays (no database).

**Completed so far:** Pass (core system) and Credit (inheritance, specialised
requests, role workflows). Distinction (polymorphic reports, JSON storage) is not yet started.

## Requirements
- Node.js 18 or later

## How to run
```
npm start        # runs: node CampusServiceApp.js
npm test         # runs all automated tests (34 tests)
```
In Git Bash, if the menu prompts do not appear, use `winpty node CampusServiceApp.js`.

## Project files
| File | Purpose |
|------|---------|
| `CampusServiceApp.js` | Console menu (entry point) |
| `ServiceRequestManager.js` | Holds users and requests; workflow, search, filter and sort |
| `User.js` | Base user class |
| `StudentRequester.js`, `StaffRequester.js` | Requester subclasses (programme and year level; department) |
| `ServiceOfficer.js`, `Technician.js` | Role subclasses (service section; technical speciality) |
| `ServiceRequest.js` | Base request class: workflow, permissions and history |
| `ICTSupportRequest.js`, `MaintenanceRequest.js`, `CleaningRequest.js` | Specialised request classes |
| `Validation.js` | Shared validation helpers |
| `PassTests.test.js`, `CreditTests.test.js` | Automated tests |

## Class design
```
User                          ServiceRequest
 |-- StudentRequester          |-- ICTSupportRequest
 |-- StaffRequester            |-- MaintenanceRequest
 |-- ServiceOfficer            `-- CleaningRequest
 `-- Technician
```
Every subclass constructor calls its parent constructor with `super()` first, then
validates and stores its own private fields. "General Campus Service" requests use the
base `ServiceRequest` class directly.

| Request class | Specialised fields |
|---------------|--------------------|
| `ICTSupportRequest` | device type, system name, fault type, network impact |
| `MaintenanceRequest` | building, room number, hazard level, equipment affected |
| `CleaningRequest` | cleaning area, hygiene risk, service type, preferred service time (HH:MM) |

## Controlled workflow
```
Submitted -> Reviewed -> Assigned -> In Progress -> Resolved -> Closed
Submitted -> Cancelled
```
Closed and Cancelled are final. Every status change goes through one private method in
`ServiceRequest`, which checks a table of permitted transitions and rejects anything else.

| Action | Who may do it |
|--------|---------------|
| Update or cancel a request | The requester who owns it, while it is Submitted |
| Review, assign priority, assign a Technician, close | A Service Officer |
| Begin work, record progress, resolve | The Technician assigned to that request |

## Method overriding
Each specialised request class overrides `validateSpecialisedFields()`,
`calculatePriorityScore()`, `getTargetResolutionHours()` and `getRequestSummary()`.
For example, a campus-wide ICT fault raises the priority score and shortens the target
resolution time, and a high-hazard maintenance request does the same through its hazard
level. The base class provides the default behaviour.

## Request history
Every request keeps a history array. Each entry records the previous status, new status,
action, actor ID, actor role, comment and date/time. Rejected actions are never recorded.
`getHistory()` returns copies, so the history cannot be changed from outside the class.

## Search, filter and sort
- Search by request ID, title and other text fields
- Filter by category, status, priority and assigned Technician
- Sort by date submitted and by priority

## Menu
Options 1 to 10 are the Pass menu (unchanged). Options 11 to 14 were added for Credit:
11 Service Officer Menu, 12 Technician Menu, 13 Filter and Sort Requests,
14 View Request History.

## Testing
`npm test` runs 34 tests: 12 Pass tests and 22 Credit tests.

| Required Credit test | Covered by |
|----------------------|------------|
| Subclass constructors call `super()` | User and request subclass chaining tests |
| Specialised fields are validated | Specialised user and request field tests |
| Only Service Officers assign Technicians | Review/assign permission tests |
| Only assigned Technicians update work | Assigned Technician tests |
| Invalid transitions are rejected | Transition and final-status tests |
| Specialised summaries are correct | Summary and overridden-method tests |
| Search, filter and sort | Search, filter and sort tests |
| History records workflow actions | History tests |

## Assumptions
- Request IDs are typed by the user (for example `REQ001`) so duplicates can be detected.
- Only Student and Staff users can submit requests.
- A priority is assigned while the request is Reviewed, before a Technician is assigned.
- `ServiceRequest` accepts either positional arguments (Pass style) or one data object
  (used by the subclasses), so the Pass code and tests keep working unchanged.
- The status summary now lists every workflow status, so the Pass summary test was updated
  to expect the extra zero counts.

## Next stage (Distinction)
Polymorphism and abstraction in reporting, JSON file persistence with `fs/promises`,
and further automated tests.
