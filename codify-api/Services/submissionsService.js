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

const gradeSubmission = async (submission) => {
  const testCases = await sql`
    SELECT * FROM programming_assignment_test_cases 
    WHERE programming_assignment_id = ${submission.programming_assignment_id}
  `;
  
  let allTestsPassing = true;
  let feedbackMessages = [];
  
  for (const testCase of testCases) {
    try {
      // Create a safe evaluation context
      const userFunction = new Function('input', submission.code);
      const actualOutput = userFunction(testCase.input);
      const expectedOutput = JSON.parse(testCase.expected_output);
      
      // Compare results
      const testPassed = compareOutputs(actualOutput, expectedOutput);
      allTestsPassing = allTestsPassing && testPassed;
      
      feedbackMessages.push({
        testName: testCase.name,
        passed: testPassed,
        input: testCase.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        message: testPassed 
          ? 'Test passed!' 
          : `Test failed: Expected ${JSON.stringify(expectedOutput)} but got ${JSON.stringify(actualOutput)}`
      });
    } catch (error) {
      allTestsPassing = false;
      feedbackMessages.push({
        testName: testCase.name,
        passed: false,
        error: error.message,
        message: `Error executing test: ${error.message}`
      });
    }
  }
  
  const feedback = formatFeedback(feedbackMessages);
  
  return {
    feedback,
    correct: allTestsPassing
  };
};

const compareOutputs = (actual, expected) => {
  // Handle different types of comparisons
  if (typeof actual !== typeof expected) {
    return false;
  }
  
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return actual.every((val, idx) => compareOutputs(val, expected[idx]));
  }
  
  if (typeof actual === 'object' && actual !== null) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (actualKeys.length !== expectedKeys.length) return false;
    return actualKeys.every(key => compareOutputs(actual[key], expected[key]));
  }
  
  return actual === expected;
};

const formatFeedback = (feedbackMessages) => {
  return feedbackMessages.map(msg => {
    const status = msg.passed ? '✅' : '❌';
    const header = `${status} Test: ${msg.testName}`;
    
    if (msg.error) {
      return `${header}\nError: ${msg.error}`;
    }
    
    return `${header}
Input: ${JSON.stringify(msg.input)}
Expected: ${JSON.stringify(msg.expectedOutput)}
Actual: ${JSON.stringify(msg.actualOutput)}
${msg.message}
`;
  }).join('\n\n');
};

// Update processQueue to use new grading function
const processQueue = async () => {
  if (isProcessing || submissionQueue.length === 0) return;
  
  isProcessing = true;
  const submission = submissionQueue.shift();

  try {
    const result = await gradeSubmission(submission);
    
    await updateSubmission(
      submission.id,
      'processed',
      result.feedback,
      result.correct
    );
  } catch (error) {
    console.error('Grading error:', error);
    await updateSubmission(
      submission.id,
      'error',
      `Grading failed: ${error.message}`,
      false
    );
  } finally {
    isProcessing = false;
    processQueue();
  }
};

const getUserSubmissions = async (user_uuid, programming_assignment_id) => {
  return await sql`
    SELECT * FROM programming_assignment_submissions 
    WHERE user_uuid = ${user_uuid} 
    AND programming_assignment_id = ${programming_assignment_id} 
    ORDER BY last_updated DESC
  `;
};

export { 
  getSubmission, 
  addSubmission, 
  updateSubmission,
  deleteSubmission,
  getUserSubmissions,
  getUserPoints
};

