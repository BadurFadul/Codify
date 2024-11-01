// Mock database
export const mockDb = {
  submissions: [],
  assignments: []
};

// Mock submission data
export const mockSubmission = {
  id: 1,
  programming_assignment_id: 1,
  code: "test code",
  user_uuid: "test-uuid",
  status: "pending",
  grader_feedback: null,
  correct: null
};

// Mock assignment data
export const mockAssignment = {
  id: 1,
  title: "Test Assignment",
  description: "Test Description",
  test_cases: ["test case 1"],
  difficulty: "easy",
  points: 10
};

// Mock database connection
export const mockPgConnection = {
  query: async () => ({ rows: [] }),
  // Add other methods as needed
};

// Mock service helper
export const injectMockDatabase = (service) => {
  Object.defineProperty(service, 'sql', {
    value: mockPgConnection,
    writable: true,
    configurable: true
  });
  return service;
};

// Test request helper
export const createTestRequest = (method, path, body = null) => {
  const request = new Request(`http://localhost${path}`, { method });
  if (body) {
    request.body = JSON.stringify(body);
    request.headers.set("Content-Type", "application/json");
  }
  return request;
};

// Response parser helper
export const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};