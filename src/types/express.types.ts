import { Request } from 'express';

export interface TokenPayload {
  id: string;
  iat?: number;
}

export interface AppRequest extends Request {
  user?: TokenPayload;
}
