/*
Program: Dining Meal Booking Feature - Lab 2 Extension
Student Name: Joseph ABAIA
Student ID: 180158
Date: 17 August 2026
Description: Student class for the dining meal booking application
*/

// Student.js
export class Student {
    // Private fields
    #studentId;
    #studentName;
    #email;
    #phoneNumber;
    #enrollmentDate;

    // Constructor
    constructor(studentId, studentName, email, phoneNumber, enrollmentDate) {
        this.#studentId = studentId;
        this.#studentName = studentName;
        this.#email = email;
        this.#phoneNumber = phoneNumber;
        this.#enrollmentDate = enrollmentDate;
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
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    // Get student summary
    getSummary() {
        return `
Student Information:
-------------------
ID:              ${this.#studentId}
Name:            ${this.#studentName}
Email:           ${this.#email}
Phone:           ${this.#phoneNumber}
Enrolled:        ${this.#enrollmentDate}
-------------------
        `;
    }

    // Override toString method
    toString() {
        return `${this.#studentName} (${this.#studentId})`;
    }
}
