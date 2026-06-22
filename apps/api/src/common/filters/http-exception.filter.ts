import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        errors = Array.isArray(res.message) ? res.message : [];
        if (errors.length > 0) {
          message = 'Validation failed';
        }
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
      errors: errors.map((e) =>
        typeof e === 'string' ? { message: e } : e,
      ),
    });
  }
}
