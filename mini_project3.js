// Mini Project 3: Assignment Manager
// Implements Assignment, Student, Observer, and ClassList with async behaviors

// Assignment Class: Represents a single assignment with name, status, and private grade
class Assignment {
  // Private field for grade (not directly accessible from outside)
  #grade = null;
  
  // Constructor: Initialize assignment with name and optional status (default: 'released')
  constructor(name, status = 'released'){
    // Store the assignment name
    this.assignmentName = name;
    // Store the current status (released, working, submitted, Pass, Fail, final reminder)
    this.status = status;
  }

  // setGrade: Set the grade and update status to Pass/Fail based on threshold (50)
  setGrade(g){
    // Convert input to number
    const n = Number(g);
    // Return early if conversion resulted in NaN
    if(Number.isNaN(n)) return;
    // Store the grade in private field
    this.#grade = n;
    // Set status to 'Pass' if grade > 50, otherwise 'Fail'
    this.status = (n > 50) ? 'Pass' : 'Fail';
  }

  // getGrade: Return the private grade value
  getGrade(){
    // Return the stored grade (or null if not set)
    return this.#grade;
  }
}

// Observer Class: Implements observer pattern to notify about status changes
class Observer {
  // notify: Print notification based on student name, assignment name, and status
  notify(student, assignmentName, status){
    // Handle different status types with appropriate messages
    if(status === 'released'){
      // Notification when assignment is released to student
      console.log(`Observer → ${student.fullName}, ${assignmentName} has been released.`);
    } else if(status === 'working'){
      // Notification when student starts working on assignment
      console.log(`Observer → ${student.fullName} is working on ${assignmentName}.`);
    } else if(status === 'submitted'){
      // Notification when student submits assignment
      console.log(`Observer → ${student.fullName} has submitted ${assignmentName}.`);
    } else if(status === 'final reminder'){
      // Notification when final reminder is sent to student
      console.log(`Observer → ${student.fullName}, final reminder for ${assignmentName}.`);
    } else if(status === 'Pass'){
      // Notification when grade indicates pass (> 50)
      console.log(`Observer → ${student.fullName} has passed ${assignmentName}`);
    } else if(status === 'Fail'){
      // Notification when grade indicates fail (<= 50)
      console.log(`Observer → ${student.fullName} has failed ${assignmentName}`);
    } else {
      // Generic fallback for any other status
      console.log(`Observer → ${student.fullName}, ${assignmentName} status: ${status}`);
    }
  }
}

// Student Class: Represents a student with name, email, and assignment tracking
class Student {
  // Constructor: Initialize student with name, email, and observer reference
  constructor(fullName, email, observer){
    // Store student full name
    this.fullName = fullName;
    // Store student email
    this.email = email;
    // Initialize array to store Assignment objects for this student
    this.assignmentStatuses = [];
    // Store reference to observer for notifications
    this.observer = observer;
  }

  // setFullName: Update student's full name
  setFullName(name){ 
    // Assign new name
    this.fullName = name; 
  }
  
  // setEmail: Update student's email
  setEmail(email){ 
    // Assign new email
    this.email = email; 
  }

  // _findAssignment: Private helper to find an assignment by name in the student's list
  _findAssignment(name){
    // Search for assignment matching the name, return null if not found
    return this.assignmentStatuses.find(a => a.assignmentName === name) || null;
  }

  // updateAssignmentStatus: Add or update an assignment; optionally set grade
  updateAssignmentStatus(name, grade){
    // Try to find existing assignment
    let a = this._findAssignment(name);
    // If assignment doesn't exist, create and add it
    if(!a){
      // Create new Assignment with 'released' status
      a = new Assignment(name, 'released');
      // Add to student's assignment list
      this.assignmentStatuses.push(a);
      // Notify observer of release if observer exists
      if(this.observer) this.observer.notify(this, name, 'released');
    }
    // If grade parameter was provided, set the grade
    if(typeof grade !== 'undefined'){
      // Call setGrade which updates status to Pass/Fail
      a.setGrade(grade);
      // Notify observer of new status (Pass/Fail)
      if(this.observer) this.observer.notify(this, name, a.status);
    }
    // Return the assignment object
    return a;
  }

