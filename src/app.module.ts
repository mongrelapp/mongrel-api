import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { OrganizationMembersModule } from './organization-members/organization-members.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokensModule } from './access-tokens/access-tokens.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { DatabasesModule } from './databases/databases.module';
import { KeyValueDatabasesModule } from './key-value-databases/key-value-databases.module';
import { InviteUsersModule } from './invite-users/invite-users.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PackagesModule } from './packages/package.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SubscribersModule } from './subscribers/subscribers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        aws: {
          region: configService.get<string>('AWS_REGION'),
          accessKeyId: configService.get<string>('AWS_ACCESS_KEY'),
          secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: +configService.get<number>('MAIL_PORT'),
          secure: true,
          defaults: {
            from: '"Mongrel" <admin@mongrel.app>',
          },
          auth: {
            user: configService.get<string>('MAIL_USERNAME'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        template: {
          dir: join(process.cwd(), 'views', 'emails'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    OrganizationsModule,
    OrganizationMembersModule,
    AuthModule,
    AccessTokensModule,
    RefreshTokensModule,
    ApiKeysModule,
    DatabasesModule,
    KeyValueDatabasesModule,
    InviteUsersModule,
    PackagesModule,
    StripeModule,
    SubscriptionsModule,
    SubscribersModule,
  ],
  providers: [AppService],
  controllers: [],
})
export class AppModule {}
