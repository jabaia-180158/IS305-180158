/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Description: Base DiningAccount class
*/

export class DiningAccount {
    #accountNumber;
    #balance;
    #transactions;

    constructor(accountNumber, openingBalance = 0) {
        if (!accountNumber || accountNumber.trim() === '') {
            throw new Error('Account number cannot be empty.');
        }

        if (typeof openingBalance !== 'number' || openingBalance < 0) {
            throw new Error('Opening balance cannot be negative.');
        }

        this.#accountNumber = accountNumber;
        this.#balance = openingBalance;
        this.#transactions = [];

        // Record opening balance if greater than zero
        if (openingBalance > 0) {
            this.#transactions.push({
                type: 'Opening Balance',
                amount: openingBalance,
                description: 'Account opening balance',
                dateTime: new Date().toLocaleString(),
                balanceAfter: this.#balance
            });
        }
    }

    // Getter for account number
    getAccountNumber() {
        return this.#accountNumber;
    }

    // Getter for balance
    getBalance() {
        return this.#balance;
    }

    // Safe copy of transaction history
    getTransactions() {
        return this.#transactions.map(transaction => ({ ...transaction }));
    }

    // Deposit money
    deposit(amount, description = 'Deposit') {
        if (typeof amount !== 'number' || !Number.isFinite(amount)) {
            throw new Error('Deposit amount must be a valid number.');
        }

        if (amount <= 0) {
            throw new Error('Deposit amount must be greater than zero.');
        }

        this.#balance += amount;

        this.#transactions.push({
            type: 'Deposit',
            amount: amount,
            description: description,
            dateTime: new Date().toLocaleString(),
            balanceAfter: this.#balance
        });

        return true;
    }

    // Standard meal payment
    payForMeal(amount, description = 'Meal payment') {
        return this._makePayment(
            amount,
            description,
            0
        );
    }

    /*
     * Internal payment method used by this class
     * and subclasses such as CreditDiningAccount.
     *
     * minimumBalance controls how far the account
     * is allowed to go below zero.
     */
    _makePayment(amount, description = 'Meal payment', minimumBalance = 0) {
        if (typeof amount !== 'number' || !Number.isFinite(amount)) {
            throw new Error('Payment amount must be a valid number.');
        }

        if (amount <= 0) {
            throw new Error('Payment amount must be greater than zero.');
        }

        const newBalance = this.#balance - amount;

        if (newBalance < minimumBalance) {
            console.log(
                `Payment rejected. Available balance/credit is not enough for K${amount.toFixed(2)}.`
            );
            return false;
        }

        this.#balance = newBalance;

        this.#transactions.push({
            type: 'Meal Payment',
            amount: amount,
            description: description,
            dateTime: new Date().toLocaleString(),
            balanceAfter: this.#balance
        });

        return true;
    }

    // Display account information
    displayAccountSummary() {
        console.log(`
Account Type:    ${this.constructor.name}
Account Number: ${this.#accountNumber}
Balance:         K${this.#balance.toFixed(2)}
Transactions:    ${this.#transactions.length}
        `);
    }
}