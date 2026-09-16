/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Description: CreditDiningAccount subclass with credit limit
*/

import { DiningAccount } from './DiningAccount.js';

export class CreditDiningAccount extends DiningAccount {
    #creditLimit;

    constructor(accountNumber, openingBalance = 0, creditLimit = 0) {
        super(accountNumber, openingBalance);

        if (typeof creditLimit !== 'number' || !Number.isFinite(creditLimit)) {
            throw new Error('Credit limit must be a valid number.');
        }

        if (creditLimit < 0) {
            throw new Error('Credit limit cannot be negative.');
        }

        this.#creditLimit = creditLimit;
    }

    // Getter for credit limit
    getCreditLimit() {
        return this.#creditLimit;
    }

    // Override payForMeal()
    payForMeal(amount, description = 'Meal payment') {
        return this.processCreditPayment(amount, description);
    }

    // Process payment using available credit
    processCreditPayment(amount, description = 'Meal payment') {
        if (typeof amount !== 'number' || !Number.isFinite(amount)) {
            throw new Error('Payment amount must be a valid number.');
        }

        if (amount <= 0) {
            throw new Error('Payment amount must be greater than zero.');
        }

        const minimumBalance = -this.#creditLimit;
        const currentBalance = this.getBalance();
        const newBalance = currentBalance - amount;

        console.log(
            `Current Balance: K${currentBalance.toFixed(2)}`
        );

        console.log(
            `Credit Limit: K${this.#creditLimit.toFixed(2)}`
        );

        console.log(
            `Balance after payment: K${newBalance.toFixed(2)}`
        );

        // Check credit limit
        if (newBalance < minimumBalance) {
            console.log(
                `Payment rejected. Credit limit of K${this.#creditLimit.toFixed(2)} would be exceeded.`
            );
            return false;
        }

        /*
         * Use the protected-style helper inherited
         * from DiningAccount.
         */
        const successful = this._makePayment(
            amount,
            description,
            minimumBalance
        );

        if (successful) {
            console.log('Payment successful.');
        }

        return successful;
    }

    // Display credit account summary
    displayAccountSummary() {
        console.log(`
Account Type:    ${this.constructor.name}
Account Number: ${this.getAccountNumber()}
Balance:         K${this.getBalance().toFixed(2)}
Credit Limit:    K${this.#creditLimit.toFixed(2)}
Available Credit: K${(this.getBalance() + this.#creditLimit).toFixed(2)}
Transactions:    ${this.getTransactions().length}
        `);
    }
}