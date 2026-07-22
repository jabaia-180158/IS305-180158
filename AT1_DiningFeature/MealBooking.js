/*
Program: Dining Meal Booking Feature
Student Name: Joseph ABAIA
Student ID: 180158
Date: 19 July 2026
Description: A JavaScript program demonstrating classes, objects, constructors, private fields and methods.
*/

// MealBooking.js
export class MealBooking {
    // Private fields
    #studentId;
    #studentName;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;

    // Constructor
    constructor(studentId, studentName, mealDate, mealType, quantity, dietaryNote = 'None') {
        this.#studentId = studentId;
        this.#studentName = studentName;
        this.#mealDate = mealDate;
        this.#mealType = mealType;
        this.#quantity = quantity;
        this.#dietaryNote = dietaryNote;
        this.#bookingStatus = 'Pending';
    }

    // Getters
    getStudentId() { return this.#studentId; }
    getStudentName() { return this.#studentName; }
    getMealDate() { return this.#mealDate; }
    getMealType() { return this.#mealType; }
    getQuantity() { return this.#quantity; }
    getDietaryNote() { return this.#dietaryNote; }
    getBookingStatus() { return this.#bookingStatus; }

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

    setMealDate(mealDate) {
        if (!mealDate || mealDate.trim() === '') {
            throw new Error('Meal date cannot be empty');
        }
        this.#mealDate = mealDate;
    }

    setMealType(mealType) {
        const validTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
        if (!validTypes.includes(mealType)) {
            throw new Error('Invalid meal type. Must be: Breakfast, Lunch, Dinner, or Snack');
        }
        this.#mealType = mealType;
    }

    setQuantity(quantity) {
        if (quantity < 1 || quantity > 10) {
            throw new Error('Quantity must be between 1 and 10');
        }
        this.#quantity = quantity;
    }

    setDietaryNote(dietaryNote) {
        this.#dietaryNote = dietaryNote || 'None';
    }

    setBookingStatus(bookingStatus) {
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        if (!validStatuses.includes(bookingStatus)) {
            throw new Error('Invalid status. Must be: Pending, Confirmed, or Cancelled');
        }
        this.#bookingStatus = bookingStatus;
    }

    // Calculate total cost
    calculateTotal() {
        const mealPrices = {
            'Breakfast': 12.50,
            'Lunch': 18.00,
            'Dinner': 22.50,
            'Snack': 8.00
        };
        const pricePerMeal = mealPrices[this.#mealType] || 15.00;
        return pricePerMeal * this.#quantity;
    }

    // Get booking summary
    getSummary() {
        const total = this.calculateTotal();
        return `
========================================
MEAL BOOKING SUMMARY
========================================
Student ID:      ${this.#studentId}
Student Name:    ${this.#studentName}
Meal Date:       ${this.#mealDate}
Meal Type:       ${this.#mealType}
Quantity:        ${this.#quantity}
Dietary Note:    ${this.#dietaryNote}
Booking Status:  ${this.#bookingStatus}
Total Cost:      $${total.toFixed(2)}
========================================
        `;
    }
}
