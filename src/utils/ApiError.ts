export class InternalError extends Error {
  constructor() {
    super(" Internal Error!");
  }
}

export class BadRequestError extends Error {
  constructor() {
    super("Bad Request!");
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message + "Not Found!");
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super("Auth Error:" + message);
  }
}
export class RequestForbiddenError extends Error {
  constructor() {
    super("Request Forbidden!");
  }
}
export class NoEntryError extends Error {
  constructor() {
    super("Request Not Allowed!");
  }
}

export class BadTokenError extends Error {
  constructor() {
    super("Bad Token!");
  }
}

export class TokenError extends Error {
  constructor(message: string) {
    super("Error:" + message);
  }
}

export class AccessTokenError extends Error {
  constructor() {
    super("Invalid Access Token");
  }
}

export class NoDataError extends Error {
  constructor() {
    super("No Data");
  }
}
export class ExpiredTokenError extends Error {
  constructor() {
    super("Expired Token");
  }
}
