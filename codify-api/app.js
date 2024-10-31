import { postgres } from "./deps.js";
import * as assignmentsService from "./Services/assignmentsService.js";
import * as submissionsService from "./Services/submissionsService.js";

const sql = postgres({});
const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleGetAssignments = async (req) => {
  return new Response(JSON.stringify(await assignmentsService.getAssignments()));
};

const handleGetAssignment = async (req, urlMapping) => {
  const id = urlMapping.pathname.groups.id;
  return new Response(JSON.stringify(await assignmentsService.getAssignment(id)));
};

const handlePostAssignment = async (req) => {
  const body = await req.json();
  await assignmentsService.addAssignment(body.title, body.assignment_order, body.handout, body.test_code);
  return new Response(null, { status: 201 });
};

const handleUpdateAssignment = async (req) => {
  const body = await req.json();
  await assignmentsService.updateAssignment(body.id, body.title, body.assignment_order, body.handout, body.test_code);
  return new Response(null, { status: 204 });
};

const handleDeleteAssignment = async (req, urlMapping) => {
  const id = urlMapping.pathname.groups.id;
  await assignmentsService.deleteAssignment(id);
  return new Response("OK", { status: 204 });
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
  }
];


const handleRequest = async (request) => {
    const mapping = urlMapping.find(
      (um) => um.method === request.method && um.pattern.test(request.url)
    );

    if (!mapping) {
      return new Response("Not found", { status: 404 });
    }

    const mappingResult = mapping.pattern.exec(request.url);
    try {
      return await mapping.fn(request, mappingResult);
    } catch (e) {
      console.log(e);
      return new Response(e.stack, { status: 500 })
    }
};
  
  const portConfig = { port: 7777, hostname: '0.0.0.0' };
  Deno.serve(portConfig, handleRequest);