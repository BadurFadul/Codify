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

const seedAssignments = async () => {
  const sampleAssignments = [
    {
      title: "Introduction to Variables",
      assignment_order: 1,
      handout: "Learn about variables in programming",
      test_code: "test('variables exist', () => { expect(x).toBeDefined(); });"
    },
    {
      title: "Basic Functions",
      assignment_order: 2,
      handout: "Understanding functions and parameters",
      test_code: "test('function returns correctly', () => { expect(add(2,2)).toBe(4); });"
    },
    {
      title: "Loops and Arrays",
      assignment_order: 3,
      handout: "Working with loops and array manipulation",
      test_code: "test('array length', () => { expect(processArray([1,2,3])).toHaveLength(3); });"
    }
  ];

  const results = [];
  for (const assignment of sampleAssignments) {
    const result = await sql`
      INSERT INTO programming_assignments 
      (title, assignment_order, handout, test_code)
      VALUES (
        ${assignment.title}, 
        ${assignment.assignment_order}, 
        ${assignment.handout}, 
        ${assignment.test_code}
      )
      ON CONFLICT (assignment_order) DO UPDATE 
      SET title = EXCLUDED.title,
          handout = EXCLUDED.handout,
          test_code = EXCLUDED.test_code
      RETURNING *
    `;
    results.push(result[0]);
  }
  return results;
};

export { 
  getAssignment, 
  getAssignments, 
  addAssignment, 
  updateAssignment, 
  deleteAssignment,
  seedAssignments 
};