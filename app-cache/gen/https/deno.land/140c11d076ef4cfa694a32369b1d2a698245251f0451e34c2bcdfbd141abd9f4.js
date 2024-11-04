export class EOFError extends Error {
}
export class ConnectionClosedError extends Error {
}
export class SubscriptionClosedError extends Error {
}
export class ErrorReplyError extends Error {
}
export class InvalidStateError extends Error {
  constructor(message){
    const base = "Invalid state";
    super(message ? `${base}: ${message}` : base);
  }
}
export function isRetriableError(error) {
  return error instanceof Deno.errors.BadResource || error instanceof Deno.errors.BrokenPipe || error instanceof Deno.errors.ConnectionAborted || error instanceof Deno.errors.ConnectionRefused || error instanceof Deno.errors.ConnectionReset || error instanceof EOFError;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9lcnJvcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEVPRkVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25DbG9zZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBjbGFzcyBTdWJzY3JpcHRpb25DbG9zZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBjbGFzcyBFcnJvclJlcGx5RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZFN0YXRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBiYXNlID0gXCJJbnZhbGlkIHN0YXRlXCI7XG4gICAgc3VwZXIobWVzc2FnZSA/IGAke2Jhc2V9OiAke21lc3NhZ2V9YCA6IGJhc2UpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JldHJpYWJsZUVycm9yKGVycm9yOiBFcnJvcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQmFkUmVzb3VyY2UgfHxcbiAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJyb2tlblBpcGUgfHxcbiAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkNvbm5lY3Rpb25BYm9ydGVkIHx8XG4gICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Db25uZWN0aW9uUmVmdXNlZCB8fFxuICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQ29ubmVjdGlvblJlc2V0IHx8XG4gICAgZXJyb3IgaW5zdGFuY2VvZiBFT0ZFcnJvcik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLGlCQUFpQjtBQUFPO0FBRXJDLE9BQU8sTUFBTSw4QkFBOEI7QUFBTztBQUVsRCxPQUFPLE1BQU0sZ0NBQWdDO0FBQU87QUFFcEQsT0FBTyxNQUFNLHdCQUF3QjtBQUFPO0FBRTVDLE9BQU8sTUFBTSwwQkFBMEI7RUFDckMsWUFBWSxPQUFnQixDQUFFO0lBQzVCLE1BQU0sT0FBTztJQUNiLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxRQUFRLENBQUMsR0FBRztFQUMxQztBQUNGO0FBRUEsT0FBTyxTQUFTLGlCQUFpQixLQUFZO0VBQzNDLE9BQVEsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFdBQVcsSUFDOUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFVBQVUsSUFDdkMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLGlCQUFpQixJQUM5QyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsaUJBQWlCLElBQzlDLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxlQUFlLElBQzVDLGlCQUFpQjtBQUNyQiJ9