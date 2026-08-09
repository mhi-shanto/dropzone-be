export const SALT_ROUNDS = 12;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const AUTH_HEADER = "authorization";
export const BEARER_PREFIX = "Bearer ";

export const AUTH_ERRORS = {
  EMAIL_TAKEN: "Email is already in use.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  MISSING_TOKEN: "You are not logged in.",
  INVALID_TOKEN: "Your session has expired. Please log in again.",
} as const;
