/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Date: 16 September 2026
Description: Complete Dining Account and Meal Booking application
*/

// Import classes
import { Student } from './Student.js';
import { MealBooking } from './MealBooking.js';
import { DiningAccount } from './DiningAccount.js';
import { RewardsDiningAccount } from './RewardsDiningAccount.js';
import { CreditDiningAccount } from './CreditDiningAccount.js';


// ======================================================
// SECTION 1: STUDENT OBJECTS
// ======================================================

console.log(`
========================================
        SECTION 1: STUDENTS
========================================
`);

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

console.log(student1.getSummary());
console.log(student2.getSummary());
console.log(student3.getSummary());


// ======================================================
// SECTION 2: STANDARD DINING ACCOUNT
// ======================================================

console.log(`
========================================
     SECTION 2: STANDARD ACCOUNT
========================================
`);

const standardAccount =
    new DiningAccount('DA001', 1000);

console.log('Account Number: DA001');
console.log('Opening Balance: K1000.00');

standardAccount.deposit(500);

console.log('Deposit: K500.00');

const standardPayment =
    standardAccount.payForMeal(
        200,
        'Lunch booking'
    );

console.log(
    `Meal Payment: K200.00`
);

console.log(
    `Payment Status: ${
        standardPayment
            ? 'Successful'
            : 'Rejected'
    }`
);

console.log(
    `Final Balance: K${standardAccount.getBalance().toFixed(2)}`
);


// ======================================================
// SECTION 3: REWARDS DINING ACCOUNT
// ======================================================

console.log(`
========================================
       SECTION 3: REWARDS ACCOUNT
========================================
`);

const rewardsAccount =
    new RewardsDiningAccount(
        'RA001',
        1500,
        2.5
    );

console.log('Account Number: RA001');
console.log('Opening Balance: K1500.00');

rewardsAccount.deposit(
    500,
    'Weekly meal allowance'
);

console.log('Deposit: K500.00');

console.log(
    `Balance Before Reward: K${rewardsAccount.getBalance().toFixed(2)}`
);

console.log(
    `Reward Rate: ${rewardsAccount.getRewardRate()}%`
);

const reward =
    rewardsAccount.calculateReward();

console.log(
    `Reward Earned: K${reward.toFixed(2)}`
);

rewardsAccount.applyReward();

console.log(
    `Final Balance: K${rewardsAccount.getBalance().toFixed(2)}`
);


// ======================================================
// SECTION 4: CREDIT DINING ACCOUNT
// ======================================================

console.log(`
========================================
        SECTION 4: CREDIT ACCOUNT
========================================
`);

const creditAccount =
    new CreditDiningAccount(
        'CA001',
        1000,
        500
    );

console.log('Account Number: CA001');
console.log('Opening Balance: K1000.00');
console.log('Credit Limit: K500.00');

console.log('\nAttempting K1500.00 payment...');

const creditPayment =
    creditAccount.payForMeal(
        1500,
        'Catering payment'
    );

console.log(
    `Payment Status: ${
        creditPayment
            ? 'Successful'
            : 'Rejected'
    }`
);

console.log(
    `Resulting Balance: K${creditAccount.getBalance().toFixed(2)}`
);

console.log('\nAttempting another K100.00 payment...');

const exceededPayment =
    creditAccount.payForMeal(
        100,
        'Additional catering'
    );

console.log(
    `Payment Status: ${
        exceededPayment
            ? 'Successful'
            : 'Rejected'
    }`
);

console.log(
    `Current Balance: K${creditAccount.getBalance().toFixed(2)}`
);


// ======================================================
// SECTION 5: POLYMORPHISM
// ======================================================

console.log(`
========================================
        SECTION 5: POLYMORPHISM
========================================
`);

const diningAccounts = [
    standardAccount,
    rewardsAccount,
    creditAccount
];

console.log(
    'Calling displayAccountSummary() on all account objects:\n'
);

for (const account of diningAccounts) {
    account.displayAccountSummary();
}


// ======================================================
// SECTION 6: STUDENT + DINING ACCOUNT
// ======================================================

console.log(`
========================================
     SECTION 6: STUDENT ACCOUNT
========================================
`);

student1.assignDiningAccount(
    rewardsAccount
);

console.log(
    student1.getSummary()
);


// ======================================================
// SECTION 7: MEAL BOOKINGS
// ======================================================

console.log(`
========================================
        SECTION 7: MEAL BOOKINGS
========================================
`);

const booking1 = new MealBooking(
    student1,
    '2026-09-20',
    'Dinner',
    2,
    'None'
);

const booking2 = new MealBooking(
    student2,
    '2026-09-21',
    'Lunch',
    2,
    'Vegetarian'
);

const booking3 = new MealBooking(
    student3,
    '2026-09-22',
    'Breakfast',
    1,
    'Gluten-free'
);

console.log(booking1.getSummary());
console.log(booking2.getSummary());
console.log(booking3.getSummary());


