import { postgres } from "./deps.js";
import * as assignmentsService from "./Services/assignmentsService.js";
import * as submissionsService from "./Services/submissionsService.js";
import { APIError } from "./errors.js";
import { ServiceUnavailableError } from "./utils/errors.js";


/*
 * This is a test comment
 * Written across multiple lines
 * To demonstrate multi-line comments
 */


const sql = postgres({});
const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleGetAssignments = async (req) => {
  try {
    const assignments = await assignmentsService.getAssignments();
    return new Response(JSON.stringify(assignments));
  } catch (error) {
    return handleError(error);
  }
};

const handleGetAssignment = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const assignment = await assignmentsService.getAssignment(id);
    return new Response(JSON.stringify(assignment));
  } catch (error) {
    return handleError(error);
  }
};

const handlePostAssignment = async (req) => {
  try {
    const body = await req.json();
    const result = await assignmentsService.addAssignment(
      body.title, 
      body.assignment_order, 
      body.handout, 
      body.test_code
    );
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
};

const handleUpdateAssignment = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const body = await req.json();
    const result = await assignmentsService.updateAssignment(
      id,
      body.title, 
      body.assignment_order, 
      body.handout, 
      body.test_code
    );
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};

const handleDeleteAssignment = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const result = await assignmentsService.deleteAssignment(id);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};

const handleGetSubmission = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const submission = await submissionsService.getSubmission(id);
    return new Response(JSON.stringify(submission));
  } catch (error) {
    return handleError(error);
  }
};

const handlePostSubmission = async (req) => {
  try {
    const body = await req.json();
    const result = await submissionsService.addSubmission(
      body.programming_assignment_id,
      body.code,
      body.user_uuid
    );
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
};

const handleGetUserPoints = async (req, urlMapping) => {
  try {
    const user_uuid = urlMapping.pathname.groups.user_uuid;
    const points = await submissionsService.getUserPoints(user_uuid);
    return new Response(JSON.stringify({ points }));
  } catch (error) {
    return handleError(error);
  }
};

const handleCheckPendingSubmission = async (req, urlMapping) => {
  try {
    const user_uuid = urlMapping.pathname.groups.user_uuid;
    const hasPending = await submissionsService.hasPendingSubmission(user_uuid);
    return new Response(JSON.stringify({ has_pending: hasPending }));
  } catch (error) {
    return handleError(error);
  }
};

const handleUpdateSubmission = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const body = await req.json();
    const result = await submissionsService.updateSubmission(
      id,
      body.status,
      body.grader_feedback,
      body.correct
    );
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};

const handleDeleteSubmission = async (req, urlMapping) => {
  try {
    const id = urlMapping.pathname.groups.id;
    const result = await submissionsService.deleteSubmission(id);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};

const handleError = (error) => {
  console.error(error);
  
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Handle unexpected errors
  return new Response(
    JSON.stringify({ error: 'Internal server error' }), 
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot
  },
  {
    method: "GET", 
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handleGetAssignments
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignments/:id" }),
    fn: handleGetAssignment
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handlePostAssignment
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/assignments/:id" }),
    fn: handleUpdateAssignment
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/assignments/:id" }),
    fn: handleDeleteAssignment
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/submissions/:id" }),
    fn: handleGetSubmission
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submissions" }),
    fn: handlePostSubmission
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/points/:user_uuid" }),
    fn: handleGetUserPoints
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/pending/:user_uuid" }),
    fn: handleCheckPendingSubmission
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/submissions/:id" }),
    fn: handleUpdateSubmission
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/submissions/:id" }),
    fn: handleDeleteSubmission
  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response(
      JSON.stringify({ error: 'Not found' }), 
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const mappingResult = mapping.pattern.exec(request.url);
  return await mapping.fn(request, mappingResult);
};
// Add export for testing
export { handleRequest };
const portConfig = { port: 7777, hostname: '0.0.0.0' };
Deno.serve(portConfig, handleRequest);

