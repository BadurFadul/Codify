export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class BadRequestError extends APIError {
  constructor(message = 'Invalid request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class TooManyRequestsError extends APIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export class BadGatewayError extends APIError {
  constructor(message = 'Bad gateway') {
    super(message, 502);
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

export class MovedPermanentlyError extends APIError {
  constructor(newLocation) {
    super('Resource moved permanently', 301);
    this.location = newLocation;
  }
}

export class TemporaryRedirectError extends APIError {
  constructor(temporaryLocation) {
    super('Resource temporarily moved', 302);
    this.location = temporaryLocation;
  }
}

export class NotModifiedError extends APIError {
  constructor(message = 'Resource not modified') {
    super(message, 304);
  }
} 