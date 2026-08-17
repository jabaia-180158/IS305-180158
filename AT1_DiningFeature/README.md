# Dining Meal Booking Feature - Lab 2 Extension

## Student Information
- **Student Name:** Joseph ABAIA
- **Student ID:** 180158
- **Date:** 17 August 2026
- **Unit:** IS305 - Web Development

## GitHub Repository
🔗 **Repository URL:** https://github.com/yourusername/IS305-180158
🔗 **Repository URL:** https://github.com/jabaia-180158/IS305-180158.git

## Program Description
This is a dining meal booking system that demonstrates object-oriented programming concepts in JavaScript. The application features:

- **Student Class**: Stores student identity information
- **MealBooking Class**: Stores meal booking information linked to a Student
- **Object Relationships**: Student objects can be connected to multiple MealBooking objects
- **Encapsulation**: Private fields with getters and setters
- **Validation**: Input validation with error handling

## Files Included

| File | Purpose |
|------|---------|
| `Student.js` | Defines the Student class with private fields, constructor, getters, setters, and summary methods |
| `MealBooking.js` | Defines the MealBooking class, updated to work with Student objects |
| `DiningApp.js` | Main application demonstrating Student and MealBooking objects working together |
| `README.md` | Project documentation with setup instructions |

## Key Features Added in Lab 2
- ✅ Separate Student class for identity management
- ✅ MealBooking now stores a Student object instead of separate ID and name
- ✅ Multiple bookings can be linked to the same Student
- ✅ Unique Booking ID generation
- ✅ Student email and phone number validation
- ✅ Demonstration of object relationships and arrays

## How to Run the Program

### Prerequisites
- Node.js (v14 or higher)
- Git (for cloning)

### Installation & Running
```bash
# Clone the repository
git clone https://github.com/yourusername/IS305-180158.git

# Navigate to project
cd IS305-180158/AT1_DiningFeature

# Run the program
node DiningApp.js
