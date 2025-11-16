/**
 * Mini Project 1
 * Constructor Functions Version
 * This file recreates the plainObjects.js functionality using
 * constructor functions as required by the UML diagram.
 */

// ------------------------------------------------------------
// Assignment Constructor Function
// ------------------------------------------------------------
// Represents an Assignment with a title and a due date.
function Assignment(title, dueDate) {
    this.title = title;      // String
    this.dueDate = dueDate;  // String

    // Method: prints assignment information
    this.printAssignment = function () {
        console.log('   Title: ' + this.title + ' | Due Date: ' + this.dueDate);
    };
}

// ------------------------------------------------------------
// Course Constructor Function
// ------------------------------------------------------------
// Represents a Course with name, instructor, credit hours,
// and an array of Assignment objects.
function Course(courseName, instructor, creditHours, assignments) {
    this.courseName = courseName;       // String
    this.instructor = instructor;       // String
    this.creditHours = creditHours;     // Number
    this.assignments = assignments;     // Assignment[]

    // Method: prints course details and all assignments
    this.courseInfo = function () {
        console.log(
            'Course: ' + this.courseName +
            ' | Instructor: ' + this.instructor +
            ' | Credit Hours: ' + this.creditHours
        );

        console.log('Assignments >>>');

        // Loops through assignments and print each one
        for (let a of this.assignments) {
            a.printAssignment();
        }
    };
}

// ------------------------------------------------------------
// Creates Assignment objects (matching plainObjects.js exactly)
// ------------------------------------------------------------
let a1 = new Assignment('Project Proposal', 'Jan 15');
let a2 = new Assignment('Midterm Report', 'Feb 20');
let a3 = new Assignment('Final Report', 'Mar 30');
let a4 = new Assignment('Presentation', 'Apr 10');

// ------------------------------------------------------------
// Creates Course objects (matching plainObjects.js exactly)
// ------------------------------------------------------------
let c1 = new Course('Software Engineering', 'Dr. Pepper', 3, [a1, a2]);
let c2 = new Course('Data Science', 'Dr. Evil', 6, [a3, a4]);

// ------------------------------------------------------------
// Output (matching plainObjects.js exactly)
// ------------------------------------------------------------
c1.courseInfo();
c2.courseInfo();

