/*
Program: Dining Meal Booking Feature
Student Name: Joseph ABAIA
Student ID: 180158
Date: 19 July 2026
Description: Main application file demonstrating the MealBooking class
*/

// DiningApp.js
import { MealBooking } from './MealBooking.js';

// Test 1: Create a meal booking
console.log('=== TEST 1: Creating Meal Booking ===');
try {
    const booking1 = new MealBooking(
        'S12345',
        'John Doe',
        '2026-07-20',
        'Lunch',
        3,
        'Vegetarian, no dairy'
    );

    console.log('✅ Booking created successfully!');
    console.log(booking1.getSummary());
} catch (error) {
    console.error('❌ Error:', error.message);
}

// Test 2: Test setters and validation
console.log('\n=== TEST 2: Testing Setters and Validation ===');
try {
    const booking2 = new MealBooking(
        'S67890',
        'Jane Smith',
        '2026-07-21',
        'Dinner',
        2,
        'Gluten-free'
    );

    console.log('Original Status:', booking2.getBookingStatus());
    booking2.setBookingStatus('Confirmed');
    console.log('Updated Status:', booking2.getBookingStatus());

    booking2.setQuantity(5);
    console.log('Updated Quantity:', booking2.getQuantity());
    console.log('Updated Total: $' + booking2.calculateTotal().toFixed(2));

    // Test validation (should throw error)
    console.log('\nTesting validation - Invalid quantity:');
    booking2.setQuantity(15);
} catch (error) {
    console.log('✅ Validation working: ' + error.message);
}

// Test 3: Multiple bookings and calculations
console.log('\n=== TEST 3: Multiple Bookings ===');
const bookings = [
    new MealBooking('S001', 'Alice Johnson', '2026-07-22', 'Breakfast', 1, 'None'),
    new MealBooking('S002', 'Bob Williams', '2026-07-22', 'Lunch', 4, 'Keto-friendly'),
    new MealBooking('S003', 'Charlie Brown', '2026-07-23', 'Dinner', 2, 'Vegetarian')
];

bookings.forEach((booking, index) => {
    console.log(`\nBooking ${index + 1}:`);
    console.log(`Student: ${booking.getStudentName()}`);
    console.log(`Meal: ${booking.getMealType()} x ${booking.getQuantity()}`);
    console.log(`Total: $${booking.calculateTotal().toFixed(2)}`);
    console.log(`Status: ${booking.getBookingStatus()}`);
});

console.log('\n=== ALL TESTS COMPLETED ===');
console.log('✅ Program executed successfully');
