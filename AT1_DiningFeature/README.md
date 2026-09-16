# AT1 Dining Feature

**Student Name:** Joseph ABAIA
**Student ID:** 180158
**Unit:** IS305 - Web Development
**Date:** September 2026

## Description

This project implements a university dining account and meal booking system using JavaScript ES6 classes, inheritance, polymorphism, and encapsulation via private class fields. It models students, dining accounts (standard, rewards, and credit variants), and meal bookings, including full payment processing between bookings and accounts.

## Features

- **Student management** — store and display student details (ID, name, email, phone, enrollment date) and link each student to a dining account.
- **Standard dining account (`DiningAccount`)** — deposits, meal payments, and a running transaction history with private fields for account number, balance, and transactions.
- **Rewards dining account (`RewardsDiningAccount`)** — extends `DiningAccount`; earns a percentage-based reward on the account balance and applies it as a bonus deposit.
- **Credit dining account (`CreditDiningAccount`)** — extends `DiningAccount`; allows the balance to go negative up to a defined credit limit, rejecting payments that would exceed it.
- **Meal booking (`MealBooking`)** — represents a booking (date, meal type, quantity, dietary note) tied to a student, calculates total cost, and processes payment against a linked dining account, including rejection of duplicate payments and handling of insufficient funds.
- **Polymorphism** — a single loop can call `displayAccountSummary()` on any account type (standard, rewards, or credit) and get the correct type-specific output.

## Project Structure

```
AT1_DiningFeature/
├── DiningAccount.js          # Base dining account class
├── RewardsDiningAccount.js   # Rewards account subclass
├── CreditDiningAccount.js    # Credit account subclass
├── Student.js                # Student class
├── MealBooking.js            # Meal booking class with payment processing
├── DiningApp.js              # Main script demonstrating all features
├── package.json              # Project config (ES module type)
└── README.md                 # This file
```

## Requirements

- [Node.js](https://nodejs.org/) v18 or later (tested on v26.4.0)

## Setup

1. Clone or download the repository.
2. Navigate into the project folder:
   ```bash
   cd AT1_DiningFeature
   ```
3. No external dependencies are required — this project uses only built-in JavaScript features.

## Running the Program

Run the main demonstration script:

```bash
node DiningApp.js
```

This will execute all sections in sequence, printing:

1. Student information
2. Standard account deposit and payment demo
3. Rewards account and reward calculation demo
4. Credit account and credit limit demo
5. Polymorphic account summaries
6. Assigning a dining account to a student
7. Meal booking creation
8. Booking payment processing
9. Duplicate payment rejection
10. Insufficient funds handling
11. Constructor variation tests
12. Method variation tests
13. Full transaction history
14. Summary of test results

## Key Concepts Demonstrated

- **Encapsulation** — private class fields (`#fieldName`) protect internal state; access is only possible through defined getters, setters, and methods.
- **Inheritance** — `RewardsDiningAccount` and `CreditDiningAccount` both extend `DiningAccount` and reuse its constructor via `super()`.
- **Polymorphism** — each subclass overrides `displayAccountSummary()` to show type-specific details while still being called through the same interface.
- **Composition** — `Student` holds a reference to a `DiningAccount` (or subclass) object, and `MealBooking` holds a reference to a `Student` object.

## Notes

- All monetary values are displayed in Kina (K), formatted to two decimal places.
- Transaction records include `type`, `amount`, `description`, `dateTime`, and `balanceAfter` for a full audit trail.
- This project uses ES module syntax (`import`/`export`), so `package.json` must have `"type": "module"` set.
