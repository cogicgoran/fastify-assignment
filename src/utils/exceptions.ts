export type ValidStatusCode =
  | 200
  | 201
  | 302
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 419
  | 420
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 427
  | 428
  | 429
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 509
  | 510
  | 511;

export abstract class Exception extends Error {
  statusCode: ValidStatusCode;

  protected constructor(message: string, code: ValidStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends Exception {
  statusCode: ValidStatusCode;
  type: string;
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.type = "bad_request";
  }
}

export class InternalServerError extends Exception {
  statusCode: ValidStatusCode;
  type: string;
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerError";
    this.statusCode = 400;
    this.type = "internal_server_error";
  }
}

export class UnauthorizedError extends Exception {
  statusCode: ValidStatusCode;
  type: string;
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.type = "unauthorized";
  }
}
