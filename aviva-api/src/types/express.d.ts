import { ApiKeyRecord } from "../middleware/auth";

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKeyRecord;
    }
  }
}
