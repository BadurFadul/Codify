export class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Add specific error types for common scenarios
export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends APIError {
  constructor(message = 'Invalid input') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
} 