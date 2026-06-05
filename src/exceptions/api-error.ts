export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;

  readonly errors: FieldError[];

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message: string, errors: FieldError[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}
