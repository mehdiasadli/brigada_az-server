import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppRequest } from 'src/types/express.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const exc =
      exception instanceof HttpException
        ? exception
        : new HttpException(
            'Something went wrong',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<AppRequest>();
    const status = exc.getStatus();

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exc.message,
      path: req.url,
    });
  }
}
