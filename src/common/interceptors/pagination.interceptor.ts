import { PaginationConsts } from '#common/constants';
import { GettingAllResponse } from '#common/types/getting-all-response.type';
import { Pagination } from '#common/types/pagination.type';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class PaginationInterceptor<T>
  implements NestInterceptor<T, Pagination<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Pagination<T>> | Promise<Observable<Pagination<T>>> {
    const request = context.switchToHttp().getRequest<Request>();
    const reqQueries = request.query;

    const enablePagination = !!(
      reqQueries.noPagination && reqQueries.noPagination === 'false'
    );
    let page = parseInt(reqQueries.page as string);
    let limit = parseInt(reqQueries.limit as string);

    if (enablePagination) {
      page = page || PaginationConsts.DEFAULT_PAGE;
      limit = limit || PaginationConsts.DEFAULT_LIMIT;
    }

    request.query = {
      ...reqQueries,
      page: page.toString(),
      limit: limit.toString(),
    };

    return next.handle().pipe(
      map((data) => {
        const { count, data: items } = data as GettingAllResponse<T>;

        const previous = enablePagination && page > 1 ? page - 1 : null;
        const next = enablePagination && page * limit < count ? page + 1 : null;

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
