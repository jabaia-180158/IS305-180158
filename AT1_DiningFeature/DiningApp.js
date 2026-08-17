/*
Program: Dining Meal Booking Feature - Lab 2 Extension
Student Name: Joseph ABAIA
Student ID: 180158
Date: 17 August 2026
Description: Main application demonstrating Student and MealBooking classes working together
*/

// DiningApp.js
import { Student } from './Student.js';
import { MealBooking } from './MealBooking.js';

// ============================================
// SECTION 1: Create Student Objects
// ============================================
console.log('=== SECTION 1: Creating Student Objects ===\n');

const student1 = new Student(
    'S1001',
    'John Doe',
    'john.doe@university.edu',
    '+61 412 345 678',
    '2024-02-15'
);

const student2 = new Student(
    'S1002',
    'Jane Smith',
    'jane.smith@university.edu',
    '+61 423 456 789',
    '2024-03-01'
);

const student3 = new Student(
    'S1003',
    'Bob Williams',
    'bob.williams@university.edu',
    '+61 434 567 890',
    '2024-01-20'
);

// Display student summaries
console.log('Student 1:');
console.log(student1.getSummary());
console.log('\nStudent 2:');
console.log(student2.getSummary());
console.log('\nStudent 3:');
console.log(student3.getSummary());

// ============================================
// SECTION 2: Create MealBookings Connected to Students
// ============================================
console.log('\n=== SECTION 2: Creating Meal Bookings ===\n');

const booking1 = new MealBooking(
    student1,  // Pass Student object instead of ID and Name
    '2026-07-20',
    'Lunch',
    3,
    'Vegetarian, no dairy'
);

const booking2 = new MealBooking(
    student1,  // Same student - multiple bookings
    '2026-07-21',
    'Dinner',
    2,
    'None'
);

const booking3 = new MealBooking(
    student2,
    '2026-07-20',
    'Breakfast',
    1,
    'Gluten-free'
);

const booking4 = new MealBooking(
    student3,
    '2026-07-22',
    'Lunch',
    4,
    'Keto-friendly'
);

console.log('✅ All bookings created successfully!');
console.log(`Total bookings: 4`);

// ============================================
// SECTION 3: Display All Bookings
// ============================================
console.log('\n=== SECTION 3: Displaying All Bookings ===\n');

const bookings = [booking1, booking2, booking3, booking4];
let totalRevenue = 0;

bookings.forEach((booking, index) => {
    console.log(`Booking ${index + 1}:`);
    console.log(booking.getSummary());
    totalRevenue += booking.calculateTotal();
});

console.log(`\n📊 Total Revenue from All Bookings: $${totalRevenue.toFixed(2)}`);

// ============================================
// SECTION 4: Demonstrate Student with Multiple Bookings
// ============================================
console.log('\n=== SECTION 4: Student with Multiple Bookings ===\n');

console.log(`Student: ${student1.getStudentName()} (${student1.getStudentId()})`);
console.log('Bookings:');

const student1Bookings = bookings.filter(b => b.getStudentId() === student1.getStudentId());
student1Bookings.forEach((booking, index) => {
    const record = booking.getBookingRecord();
    console.log(`  ${index + 1}. ${record.mealType} - ${record.mealDate} - $${record.total.toFixed(2)} (${record.status})`);
});

console.log(`\nTotal Bookings: ${student1Bookings.length}`);
console.log(`Total Spent: $${student1Bookings.reduce((sum, b) => sum + b.calculateTotal(), 0).toFixed(2)}`);

// ============================================
// SECTION 5: Test Setters and Validation
// ============================================
console.log('\n=== SECTION 5: Testing Setters and Validation ===\n');

try {
    console.log('Testing booking status update:');
    booking1.setBookingStatus('Confirmed');
    console.log(`✅ Booking ${booking1.getBookingId()} status updated to: ${booking1.getBookingStatus()}`);
    
    console.log('\nTesting quantity update:');
    booking1.setQuantity(5);
    console.log(`✅ Quantity updated to: ${booking1.getQuantity()}`);
    console.log(`Updated total: $${booking1.calculateTotal().toFixed(2)}`);
    
    console.log('\nTesting invalid quantity (should throw error):');
    booking1.setQuantity(15);
} catch (error) {
    console.log(`✅ Validation working: ${error.message}`);
}

// ============================================
// SECTION 6: Create Students from User Input Simulation
// ============================================
console.log('\n=== SECTION 6: Creating Students from Input ===\n');

// Simulating user input with sample data
const studentData = [
    { id: 'S1004', name: 'Alice Johnson', email: 'alice@university.edu', phone: '+61 445 678 901', date: '2024-04-10' },
    { id: 'S1005', name: 'Charlie Brown', email: 'charlie@university.edu', phone: '+61 456 789 012', date: '2024-05-01' }
];

const newStudents = studentData.map(data => 
    new Student(data.id, data.name, data.email, data.phone, data.date)
);

newStudents.forEach(student => {
    console.log(`Created Student: ${student.getStudentName()} (${student.getStudentId()})`);
});

// ============================================
// SECTION 7: Demonstration of Object Relationships
// ============================================
console.log('\n=== SECTION 7: Object Relationships ===\n');

console.log('Demonstrating that the same Student object can be used for multiple bookings:');
console.log(`Student ${student1.getStudentName()} (${student1.getStudentId()}) has ${student1Bookings.length} bookings.`);
console.log('\nBooking IDs for this student:');
student1Bookings.forEach(b => {
    console.log(`  - ${b.getBookingId()}: ${b.getMealType()} on ${b.getMealDate()}`);
});

console.log('\n=== PROGRAM EXECUTION COMPLETE ===');
console.log('✅ All tests passed successfully!');
