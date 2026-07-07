import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../database/data-source';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { MenuModule } from '../menu/menu.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { PublicModule } from '../public/public.module';
import { SettingsModule } from '../settings/settings.module';
import { StaffModule } from '../staff/staff.module';
import { TablesModule } from '../tables/tables.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Load the API's env file. Path is relative to the workspace root (the cwd
    // for `nx serve` and the built app). Without an explicit path, ConfigModule
    // reads the root .env instead and silently ignores apps/api/.env.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      // Schema is owned by migrations; apply any pending ones on boot.
      migrationsRun: true,
    }),
    AuthModule,
    CategoryModule,
    MenuModule,
    NotificationsModule,
    OrdersModule,
    PublicModule,
    SettingsModule,
    StaffModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
