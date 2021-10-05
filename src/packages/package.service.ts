import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from 'src/api-keys/api-keys.service';
import { KeyValueDatabasesService } from 'src/key-value-databases/key-value-databases.service';

@Injectable()
export class PackagesService {
  /**
   * Validate package conumser
   */
  async validateConsumer(databaseId: string, token: string) {
    const apiKey = await this.apiKeysService.find({ key: token }, [
      'user',
      'user.organization',
    ]);

    if (!apiKey || !apiKey.isActive) throw new UnauthorizedException();

    const database = await this.keyValueDatabasesService.find(
      {
        id: databaseId,
      },
      ['organization'],
    );

    if (
      !database ||
      !database.isActive ||
      database.organization.id !== apiKey.user.organization.id
    ) {
      throw new UnauthorizedException();
    }

    return database;
  }

  constructor(
    private apiKeysService: ApiKeysService,
    private keyValueDatabasesService: KeyValueDatabasesService,
  ) {}
}
