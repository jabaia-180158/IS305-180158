/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Date: 16 September 2026
Description: MealBooking class with payment processing and duplicate payment prevention
*/

import { Student } from './Student.js';

export class MealBooking {

    // Private fields
    #student;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;
    #bookingId;
    #paymentProcessed;

    // Constructor
    constructor(
        student,
        mealDate,
        mealType,
        quantity,
        dietaryNote = 'None'
    ) {

        if (!(student instanceof Student)) {
            throw new Error('Invalid student object');
        }

        this.#student = student;
        this.#mealDate = mealDate;
        this.#mealType = mealType;
        this.#quantity = quantity;
        this.#dietaryNote = dietaryNote;
        this.#bookingStatus = 'Pending';
        this.#paymentProcessed = false;
        this.#bookingId = this.#generateBookingId();
    }

    // Generate unique booking ID
    #generateBookingId() {

        const timestamp = Date.now().toString(36);
        const random =
            Math.random().toString(36).substring(2, 6);

        return `BK-${timestamp}-${random}`;
    }

    // Getters
    getStudent() {
        return this.#student;
    }

    getStudentId() {
        return this.#student
            ? this.#student.getStudentId()
            : 'No Student';
    }

    getStudentName() {
        return this.#student
            ? this.#student.getStudentName()
            : 'No Student';
    }

    getMealDate() {
        return this.#mealDate;
    }

    getMealType() {
        return this.#mealType;
    }

    getQuantity() {
        return this.#quantity;
    }

    getDietaryNote() {
        return this.#dietaryNote;
    }

    getBookingStatus() {
        return this.#bookingStatus;
    }

    getBookingId() {
        return this.#bookingId;
    }

    // Setters
    setStudent(student) {

        if (!(student instanceof Student)) {
            throw new Error('Invalid student object');
        }

        this.#student = student;
    }

    setMealDate(mealDate) {

        if (!mealDate || mealDate.trim() === '') {
            throw new Error('Meal date cannot be empty');
        }

        this.#mealDate = mealDate;
    }

    setMealType(mealType) {

        const validTypes = [
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snack'
        ];

        if (!validTypes.includes(mealType)) {
            throw new Error(
                'Invalid meal type. Must be: Breakfast, Lunch, Dinner, or Snack'
            );
        }

        this.#mealType = mealType;
    }

    setQuantity(quantity) {

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 10
        ) {
            throw new Error(
                'Quantity must be between 1 and 10'
            );
        }

        this.#quantity = quantity;
    }

    setDietaryNote(dietaryNote) {
        this.#dietaryNote = dietaryNote || 'None';
    }

    setBookingStatus(bookingStatus) {

        const validStatuses = [
            'Pending',
            'Confirmed',
            'Cancelled'
        ];

        if (!validStatuses.includes(bookingStatus)) {
            throw new Error(
                'Invalid status. Must be: Pending, Confirmed, or Cancelled'
            );
        }

        this.#bookingStatus = bookingStatus;
    }

    // Calculate total cost
    calculateTotal() {

        const mealPrices = {
            Breakfast: 12.50,
            Lunch: 18.00,
            Dinner: 22.50,
            Snack: 8.00
        };

        const pricePerMeal =
            mealPrices[this.#mealType] || 15.00;

        return pricePerMeal * this.#quantity;
    }

    // Process payment
    processPayment(diningAccount) {

        // Prevent duplicate payment
        if (this.#paymentProcessed) {

            console.log(
                'Payment rejected: this booking has already been paid.'
            );

            return false;
        }

        // Prevent payment for confirmed booking
        if (this.#bookingStatus === 'Confirmed') {

            console.log(
                'Payment rejected: this booking is already confirmed.'
            );

            return false;
        }

        // Prevent payment for cancelled booking
        if (this.#bookingStatus === 'Cancelled') {

            console.log(
                'Payment rejected: cancelled bookings cannot be paid.'
            );

            return false;
        }

        // Validate account
        if (
            !diningAccount ||
            typeof diningAccount.payForMeal !== 'function'
        ) {
            throw new Error('Invalid dining account.');
        }

        // Calculate booking cost
        const total = this.calculateTotal();

        console.log(
            `Processing payment of K${total.toFixed(2)}...`
        );

        // Polymorphic method call
        const paymentSuccessful =
            diningAccount.payForMeal(
                total,
                `${this.#mealType} booking`
            );

        if (paymentSuccessful) {

            this.#bookingStatus = 'Confirmed';
            this.#paymentProcessed = true;

            console.log('Payment successful.');
            console.log('Booking Status: Confirmed');

            return true;
        }

        // Payment failed
        this.#bookingStatus = 'Pending';

        console.log('Payment failed.');
        console.log('Booking Status: Pending');

        return false;
    }

    // Booking summary
    getSummary() {

        const total = this.calculateTotal();

        return `
========================================
          MEAL BOOKING SUMMARY
========================================
Booking ID:      ${this.#bookingId}
Student:         ${this.getStudentName()}
Student ID:      ${this.getStudentId()}
Meal Date:       ${this.#mealDate}
Meal Type:       ${this.#mealType}
Quantity:        ${this.#quantity}
Dietary Note:    ${this.#dietaryNote}
Booking Status:  ${this.#bookingStatus}
Total Cost:      K${total.toFixed(2)}
========================================
        `;
    }

    // Compact booking record
    getBookingRecord() {

        return {
            bookingId: this.#bookingId,
            studentId: this.getStudentId(),
            studentName: this.getStudentName(),
            mealDate: this.#mealDate,
            mealType: this.#mealType,
            quantity: this.#quantity,
            total: this.calculateTotal(),
            status: this.#bookingStatus
        };
    }
}