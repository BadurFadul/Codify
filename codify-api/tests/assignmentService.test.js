import { assertEquals, assertRejects } from "jsr:@std/assert";
import { NotFoundError, ValidationError, ConflictError } from "../errors.js";

// Test Data Setup
const mockAssignments = [
  {
    id: 1,
    title: "Test Assignment 1",
    assignment_order: 1,
    handout: "Test handout 1",
    test_code: "Test code 1"
  },
  {
    id: 2,
    title: "Test Assignment 2",
    assignment_order: 2,
    handout: "Test handout 2",
    test_code: "Test code 2"
  }
];

const mockDb = {
  assignments: [...mockAssignments]
};

// Reset helper
const resetDb = () => {
  mockDb.assignments = [...mockAssignments];
};

// Service implementation remains the same
const assignmentsService = {
  getAssignment: async (id) => {
    if (!id) {
      throw new ValidationError("Assignment ID is required");
    }
    if (isNaN(Number(id))) {
      throw new ValidationError("Assignment ID must be a number");
    }
    const assignment = mockDb.assignments.find(a => a.id === Number(id));
    if (!assignment) {
      throw new NotFoundError(`Assignment with ID ${id} not found`);
    }
    return assignment;
  },

  getAssignments: async () => {
    return mockDb.assignments.sort((a, b) => a.assignment_order - b.assignment_order);
  },

  addAssignment: async (title, order, handout = "", testCode = "") => {
    // Enhanced validation
    if (!title?.trim()) {
      throw new ValidationError("Title is required and cannot be empty");
    }
    if (!order && order !== 0) {
      throw new ValidationError("Assignment order is required");
    }
    if (typeof order !== 'number' || order < 0) {
      throw new ValidationError("Assignment order must be a non-negative number");
    }

    const existingOrder = mockDb.assignments.find(a => a.assignment_order === order);
    if (existingOrder) {
      throw new ConflictError("An assignment with this order already exists");
    }

    const newAssignment = {
      id: mockDb.assignments.length ? Math.max(...mockDb.assignments.map(a => a.id)) + 1 : 1,
      title: title.trim(),
      assignment_order: order,
      handout: handout?.trim() ?? "",
      test_code: testCode?.trim() ?? ""
    };
    mockDb.assignments.push(newAssignment);
    return newAssignment;
  },

  updateAssignment: async (id, title, order, handout, testCode) => {
    if (!id || isNaN(Number(id))) {
      throw new ValidationError("Valid assignment ID is required");
    }

    const index = mockDb.assignments.findIndex(a => a.id === Number(id));
    if (index === -1) {
      throw new NotFoundError(`Assignment with ID ${id} not found`);
    }

    // Check for duplicate order only if it's different from current
    if (order !== undefined && 
        order !== mockDb.assignments[index].assignment_order && 
        mockDb.assignments.some(a => a.assignment_order === order)) {
      throw new ConflictError("An assignment with this order already exists");
    }

    mockDb.assignments[index] = {
      ...mockDb.assignments[index],
      title: title?.trim() ?? mockDb.assignments[index].title,
      assignment_order: order ?? mockDb.assignments[index].assignment_order,
      handout: handout?.trim() ?? mockDb.assignments[index].handout,
      test_code: testCode?.trim() ?? mockDb.assignments[index].test_code
    };
    return mockDb.assignments[index];
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

// 1. READ Tests
Deno.test("Assignment READ Operations", async (t) => {
  resetDb();

  await t.step("should get single assignment by id", async () => {
    const assignment = await assignmentsService.getAssignment(1);
    assertEquals(assignment, mockAssignments[0]);
  });

  await t.step("should get all assignments in order", async () => {
    const assignments = await assignmentsService.getAssignments();
    assertEquals(assignments, mockAssignments);
    
    for (let i = 1; i < assignments.length; i++) {
      assertEquals(
        assignments[i].assignment_order > assignments[i-1].assignment_order,
        true
      );
    }
  });

  await t.step("should handle non-existent assignment", async () => {
    await assertRejects(
      () => assignmentsService.getAssignment(999),
      NotFoundError,
      "Assignment with ID 999 not found"
    );
  });
});

// 2. CREATE Tests
Deno.test("Assignment CREATE Operations", async (t) => {
  resetDb();

  await t.step("should create new assignment with all fields", async () => {
    const newAssignment = await assignmentsService.addAssignment(
      "New Assignment",
      3,
      "New handout",
      "New test code"
    );
    
    assertEquals(newAssignment.title, "New Assignment");
    assertEquals(newAssignment.assignment_order, 3);
    assertEquals(mockDb.assignments.length, 3);
  });

  await t.step("should reject duplicate order", async () => {
    await assertRejects(
      () => assignmentsService.addAssignment("Test", 1),
      ConflictError,
      "An assignment with this order already exists"
    );
  });

  await t.step("should validate required fields", async () => {
    await assertRejects(
      () => assignmentsService.addAssignment("", 1),
      ValidationError,
      "Title is required and cannot be empty"
    );
  });
});

// 3. UPDATE Tests
Deno.test("Assignment UPDATE Operations", async (t) => {
  resetDb();

  await t.step("should update existing assignment", async () => {
    resetDb();
    const updated = await assignmentsService.updateAssignment(
      1,
      "Updated Title",
      3,
      "Updated handout",
      "Updated test code"
    );
    
    assertEquals(updated.title, "Updated Title");
    assertEquals(updated.assignment_order, 3);
  });

  await t.step("should allow partial updates", async () => {
    resetDb();
    const updated = await assignmentsService.updateAssignment(1, "Updated Title");
    assertEquals(updated.title, "Updated Title");
    assertEquals(updated.assignment_order, mockAssignments[0].assignment_order);
  });

  await t.step("should prevent order conflicts", async () => {
    await assertRejects(
      () => assignmentsService.updateAssignment(1, "Title", 2),
      ConflictError,
      "An assignment with this order already exists"
    );
  });
});

// 4. DELETE Tests
Deno.test("Assignment DELETE Operations", async (t) => {
  resetDb();

  await t.step("should delete existing assignment", async () => {
    const initialLength = mockDb.assignments.length;
    const deleted = await assignmentsService.deleteAssignment(1);
    
    assertEquals(deleted.id, 1);
    assertEquals(mockDb.assignments.length, initialLength - 1);
    assertEquals(mockDb.assignments.find(a => a.id === 1), undefined);
  });

  await t.step("should handle non-existent assignment", async () => {
    await assertRejects(
      () => assignmentsService.deleteAssignment(999),
      NotFoundError,
      "Assignment with ID 999 not found"
    );
  });

  await t.step("should validate assignment ID", async () => {
    await assertRejects(
      () => assignmentsService.deleteAssignment("abc"),
      ValidationError,
      "Valid assignment ID is required"
    );
  });
}); 