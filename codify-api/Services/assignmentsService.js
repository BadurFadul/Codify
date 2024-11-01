import { postgres } from "../deps.js";
import { NotFoundError, ValidationError, ConflictError } from "../errors.js";

const sql = postgres({});

const getAssignment = async (id) => {
  if (!id) {
    throw new ValidationError("Assignment ID is required");
  }

  const assignments = await sql`
    SELECT * FROM programming_assignments 
    WHERE id = ${id}
  `;

  if (!assignments.length) {
    throw new NotFoundError(`Assignment with ID ${id} not found`);
  }

  return assignments[0];
};

const getAssignments = async () => {
  return await sql`
    SELECT * FROM programming_assignments 
    ORDER BY assignment_order ASC
  `;
};

const addAssignment = async (title, assignment_order, handout, test_code) => {
  if (!title || !assignment_order) {
    throw new ValidationError("Title and assignment order are required");
  }

  try {
    return await sql`
      INSERT INTO programming_assignments 
      (title, assignment_order, handout, test_code) 
      VALUES (${title}, ${assignment_order}, ${handout}, ${test_code})
      RETURNING *
    `;
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new ConflictError('An assignment with this order already exists');
    }
    throw error;
  }
};

const updateAssignment = async (id, title, assignment_order, handout, test_code) => {
  if (!id) {
    throw new ValidationError("Assignment ID is required");
  }

  if (!title || !assignment_order) {
    throw new ValidationError("Title and assignment order are required");
  }

  const result = await sql`
    UPDATE programming_assignments 
    SET 
      title = ${title}, 
      assignment_order = ${assignment_order}, 
      handout = ${handout}, 
      test_code = ${test_code} 
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) {
    throw new NotFoundError(`Assignment with ID ${id} not found`);
  }

  return result[0];
};

const deleteAssignment = async (id) => {
  if (!id) {
    throw new ValidationError("Assignment ID is required");
  }

  const result = await sql`
    DELETE FROM programming_assignments 
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) {
    throw new NotFoundError(`Assignment with ID ${id} not found`);
  }

  return result[0];
};

export { 
  getAssignment, 
  getAssignments, 
  addAssignment, 
  updateAssignment, 
  deleteAssignment 
};