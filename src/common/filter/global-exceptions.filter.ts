import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ErrorApiResponse } from 'src/common/dto/res/common-response';

/*
 * filter นี้ทำหน้าที่คอยจับทุก error ที่ออกมาจากd
 * controller หรือที่เกิดจาก runtime/lib
 * และ ปรับรูปแบบ response ให้อ่านง่าย
 *
 * TODO:
 * ในอนาคตถ้าเป็น production อาจปรับไม่ให้แสดง message เยอะเกิน
 * */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    console.log(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = (exception.getResponse() as any).message || exception.message;
    }

    // map error from lib to HttpException
    else if (exception instanceof QueryFailedError) {
      status = 409;
      message = exception.message;
    } else if (exception instanceof JsonWebTokenError) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof TokenExpiredError) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    res.status(status).json({
      code: status,
      status: status < 400 ? 'success' : 'error',
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    } as ErrorApiResponse);
  }
}
