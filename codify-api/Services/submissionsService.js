import { postgres } from "../deps.js";

const sql = postgres({});

// Simple in-memory queue for submissions
const submissionQueue = [];
let isProcessing = false;

const getSubmission = async (id) => {
  const submissions = await sql`
    SELECT * FROM programming_assignment_submissions 
    WHERE id = ${id}
  `;
  return submissions[0];
};

const hasPendingSubmission = async (user_uuid) => {
  const pending = await sql`
    SELECT COUNT(*) as count 
    FROM programming_assignment_submissions 
    WHERE user_uuid = ${user_uuid} 
    AND status = 'pending'
  `;
  return pending[0].count > 0;
};

const getUserPoints = async (user_uuid) => {
  const points = await sql`
    WITH unique_correct_submissions AS (
      SELECT DISTINCT programming_assignment_id
      FROM programming_assignment_submissions
      WHERE user_uuid = ${user_uuid}
      AND correct = true
    )
    SELECT COUNT(*) * 100 as total_points
    FROM unique_correct_submissions
  `;
  return points[0].total_points;
};

const addSubmission = async (programming_assignment_id, code, user_uuid) => {
  // Check if user has pending submission
  const isPending = await hasPendingSubmission(user_uuid);
  if (isPending) {
    throw new Error("User already has a submission being graded");
  }

  // Check for existing submission with same code
  const existingSubmission = await sql`
    SELECT * FROM programming_assignment_submissions 
    WHERE programming_assignment_id = ${programming_assignment_id} 
    AND code = ${code}
    AND status = 'processed'
    LIMIT 1
  `;

  if (existingSubmission.length > 0) {
    // Copy existing submission results
    const submission = await sql`
      INSERT INTO programming_assignment_submissions 
      (programming_assignment_id, code, user_uuid, status, grader_feedback, correct) 
      VALUES (
        ${programming_assignment_id}, 
        ${code}, 
        ${user_uuid}, 
        'processed',
        ${existingSubmission[0].grader_feedback}, 
        ${existingSubmission[0].correct}
      ) 
      RETURNING *
    `;
    return submission[0];
  }

  // Create new submission
  const submission = await sql`
    INSERT INTO programming_assignment_submissions 
    (programming_assignment_id, code, user_uuid) 
    VALUES (${programming_assignment_id}, ${code}, ${user_uuid}) 
    RETURNING *
  `;

  // Add to processing queue
  submissionQueue.push(submission[0]);
  processQueue();

  return submission[0];
};

const updateSubmission = async (id, status, grader_feedback, correct) => {
  return await sql`
    UPDATE programming_assignment_submissions 
    SET 
      status = ${status}::SUBMISSION_STATUS, 
      grader_feedback = ${grader_feedback}, 
      correct = ${correct},
      last_updated = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
};

const deleteSubmission = async (id) => {
  return await sql`
    DELETE FROM programming_assignment_submissions 
    WHERE id = ${id}
    RETURNING *
  `;
};

const processQueue = async () => {
  if (isProcessing || submissionQueue.length === 0) return;
  
  isProcessing = true;
  const submission = submissionQueue.shift();

  try {
    // TODO: Implement actual grading logic
    const result = await mockGradeSubmission(submission);
    
    await updateSubmission(
      submission.id,
      'processed',
      result.feedback,
      result.correct
    );
  } catch (error) {
    console.error('Grading error:', error);
  } finally {
    isProcessing = false;
    processQueue(); // Process next in queue
  }
};

// Mock grading function - replace with actual grading logic
const mockGradeSubmission = async (submission) => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
  return {
    feedback: "Test feedback",
    correct: Math.random() > 0.5
  };
};

const getUserSubmissions = async (user_uuid, programming_assignment_id) => {
  return await sql`
    SELECT * FROM programming_assignment_submissions 
    WHERE user_uuid = ${user_uuid} 
    AND programming_assignment_id = ${programming_assignment_id} 
    ORDER BY last_updated DESC
  `;
};

const seedSubmissions = async () => {
  const sampleSubmissions = [
    {
      programming_assignment_id: 1,
      code: "let x = 10;",
      user_uuid: "test-user-1",
      status: "processed",
      grader_feedback: "Good work!",
      correct: true
    },
    {
      programming_assignment_id: 1,
      code: "var x;",
      user_uuid: "test-user-2",
      status: "processed",
      grader_feedback: "Variable needs to be initialized",
      correct: false
    },
    {
      programming_assignment_id: 2,
      code: "function add(a,b) { return a + b; }",
      user_uuid: "test-user-1",
      status: "processed",
      grader_feedback: "Perfect implementation",
      correct: true
    }
  ];

  const results = [];
  for (const submission of sampleSubmissions) {
    const result = await sql`
      INSERT INTO programming_assignment_submissions
      (programming_assignment_id, code, user_uuid, status, grader_feedback, correct)
      VALUES (
        ${submission.programming_assignment_id}, 
        ${submission.code},
        ${submission.user_uuid},
        ${submission.status}::SUBMISSION_STATUS,
        ${submission.grader_feedback},
        ${submission.correct}
      )
      RETURNING *
    `;
    results.push(result[0]);
  }
  return results;
};

export { 
  getSubmission, 
  addSubmission, 
  updateSubmission,
  deleteSubmission,
  getUserSubmissions,
  getUserPoints,
  seedSubmissions
};

