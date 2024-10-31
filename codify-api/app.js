import { postgres } from "./deps.js";

const sql = postgres({});
const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};


const urlMapping = [
  { 
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot
  },
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