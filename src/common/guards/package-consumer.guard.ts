import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { X_API_KEY, X_DATABASE_ID } from 'src/packages/constants';
import { PackagesService } from 'src/packages/package.service';

@Injectable()
export class PackageConsumerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const apiKey = request['headers'][X_API_KEY];
    const databaseId = request['headers'][X_DATABASE_ID];

    if (!apiKey || !databaseId) {
      throw new UnauthorizedException();
    }

    const database = await this.packagesService.validateConsumer(
      databaseId,
      apiKey,
    );

    request['database'] = database;

    return true;
  }

  constructor(private packagesService: PackagesService) {}
}
