/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AnyObjectSchema, ValidationError } from 'yup';
import { SCHEMA_METADATA_KEY } from '../decorators/use-schema.decorator';

@Injectable()
export class YupValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Get the schema from the method handler (where @UseSchema is placed)
    const schema = this.reflector.get<AnyObjectSchema>(
      SCHEMA_METADATA_KEY,
      context.getHandler(),
    );

    // 2. If a schema exists, validate the request body
    if (schema) {
      try {
        const validatedBody = await schema.validate(request.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        
        // Replace the request body with the cleaned/validated version
        request.body = validatedBody;
      } catch (err) {
        if (err instanceof ValidationError) {
          const formattedErrors: Record<string, string> = {};
          err.inner.forEach((currentError) => {
            if (currentError.path) {
              formattedErrors[currentError.path] = currentError.message;
            }
          });

          throw new BadRequestException({
            statusCode: 400,
            message: 'Validation failed',
            errors: formattedErrors,
            timestamp: new Date().toISOString(),
          });
        }
        throw new BadRequestException('Validation failed');
      }
    }

    return next.handle();
  }
}

// {
//   "statusCode": 400,
//   "message": "Validation failed",
//   "errors": {
//     "email": "Invalid email format",
//     "password": "At least one uppercase letter is required",
//     "roleId": "roleId must be a number"
//   },
//   "timestamp": "2026-01-15T15:05:22.000Z"
// }