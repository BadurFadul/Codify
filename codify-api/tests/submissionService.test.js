import { assertEquals, assertRejects } from "jsr:@std/assert";
import { NotFoundError, ValidationError } from "../errors.js";

// Test Data Setup
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
  submissions: [...mockSubmissions]
};

// Reset helper
const resetDb = () => {
  mockDb.submissions = [...mockSubmissions];
};

// Service implementation
const submissionsService = {
  getSubmission: async (id) => {
    if (!id) {
      throw new ValidationError("Submission ID is required");
    }
    if (isNaN(Number(id))) {
      throw new ValidationError("Submission ID must be a number");
    }
    const submission = mockDb.submissions.find(s => s.id === Number(id));
    if (!submission) {
      throw new NotFoundError(`Submission with ID ${id} not found`);
    }
    return submission;
  },

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
    if (!assignmentId || isNaN(Number(assignmentId))) {
      throw new ValidationError("Valid assignment ID is required");
    }
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
  },

  updateSubmission: async (id, status, feedback) => {
    if (!id || isNaN(Number(id))) {
      throw new ValidationError("Valid submission ID is required");
    }

    const index = mockDb.submissions.findIndex(s => s.id === Number(id));
    if (index === -1) {
      throw new NotFoundError(`Submission with ID ${id} not found`);
    }

    if (status && !["submitted", "graded"].includes(status)) {
      throw new ValidationError("Invalid status value");
    }

    mockDb.submissions[index] = {
      ...mockDb.submissions[index],
      status: status ?? mockDb.submissions[index].status,
      feedback: feedback?.trim() ?? mockDb.submissions[index].feedback
    };
    
    return mockDb.submissions[index];
  },

  deleteSubmission: async (id) => {
    if (!id || isNaN(Number(id))) {
      throw new ValidationError("Valid submission ID is required");
    }

    const index = mockDb.submissions.findIndex(s => s.id === Number(id));
    if (index === -1) {
      throw new NotFoundError(`Submission with ID ${id} not found`);
    }

    const [deleted] = mockDb.submissions.splice(index, 1);
    return deleted;
  }
};

// 1. READ Tests
Deno.test("Submission READ Operations", async (t) => {
  resetDb();

  await t.step("should get single submission by id", async () => {
    const submission = await submissionsService.getSubmission(1);
    assertEquals(submission, mockSubmissions[0]);
  });

  await t.step("should get all submissions", async () => {
    const submissions = await submissionsService.getSubmissions();
    assertEquals(submissions.length, mockSubmissions.length);
  });

  await t.step("should filter submissions by assignment ID", async () => {
    const submissions = await submissionsService.getSubmissions(1);
    assertEquals(submissions.every(s => s.assignment_id === 1), true);
  });

  await t.step("should filter submissions by user ID", async () => {
    const submissions = await submissionsService.getSubmissions(null, "user1");
    assertEquals(submissions.every(s => s.user_id === "user1"), true);
  });

  await t.step("should handle non-existent submission", async () => {
    await assertRejects(
      () => submissionsService.getSubmission(999),
      NotFoundError,
      "Submission with ID 999 not found"
    );
  });
});

// 2. CREATE Tests
Deno.test("Submission CREATE Operations", async (t) => {
  resetDb();

  await t.step("should create new submission", async () => {
    const newSubmission = await submissionsService.addSubmission(
      1,
      "user3",
      "New submission code"
    );
    
    assertEquals(newSubmission.assignment_id, 1);
    assertEquals(newSubmission.user_id, "user3");
    assertEquals(newSubmission.status, "submitted");
    assertEquals(mockDb.submissions.length, 3);
  });

  await t.step("should validate required fields", async () => {
    await assertRejects(
      () => submissionsService.addSubmission(null, "user1", "code"),
      ValidationError,
      "Valid assignment ID is required"
    );

    await assertRejects(
      () => submissionsService.addSubmission(1, "", "code"),
      ValidationError,
      "User ID is required"
    );

    await assertRejects(
      () => submissionsService.addSubmission(1, "user1", ""),
      ValidationError,
      "Submission code is required"
    );
  });
});

// 3. UPDATE Tests
Deno.test("Submission UPDATE Operations", async (t) => {
  resetDb();

  await t.step("should update submission status and feedback", async () => {
    const updated = await submissionsService.updateSubmission(
      1,
      "graded",
      "Great work!"
    );
    
    assertEquals(updated.status, "graded");
    assertEquals(updated.feedback, "Great work!");
  });

  await t.step("should allow partial updates", async () => {
    resetDb();
    const updated = await submissionsService.updateSubmission(1, "graded");
    assertEquals(updated.status, "graded");
    assertEquals(updated.feedback, "");  // Original empty feedback
  });

  await t.step("should validate status value", async () => {
    await assertRejects(
      () => submissionsService.updateSubmission(1, "invalid_status"),
      ValidationError,
      "Invalid status value"
    );
  });
});

// 4. DELETE Tests
Deno.test("Submission DELETE Operations", async (t) => {
  resetDb();

  await t.step("should delete existing submission", async () => {
    const initialLength = mockDb.submissions.length;
    const deleted = await submissionsService.deleteSubmission(1);
    
    assertEquals(deleted.id, 1);
    assertEquals(mockDb.submissions.length, initialLength - 1);
    assertEquals(mockDb.submissions.find(s => s.id === 1), undefined);
  });

  await t.step("should handle non-existent submission", async () => {
    await assertRejects(
      () => submissionsService.deleteSubmission(999),
      NotFoundError,
      "Submission with ID 999 not found"
    );
  });

  await t.step("should validate submission ID", async () => {
    await assertRejects(
      () => submissionsService.deleteSubmission("abc"),
      ValidationError,
      "Valid submission ID is required"
    );
  });
}); 