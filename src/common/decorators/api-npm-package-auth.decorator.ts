import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { X_API_KEY, X_DATABASE_ID } from 'src/packages/constants';

export function ApiNpmPackageAuth() {
  return applyDecorators(
    ApiSecurity(X_API_KEY.toLowerCase()),
    ApiSecurity(X_DATABASE_ID.toLowerCase()),
  );
}
