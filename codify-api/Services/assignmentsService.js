import { postgres } from "../deps.js";

const sql = postgres({});

const getAssignment = async (id) => {
  const assignments = await sql`
    SELECT * FROM programming_assignments 
    WHERE id = ${id}
  `;
  return assignments[0];
};

const getAssignments = async () => {
  return await sql`
    SELECT * FROM programming_assignments 
    ORDER BY assignment_order ASC
  `;
};

const addAssignment = async (title, assignment_order, handout, test_code) => {
  return await sql`
    INSERT INTO programming_assignments 
    (title, assignment_order, handout, test_code) 
    VALUES (${title}, ${assignment_order}, ${handout}, ${test_code})
    RETURNING *
  `;
};

const updateAssignment = async (id, title, assignment_order, handout, test_code) => {
  return await sql`
    UPDATE programming_assignments 
    SET 
      title = ${title}, 
      assignment_order = ${assignment_order}, 
      handout = ${handout}, 
      test_code = ${test_code} 
    WHERE id = ${id}
    RETURNING *
  `;
};

const deleteAssignment = async (id) => {
  return await sql`
    DELETE FROM programming_assignments 
    WHERE id = ${id}
    RETURNING *
  `;
};

export { 
  getAssignment, 
  getAssignments, 
  addAssignment, 
  updateAssignment, 
  deleteAssignment 
};