  // getAssignmentStatus: Retrieve status of a specific assignment
  getAssignmentStatus(name){
    // Try to find the assignment
    const a = this._findAssignment(name);
    // If not found, return "Hasn't been assigned"
    if(!a) return `Hasn't been assigned`;
    // If Pass status, return it
    if(a.status === 'Pass') return 'Pass';
    // If Fail status, return it
    if(a.status === 'Fail') return 'Fail';
    // Otherwise return current status (released, working, submitted, etc.)
    return a.status;
  }

  // startWorking: Async method to mark assignment as working, wait 500ms, then auto-submit
  async startWorking(name){
    // Get or create assignment and mark as working
    const a = this.updateAssignmentStatus(name);
    // Change status to 'working'
    a.status = 'working';
    // Notify observer that student is working
    if(this.observer) this.observer.notify(this, name, 'working');

    // Wait 500ms asynchronously to allow reminders to interrupt
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if status changed (e.g., reminder sent, already submitted, graded)
    if(a.status === 'final reminder' || a.status === 'submitted' || a.status === 'Pass' || a.status === 'Fail'){
      // If so, don't auto-submit (let other logic handle it)
      return;
    }
    // Otherwise, auto-submit the assignment
    this.submitAssignment(name);
  }

  // submitAssignment: Submit an assignment and schedule async grading
  submitAssignment(name){
    // Try to find existing assignment
    const a = this._findAssignment(name);
    // If assignment doesn't exist, create one
    if(!a){
      // Create new assignment in 'submitted' status
      const na = new Assignment(name, 'submitted');
      // Add to student's list
      this.assignmentStatuses.push(na);
      // Notify observer of submission
      if(this.observer) this.observer.notify(this, name, 'submitted');
      // Schedule grading after 500ms (async, won't block)
      setTimeout(() => {
        // Generate random grade from 0 to 100
        const g = Math.floor(Math.random()*101);
        // Set grade (will update status to Pass/Fail)
        na.setGrade(g);
        // Notify observer of final grade
        if(this.observer) this.observer.notify(this, name, na.status);
      }, 500);
      // Return early
      return;
    }
    // If already submitted or graded, don't resubmit
    if(a.status === 'submitted' || a.status === 'Pass' || a.status === 'Fail') return;
    // Mark assignment as submitted
    a.status = 'submitted';
    // Notify observer of submission
    if(this.observer) this.observer.notify(this, name, 'submitted');
    // Schedule grading after 500ms (async)
    setTimeout(() => {
      // Generate random grade from 0 to 100
      const g = Math.floor(Math.random()*101);
      // Set grade (updates status to Pass/Fail)
      a.setGrade(g);
      // Notify observer of final grade result
      if(this.observer) this.observer.notify(this, name, a.status);
    }, 500);
  }

  // getGrade: Calculate and return average grade across all graded assignments
  getGrade(){
    // Get all grades from assignments and filter out nulls/NaNs
    const graded = this.assignmentStatuses.map(a => a.getGrade()).filter(g => typeof g === 'number' && !Number.isNaN(g));
    // If no graded assignments, return null
    if(graded.length === 0) return null;
    // Sum all grades
    const sum = graded.reduce((s,v)=>s+v,0);
    // Return average (sum divided by count)
    return sum / graded.length;
  }
}

// ClassList Class: Manages collection of students and assignments
class ClassList {
  // Constructor: Initialize classlist with students array and observer reference
  constructor(observer){
    // Initialize empty array to store Student objects
    this.students = [];
    // Store reference to observer for notifications
    this.observer = observer;
  }

  // addStudent: Add a new student to the classlist
  addStudent(student){
    // Push student to array
    this.students.push(student);
    // Print confirmation message (direct console.log as per requirements)
    console.log(`${student.fullName} has been added to the classlist.`);
  }

  // removeStudent: Remove a student from classlist by name
  removeStudent(name){
    // Find index of student with matching name
    const idx = this.students.findIndex(s => s.fullName === name);
    // If found, remove from array
    if(idx >= 0) this.students.splice(idx,1);
  }

  // findStudentByName: Search for a student by full name
  findStudentByName(name){
    // Find and return student, or null if not found
    return this.students.find(s => s.fullName === name) || null;
  }

