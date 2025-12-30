import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  ApiResponseFormat,
} from 'src/common/dto/res/common-response';

/*
 * interceptor นี้ทำหน้าที่แปลง response ให้เป็นไปตาม format
 * */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: ApiResponse) => {
        return {
          code: response.statusCode ?? HttpStatus.OK,
          status: 'success',
          ...(data.message && { message: data.message }),
          ...(data.data && { data: data.data }),
        } as ApiResponseFormat<T>;
      }),
    );
  }
}