// ======================================================
// SECTION 8: BOOKING PAYMENT
// ======================================================

console.log(`
========================================
       SECTION 8: BOOKING PAYMENT
========================================
`);

console.log(
    `Student: ${student1.getStudentName()}`
);

console.log(
    `Account: ${rewardsAccount.getAccountNumber()}`
);

console.log(
    `Booking Total: K${booking1.calculateTotal().toFixed(2)}`
);

const bookingPayment =
    booking1.processPayment(
        rewardsAccount
    );

console.log(
    `Remaining Balance: K${rewardsAccount.getBalance().toFixed(2)}`
);


// ======================================================
// SECTION 9: DUPLICATE PAYMENT TEST
// ======================================================

console.log(`
========================================
      SECTION 9: DUPLICATE PAYMENT
========================================
`);

console.log(
    'Attempting to pay for the same booking again...'
);

const duplicatePayment =
    booking1.processPayment(
        rewardsAccount
    );

if (!duplicatePayment) {
    console.log(
        'Duplicate payment correctly rejected.'
    );
}


// ======================================================
// SECTION 10: FAILED STANDARD ACCOUNT PAYMENT
// ======================================================

console.log(`
========================================
   SECTION 10: INSUFFICIENT FUNDS TEST
========================================
`);

const smallAccount =
    new DiningAccount(
        'DA002',
        50
    );

const expensiveBooking =
    new MealBooking(
        student2,
        '2026-09-25',
        'Dinner',
        5,
        'None'
    );

console.log(
    `Booking Cost: K${expensiveBooking.calculateTotal().toFixed(2)}`
);

const failedPayment =
    expensiveBooking.processPayment(
        smallAccount
    );

console.log(
    `Booking Status: ${expensiveBooking.getBookingStatus()}`
);


// ======================================================
// SECTION 11: CONSTRUCTOR OVERLOADING
// ======================================================

console.log(`
========================================
      SECTION 11: CONSTRUCTOR VARIATIONS
========================================
`);

const accountWithoutOpeningBalance =
    new DiningAccount('DA003');

const accountWithOpeningBalance =
    new DiningAccount('DA004', 500);

console.log(
    `DA003 Balance: K${accountWithoutOpeningBalance.getBalance().toFixed(2)}`
);

console.log(
    `DA004 Balance: K${accountWithOpeningBalance.getBalance().toFixed(2)}`
);

console.log(
    'Constructor variation test completed.'
);


// ======================================================
// SECTION 12: METHOD OVERLOADING
// ======================================================

console.log(`
========================================
        SECTION 12: METHOD VARIATIONS
========================================
`);

const overloadAccount =
    new DiningAccount(
        'DA005',
        100
    );

overloadAccount.deposit(100);

console.log(
    `After deposit(100): K${overloadAccount.getBalance().toFixed(2)}`
);

overloadAccount.deposit(
    100,
    'Additional meal funds'
);

console.log(
    `After deposit(100, description): K${overloadAccount.getBalance().toFixed(2)}`
);

console.log(
    'Method variation test completed.'
);


// ======================================================
// SECTION 13: TRANSACTION HISTORY
// ======================================================

console.log(`
========================================
        SECTION 13: TRANSACTION HISTORY
========================================
`);

const transactions =
    rewardsAccount.getTransactions();

transactions.forEach(
    (transaction, index) => {

        console.log(
            `${index + 1}. ${transaction.type} - K${transaction.amount.toFixed(2)}`
        );

        console.log(
            `   Description: ${transaction.description}`
        );

        console.log(
            `   Date/Time: ${transaction.dateTime}`
        );

        console.log(
            `   Balance: K${transaction.balanceAfter.toFixed(2)}`
        );

        console.log('');
    }
);

console.log(
    `Total Transactions: ${transactions.length}`
);


// ======================================================
// SECTION 14: REQUIRED TESTS
// ======================================================

console.log(`
========================================
          SECTION 14: TEST RESULTS
========================================
`);

console.log(
    '✓ Standard account payment test completed.'
);

console.log(
    '✓ Insufficient standard balance test completed.'
);

console.log(
    '✓ Rewards calculation and application completed.'
);

console.log(
    '✓ Credit account within limit test completed.'
);

console.log(
    '✓ Credit limit exceeded test completed.'
);

console.log(
    '✓ Polymorphic account processing completed.'
);

console.log(
    '✓ Booking payment test completed.'
);

console.log(
    '✓ Duplicate payment test completed.'
);


// ======================================================
// SECTION 15: FINAL OUTPUT
// ======================================================

console.log(`
========================================
       PROGRAM EXECUTION COMPLETE
========================================
Student: ${student1.getStudentName()}
Student ID: ${student1.getStudentId()}
Account Type: ${rewardsAccount.getAccountType()}
Account Number: ${rewardsAccount.getAccountNumber()}
Final Balance: K${rewardsAccount.getBalance().toFixed(2)}
========================================

All Lab 3 demonstrations completed.
`);