  // findOutstandingAssignments: Find students who haven't completed an assignment
  findOutstandingAssignments(assignmentName){
    // Initialize array for results
    const out = [];
    // If specific assignment name provided
    if(assignmentName){
      // Iterate through all students
      for(const s of this.students){
        // Try to find assignment for this student
        const a = s._findAssignment ? s._findAssignment(assignmentName) : null;
        // If assignment not found, add student to outstanding
        if(!a) {
          out.push(s.fullName);
        } 
        // If assignment found but not yet submitted/graded, add to outstanding
        else if(a.status !== 'submitted' && a.status !== 'Pass' && a.status !== 'Fail'){
          out.push(s.fullName);
        }
      }
      // Return list of outstanding students
      return out;
    }
    // If no assignment name: return students with any released/working assignment
    for(const s of this.students){
      // Check if student has any assignment in progress
      const any = s.assignmentStatuses.some(a => a.status === 'released' || a.status === 'working' || a.status === 'final reminder');
      // If so, add to outstanding
      if(any) out.push(s.fullName);
    }
    // Return result
    return out;
  }

  // releaseAssignmentsParallel: Release multiple assignments to all students concurrently
  async releaseAssignmentsParallel(assignmentNames){
    // Initialize array for promises
    const promises = [];
    // For each assignment name
    for(const name of assignmentNames){
      // For each student in class
      for(const s of this.students){
        // Create a promise for releasing this assignment to this student
        const p = Promise.resolve().then(()=> s.updateAssignmentStatus(name));
        // Add promise to array
        promises.push(p);
      }
    }
    // Wait for all promises to complete (parallel execution)
    return Promise.all(promises);
  }

  // sendReminder: Send reminder to students who haven't completed an assignment
  sendReminder(assignmentName){
    // Iterate through all students
    for(const s of this.students){
      // Try to find assignment for this student
      const a = s._findAssignment ? s._findAssignment(assignmentName) : null;
      
      // If assignment not found, create it and send reminder
      if(!a){
        // Create the assignment for this student
        s.updateAssignmentStatus(assignmentName);
        // Get the newly created assignment
        const na = s._findAssignment(assignmentName);
        // Mark it with 'final reminder' status
        na.status = 'final reminder';
        // Notify observer about the reminder
        if(this.observer) this.observer.notify(s, assignmentName, 'final reminder');
        // Immediately submit the assignment
        s.submitAssignment(assignmentName);
      } 
      // If assignment found but not yet completed
      else if(a.status !== 'submitted' && a.status !== 'Pass' && a.status !== 'Fail'){
        // Mark status as 'final reminder'
        a.status = 'final reminder';
        // Notify observer of reminder
        if(this.observer) this.observer.notify(s, assignmentName, 'final reminder');
        // Immediately submit the assignment (interrupts startWorking if still waiting)
        s.submitAssignment(assignmentName);
      }
    }
  }
}

// Export classes for use in other modules/tests
if(typeof module !== 'undefined' && module.exports){
  // Make classes available for require() calls
  module.exports = { Assignment, Observer, Student, ClassList };
}

// === Example usage / test run when executed directly ===
// This code only runs if this file is executed directly (not imported)
if(require.main === module){
  // Define async main function for execution
  (async function main(){
    // Create observer instance for notifications
    const observer = new Observer();
    // Create classlist instance with observer
    const classList = new ClassList(observer);

    // Create first student (Alice)
    const s1 = new Student("Alice Smith", "alice@example.com", observer);
    // Create second student (Bob)
    const s2 = new Student("Bob Jones", "bob@example.com", observer);

    // Add Alice to classlist
    classList.addStudent(s1);
    // Add Bob to classlist
    classList.addStudent(s2);

    // Release assignments A1 and A2 to all students in parallel
    await classList.releaseAssignmentsParallel(["A1","A2"]);

    // Start Alice working on A1 (will auto-submit after 500ms unless reminded)
    s1.startWorking("A1");
    // Start Bob working on A2 (will auto-submit after 500ms)
    s2.startWorking("A2");

    // After 200ms, send reminder for A1 (interrupts Alice's 500ms wait)
    setTimeout(()=> classList.sendReminder("A1"), 200);

    // Wait enough time for all submissions and grading to complete (~2s total)
    await new Promise(r => setTimeout(r, 2200));

    // Print final results
    console.log(`\nFinal Grades:`);
    // For each student, display their average grade
    for(const s of [s1,s2]){
      console.log(`${s.fullName}: avg grade = ${s.getGrade()}`);
    }
  })();
}
