// Mini Project 3: Assignment Manager
// Implements Assignment, Student, Observer, and ClassList with async behaviors

class Assignment {
  #grade = null;
  constructor(name, status = 'released'){
    this.assignmentName = name;
    this.status = status;
  }

  setGrade(g){
    const n = Number(g);
    if(Number.isNaN(n)) return;
    this.#grade = n;
    // status should contain pass/fail based on threshold 50
    this.status = (n > 50) ? 'Pass' : 'Fail';
  }

  getGrade(){
    return this.#grade;
  }
}

class Observer {
  notify(student, assignmentName, status){
    // Format messages similar to the examples
    if(status === 'released'){
      console.log(`Observer → ${student.fullName}, ${assignmentName} has been released.`);
    } else if(status === 'working'){
      console.log(`Observer → ${student.fullName} is working on ${assignmentName}.`);
    } else if(status === 'submitted'){
      console.log(`Observer → ${student.fullName} has submitted ${assignmentName}.`);
    } else if(status === 'final reminder'){
      console.log(`Observer → ${student.fullName}, final reminder for ${assignmentName}.`);
    } else if(status === 'Pass'){
      console.log(`Observer → ${student.fullName} has passed ${assignmentName}`);
    } else if(status === 'Fail'){
      console.log(`Observer → ${student.fullName} has failed ${assignmentName}`);
    } else {
      // generic
      console.log(`Observer → ${student.fullName}, ${assignmentName} status: ${status}`);
    }
  }
}

class Student {
  constructor(fullName, email, observer){
    this.fullName = fullName;
    this.email = email;
    this.assignmentStatuses = []; // array of Assignment instances
    this.observer = observer;
  }

  setFullName(name){ this.fullName = name; }
  setEmail(email){ this.email = email; }

  _findAssignment(name){
    return this.assignmentStatuses.find(a => a.assignmentName === name) || null;
  }

  updateAssignmentStatus(name, grade){
    let a = this._findAssignment(name);
    if(!a){
      a = new Assignment(name, 'released');
      this.assignmentStatuses.push(a);
      if(this.observer) this.observer.notify(this, name, 'released');
    }
    if(typeof grade !== 'undefined'){
      a.setGrade(grade);
      if(this.observer) this.observer.notify(this, name, a.status);
    }
    return a;
  }

  getAssignmentStatus(name){
    const a = this._findAssignment(name);
    if(!a) return `Hasn't been assigned`;
    if(a.status === 'Pass') return 'Pass';
    if(a.status === 'Fail') return 'Fail';
    return a.status;
  }

  async startWorking(name){
    const a = this.updateAssignmentStatus(name);
    a.status = 'working';
    if(this.observer) this.observer.notify(this, name, 'working');

    // Wait 500ms asynchronously, but allow early submit via reminders
    await new Promise(resolve => setTimeout(resolve, 500));
    // If final reminder or already submitted or graded, do not double-submit
    if(a.status === 'final reminder' || a.status === 'submitted' || a.status === 'Pass' || a.status === 'Fail'){
      return;
    }
    // otherwise submit
    this.submitAssignment(name);
  }

  submitAssignment(name){
    const a = this._findAssignment(name);
    if(!a){
      // If not assigned, create and submit
      const na = new Assignment(name, 'submitted');
      this.assignmentStatuses.push(na);
      if(this.observer) this.observer.notify(this, name, 'submitted');
      // grade asynchronously
      setTimeout(() => {
        const g = Math.floor(Math.random()*101);
        na.setGrade(g);
        if(this.observer) this.observer.notify(this, name, na.status);
      }, 500);
      return;
    }
    // If already submitted/graded, ignore
    if(a.status === 'submitted' || a.status === 'Pass' || a.status === 'Fail') return;
    a.status = 'submitted';
    if(this.observer) this.observer.notify(this, name, 'submitted');
    setTimeout(() => {
      const g = Math.floor(Math.random()*101);
      a.setGrade(g);
      if(this.observer) this.observer.notify(this, name, a.status);
    }, 500);
  }

