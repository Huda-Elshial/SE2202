/**
 * Mini Project 1
 * Class Notation 
 * This file recreates the plainObjects.js functionality using
 * class implementation as required by the UML diagram.
 */

// ------------------------------------------------------------
// Assignment Class
// ------------------------------------------------------------
// Represents an assignment with a title and due date.
class Assignment {
    constructor(title, dueDate) {
        this.title = title;        // String
        this.dueDate = dueDate;    // String
    }

    // Method: prints assignment info
    printAssignment() {
        console.log('   Title: ' + this.title + ' | Due Date: ' + this.dueDate);
    }
}

// ------------------------------------------------------------
// Course Class
// ------------------------------------------------------------
// Represents a course with courseName, instructor, creditHours,
// and an array of Assignment objects.
class Course {
    constructor(courseName, instructor, creditHours, assignments) {
        this.courseName = courseName;     // String
        this.instructor = instructor;     // String
        this.creditHours = creditHours;   // Number
        this.assignments = assignments;   // Assignment[]
    }

    // Method: prints course info and its assignments
    courseInfo() {
        console.log(
            'Course: ' + this.courseName +
            ' | Instructor: ' + this.instructor +
            ' | Credit Hours: ' + this.creditHours
        );

        console.log('Assignments >>>');

        // Loops through assignments
        for (let a of this.assignments) {
            a.printAssignment();
        }
    }
}

// ------------------------------------------------------------
// Creates Assignment objects (same output as plainObjects.js)
// ------------------------------------------------------------
let a1 = new Assignment('Project Proposal', 'Jan 15');
let a2 = new Assignment('Midterm Report', 'Feb 20');
let a3 = new Assignment('Final Report', 'Mar 30');
let a4 = new Assignment('Presentation', 'Apr 10');

// ------------------------------------------------------------
// Creates Course objects (same output as plainObjects.js)
// ------------------------------------------------------------
let c1 = new Course('Software Engineering', 'Dr. Pepper', 3, [a1, a2]);
let c2 = new Course('Data Science', 'Dr. Evil', 6, [a3, a4]);

// ------------------------------------------------------------
// Output
// ------------------------------------------------------------
c1.courseInfo();
c2.courseInfo();

