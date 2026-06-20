import type { AuthSessionUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthSessionUser;
    }
  }
}

export {};
