export class SecureRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SecureRequestError";
    this.status = status;
  }
}

export class RateLimitError extends SecureRequestError {
  constructor(message = "Too many requests") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class CsrfError extends SecureRequestError {
  constructor(message = "Invalid crsf token") {
    super(message, 403);
    this.name = "CsrfError";
  }
}

export class UnauthorizedError extends SecureRequestError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends SecureRequestError {
  constructor(message = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}