  getGrade(){
    const graded = this.assignmentStatuses.map(a => a.getGrade()).filter(g => typeof g === 'number' && !Number.isNaN(g));
    if(graded.length === 0) return null;
    const sum = graded.reduce((s,v)=>s+v,0);
    return sum / graded.length;
  }
}

class ClassList {
  constructor(observer){
    this.students = [];
    this.observer = observer;
  }

  addStudent(student){
    this.students.push(student);
    console.log(`${student.fullName} has been added to the classlist.`);
  }

  removeStudent(name){
    const idx = this.students.findIndex(s => s.fullName === name);
    if(idx >= 0) this.students.splice(idx,1);
  }

  findStudentByName(name){
    return this.students.find(s => s.fullName === name) || null;
  }

  findOutstandingAssignments(assignmentName){
    const out = [];
    if(assignmentName){
      for(const s of this.students){
        const a = s._findAssignment ? s._findAssignment(assignmentName) : null;
        if(!a) {
          out.push(s.fullName);
        } else if(a.status !== 'submitted' && a.status !== 'Pass' && a.status !== 'Fail'){
          out.push(s.fullName);
        }
      }
      return out;
    }
    // no assignmentName: return students who have any assignment that is released but not submitted
    for(const s of this.students){
      const any = s.assignmentStatuses.some(a => a.status === 'released' || a.status === 'working' || a.status === 'final reminder');
      if(any) out.push(s.fullName);
    }
    return out;
  }

  // release assignments in parallel to all students
  async releaseAssignmentsParallel(assignmentNames){
    const promises = [];
    for(const name of assignmentNames){
      for(const s of this.students){
        // wrap in Promise.resolve so we can use Promise.all
        const p = Promise.resolve().then(()=> s.updateAssignmentStatus(name));
        promises.push(p);
      }
    }
    return Promise.all(promises);
  }

  sendReminder(assignmentName){
    for(const s of this.students){
      const a = s._findAssignment ? s._findAssignment(assignmentName) : null;
      // if assignment not present or already finished, still treat as not completed
      if(!a){
        s.updateAssignmentStatus(assignmentName);
        const na = s._findAssignment(assignmentName);
        na.status = 'final reminder';
        if(this.observer) this.observer.notify(s, assignmentName, 'final reminder');
        // cause immediate submission
        s.submitAssignment(assignmentName);
      } else if(a.status !== 'submitted' && a.status !== 'Pass' && a.status !== 'Fail'){
        a.status = 'final reminder';
        if(this.observer) this.observer.notify(s, assignmentName, 'final reminder');
        s.submitAssignment(assignmentName);
      }
    }
  }
}

// Export classes for tests or usage
if(typeof module !== 'undefined' && module.exports){
  module.exports = { Assignment, Observer, Student, ClassList };
}

// === Example usage / test run when executed directly ===
if(require.main === module){
  (async function main(){
    const observer = new Observer();
    const classList = new ClassList(observer);

    const s1 = new Student("Alice Smith", "alice@example.com", observer);
    const s2 = new Student("Bob Jones", "bob@example.com", observer);

    classList.addStudent(s1);
    classList.addStudent(s2);

    // Release assignments in parallel and then start working
    await classList.releaseAssignmentsParallel(["A1","A2"]);

    // start working and send a reminder after 200ms for A1
    s1.startWorking("A1");
    s2.startWorking("A2");

    setTimeout(()=> classList.sendReminder("A1"), 200);

    // Wait enough time for submissions and grading to complete (approx 2s)
    await new Promise(r => setTimeout(r, 2200));

    // show final grades
    console.log(`\nFinal Grades:`);
    for(const s of [s1,s2]){
      console.log(`${s.fullName}: avg grade = ${s.getGrade()}`);
    }
  })();
}
