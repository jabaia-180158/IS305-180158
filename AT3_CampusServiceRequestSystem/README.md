# Campus Service Request Management System (IS305 AT3 - Pass Component)

A Node.js console application for registering users and submitting, viewing,
searching, updating and cancelling campus service requests. Data is held in
JavaScript arrays (no database).

## Requirements
- Node.js 18 or later (tested with the built-in `readline/promises` and `node:test`)

## Files
| File | Purpose |
|------|---------|
| `User.js` | `User` class - private fields, getters/setters, `validate()`, `displayInfo()` |
| `ServiceRequest.js` | `ServiceRequest` class - private fields, validation, `updateDetails()`, `cancelRequest()` |
| `ServiceRequestManager.js` | Manages users and requests in arrays; ownership and duplicate rules |
| `CampusServiceApp.js` | Console menu (entry point) |
| `PassTests.test.js` | Automated tests for the required Pass test table |

## Run
```
node CampusServiceApp.js
```

## Test
```
node --test
```

## Typical workflow
1. Option 1 - register a user (e.g. `S001`, type Student or Staff).
2. Option 2 - submit a request (choose category and priority by number).
3. Options 3, 4, 5 - view by ID, view your own, or view all.
4. Option 8 - search by any text (title, location, category, name, etc.).
5. Option 6 - update your own Submitted request (blank = keep current value).
6. Option 7 - cancel your own request.
7. Option 9 - see counts by status.

## Design notes
- **Encapsulation:** all fields are private (`#`); changes go through getters, validated setters and methods.
- **Validation:** rejects missing IDs/names/titles/descriptions, invalid emails, duplicate user and request IDs, unsupported categories and priorities, updates or cancellations by another user, and cancelling an already Cancelled request.
- **Separation of responsibilities:** classes hold business rules; only `CampusServiceApp.js` reads input or prints menus.
- **Error handling:** every menu action runs inside `try/catch`, so bad input shows a message instead of crashing.

## Assumptions
- Request IDs are entered by the user (e.g. `REQ001`) so duplicates can be detected.
- Pass-level statuses are `Submitted` and `Cancelled`; further statuses arrive in the Credit extension.
- Only `Student` and `Staff` user types exist at Pass level.

