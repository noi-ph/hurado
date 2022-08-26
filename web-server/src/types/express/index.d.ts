import { JwtPayload } from '../JwtPayload';

declare global {
  namespace Express {
    export interface Request {
      jwtPayload: JwtPayload;
    }
  }
}
