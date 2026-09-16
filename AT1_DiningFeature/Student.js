/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Date: 16 September 2026
Description: Student class extended to support dining account assignment
*/

import { DiningAccount } from './DiningAccount.js';

export class Student {

    // Private fields
    #studentId;
    #studentName;
    #email;
    #phoneNumber;
    #enrollmentDate;
    #diningAccount;

    // Constructor
    constructor(
        studentId,
        studentName,
        email,
        phoneNumber,
        enrollmentDate
    ) {
        this.#studentId = studentId;
        this.#studentName = studentName;
        this.#email = email;
        this.#phoneNumber = phoneNumber;
        this.#enrollmentDate = enrollmentDate;
        this.#diningAccount = null;
    }

    // Getters
    getStudentId() {
        return this.#studentId;
    }

    getStudentName() {
        return this.#studentName;
    }

    getEmail() {
        return this.#email;
    }

    getPhoneNumber() {
        return this.#phoneNumber;
    }

    getEnrollmentDate() {
        return this.#enrollmentDate;
    }

    // Dining account getter
    getDiningAccount() {
        return this.#diningAccount;
    }

    // Setters with validation
    setStudentId(studentId) {

        if (!studentId || studentId.trim() === '') {
            throw new Error('Student ID cannot be empty');
        }

        this.#studentId = studentId;
    }

    setStudentName(studentName) {

        if (!studentName || studentName.trim() === '') {
            throw new Error('Student name cannot be empty');
        }

        this.#studentName = studentName;
    }

    setEmail(email) {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            throw new Error('Invalid email address');
        }

        this.#email = email;
    }

    setPhoneNumber(phoneNumber) {

        if (!phoneNumber || phoneNumber.trim() === '') {
            throw new Error('Phone number cannot be empty');
        }

        this.#phoneNumber = phoneNumber;
    }

    setEnrollmentDate(enrollmentDate) {

        if (!enrollmentDate || enrollmentDate.trim() === '') {
            throw new Error('Enrollment date cannot be empty');
        }

        this.#enrollmentDate = enrollmentDate;
    }

    // Assign dining account
    assignDiningAccount(account) {

        if (!(account instanceof DiningAccount)) {

            throw new Error(
                'Invalid dining account. The account must be a DiningAccount or one of its subclasses.'
            );
        }

        this.#diningAccount = account;

        console.log(
            `Dining account ${account.getAccountNumber()} assigned to ${this.#studentName}.`
        );
    }

    // Student summary
    getSummary() {

        const accountInformation =
            this.#diningAccount

                ? `
Dining Account:
---------------
Account Number: ${this.#diningAccount.getAccountNumber()}
Account Type:   ${this.#diningAccount.getAccountType()}
Balance:        K${this.#diningAccount.getBalance().toFixed(2)}
---------------`

                : `
Dining Account:
---------------
No dining account assigned.
---------------`;

        return `
Student Information:
-------------------
ID:              ${this.#studentId}
Name:            ${this.#studentName}
Email:           ${this.#email}
Phone:           ${this.#phoneNumber}
Enrolled:        ${this.#enrollmentDate}
-------------------
${accountInformation}
        `;
    }

    // Override toString
    toString() {
        return `${this.#studentName} (${this.#studentId})`;
    }
}