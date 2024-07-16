import { AppRequest, TokenPayload } from 'src/types/express.types';
import { extractTokenFromHeaders } from './extractTokenFromHeaders';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export async function authenticated(req: AppRequest): Promise<boolean> {
  const token = extractTokenFromHeaders(req.headers);
  if (!token) throw new UnauthorizedException('Unauthorized');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new UnauthorizedException('Unauthorized');
  }

  return true;
}
