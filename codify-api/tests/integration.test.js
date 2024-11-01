import { assertEquals, assertRejects } from "jsr:@std/assert";
import { NotFoundError, ValidationError } from "../errors.js";

// Mock Data Setup
const mockAssignments = [
  {
    id: 1,
    title: "Assignment 1",
    assignment_order: 1,
    handout: "Handout 1",
    test_code: "Test code 1"
  },
  {
    id: 2,
    title: "Assignment 2",
    assignment_order: 2,
    handout: "Handout 2",
    test_code: "Test code 2"
  }
];

const mockSubmissions = [
  {
    id: 1,
    assignment_id: 1,
    user_id: "user1",
    code: "Test submission code 1",
    status: "submitted",
    feedback: "",
    submitted_at: "2024-03-20T10:00:00Z"
  },
  {
    id: 2,
    assignment_id: 1,
    user_id: "user2",
    code: "Test submission code 2",
    status: "graded",
    feedback: "Good work!",
    submitted_at: "2024-03-20T11:00:00Z"
  }
];

const mockDb = {
  assignments: [...mockAssignments],
  submissions: [...mockSubmissions]
};

// Reset helper
const resetDb = () => {
  mockDb.assignments = [...mockAssignments];
  mockDb.submissions = [...mockSubmissions];
};

// Import services (mock implementations for testing)
const assignmentsService = {
  getAssignment: async (id) => {
    if (!id || isNaN(Number(id))) {
      throw new ValidationError("Valid assignment ID is required");
    }
    const assignment = mockDb.assignments.find(a => a.id === Number(id));
    if (!assignment) {
      throw new NotFoundError(`Assignment with ID ${id} not found`);
    }
    return assignment;
  },
  
  deleteAssignment: async (id) => {
    if (!id || isNaN(Number(id))) {
      throw new ValidationError("Valid assignment ID is required");
    }
    const index = mockDb.assignments.findIndex(a => a.id === Number(id));
    if (index === -1) {
      throw new NotFoundError(`Assignment with ID ${id} not found`);
    }
    const [deleted] = mockDb.assignments.splice(index, 1);
    return deleted;
  }
};

const submissionsService = {
  getSubmissions: async (assignmentId, userId) => {
    let submissions = [...mockDb.submissions];
    
    if (assignmentId) {
      submissions = submissions.filter(s => s.assignment_id === Number(assignmentId));
    }
    
    if (userId) {
      submissions = submissions.filter(s => s.user_id === userId);
    }
    
    return submissions.sort((a, b) => 
      new Date(b.submitted_at) - new Date(a.submitted_at)
    );
  },

  addSubmission: async (assignmentId, userId, code) => {
    // First verify assignment exists
    await assignmentsService.getAssignment(assignmentId);

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }
    if (!code?.trim()) {
      throw new ValidationError("Submission code is required");
    }

    const newSubmission = {
      id: mockDb.submissions.length ? Math.max(...mockDb.submissions.map(s => s.id)) + 1 : 1,
      assignment_id: Number(assignmentId),
      user_id: userId.trim(),
      code: code.trim(),
      status: "submitted",
      feedback: "",
      submitted_at: new Date().toISOString()
    };
    
    mockDb.submissions.push(newSubmission);
    return newSubmission;
  }
};

// Integration Tests
Deno.test("Assignment and Submission Integration", async (t) => {
  await t.step("should handle assignment deletion with existing submissions", async () => {
    resetDb();
    
    // Verify initial state
    const initialSubmissions = await submissionsService.getSubmissions(1);
    assertEquals(initialSubmissions.length, 2);
    
    // Delete assignment
    await assignmentsService.deleteAssignment(1);
    
    // Verify assignment is deleted
    await assertRejects(
      () => assignmentsService.getAssignment(1),
      NotFoundError,
      "Assignment with ID 1 not found"
    );
    
    // Verify can't submit to deleted assignment
    await assertRejects(
      () => submissionsService.addSubmission(1, "user3", "New code"),
      NotFoundError,
      "Assignment with ID 1 not found"
    );
  });

  await t.step("should handle multiple submissions for same assignment", async () => {
    resetDb();
    
    // Add multiple submissions for the same assignment
    const submission1 = await submissionsService.addSubmission(2, "user1", "Code 1");
    const submission2 = await submissionsService.addSubmission(2, "user1", "Code 2");
    
    // Get all submissions for assignment 2
    const submissions = await submissionsService.getSubmissions(2);
    assertEquals(submissions.length, 2);
    assertEquals(submissions[0].id, submission2.id); // Most recent first
    assertEquals(submissions[1].id, submission1.id);
  });

  await t.step("should handle submissions from multiple users for same assignment", async () => {
    resetDb();
    
    // Add submissions from different users
    await submissionsService.addSubmission(2, "user1", "Code from user1");
    await submissionsService.addSubmission(2, "user2", "Code from user2");
    
    // Get submissions for assignment 2, user1
    const user1Submissions = await submissionsService.getSubmissions(2, "user1");
    assertEquals(user1Submissions.length, 1);
    assertEquals(user1Submissions[0].user_id, "user1");
    
    // Get all submissions for assignment 2
    const allSubmissions = await submissionsService.getSubmissions(2);
    assertEquals(allSubmissions.length, 2);
  });

  await t.step("should validate assignment existence before submission", async () => {
    resetDb();
    
    // Try to submit to non-existent assignment
    await assertRejects(
      () => submissionsService.addSubmission(999, "user1", "Test code"),
      NotFoundError,
      "Assignment with ID 999 not found"
    );
  });
}); 