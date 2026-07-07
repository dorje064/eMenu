import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/**
 * Reusable real-time notification module (SSE transport + in-process bus).
 * Other modules import this and inject {@link NotificationsService} to publish;
 * the controller exposes the authenticated `/api/notifications/stream` endpoint.
 */
@Module({
  imports: [
    ConfigModule,
    // Same secret as the HTTP JWT guard, used to verify the SSE query token.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-insecure-secret',
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
