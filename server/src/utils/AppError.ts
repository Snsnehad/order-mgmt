export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409, "CONFLICT");
  }
}
