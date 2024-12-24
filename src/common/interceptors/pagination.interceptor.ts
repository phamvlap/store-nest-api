import { Observable, map } from 'rxjs';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GettingAllResponse } from '../types/getting-all-response.type';
import { Pagination } from '../types/pagination.type';

@Injectable()
export class PaginationInterceptor<T>
  implements NestInterceptor<T, Pagination<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Pagination<T>> | Promise<Observable<Pagination<T>>> {
    return next.handle().pipe(
      map((data) => {
        const { count, data: items } = data as GettingAllResponse<T>;

        const filter = context.switchToHttp().getRequest().query;

        const pagination = !!(
          filter.noPagination && filter.noPagination === 'false'
        );
        const page = Number.parseInt(filter.page as string);
        const limit = Number.parseInt(filter.limit as string);

        let previous: number | null = null;
        let next: number | null = null;

        if (pagination && page && limit) {
          previous = page > 1 ? page - 1 : null;
          next = page * limit < count ? page + 1 : null;
        }

        return {
          previous,
          next,
          count,
          data: items,
        };
      }),
    );
  }
}
