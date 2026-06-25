import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

function isPrismaKnownError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message, errors } = this.resolve(exception);

    this.logger.error(
      `[${status}] ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    status: number;
    message: string;
    errors?: unknown;
  } {
    // NestJS built-in HTTP exceptions
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        const r = res as { message: unknown };
        if (Array.isArray(r.message)) {
          return {
            status: exception.getStatus(),
            message: 'Validation failed',
            errors: r.message,
          };
        }
        return {
          status: exception.getStatus(),
          message: String(r.message),
        };
      }
      return {
        status: exception.getStatus(),
        message: String(res),
      };
    }

    // Prisma known errors
    if (isPrismaKnownError(exception)) {
      return this.mapPrismaError(exception);
    }

    // Fallback – hide internals in production
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (err.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this value already exists.',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found.',
        };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          message:
            'Cannot delete this record because it is referenced by other records.',
        };
      case 'P2014':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Relation constraint violation.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error.',
        };
    }
  }
}
