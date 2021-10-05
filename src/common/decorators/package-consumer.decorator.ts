import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { X_API_KEY, X_DATABASE_ID } from 'src/packages/constants';

export interface IPackageConsumer {
  token: string;
  databaseId: string;
}

export const PackageConsumer = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return {
      token: request.headers[X_API_KEY],
      databaseId: request.headers[X_DATABASE_ID],
    };
  },
);
