import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../database/data-source';
import { AuthModule } from '../modules/auth/auth.module';
import { CategoryModule } from '../modules/category/category.module';
import { ExpensesModule } from '../modules/expenses/expenses.module';
import { MenuModule } from '../modules/menu/menu.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { PublicModule } from '../public/public.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { StaffModule } from '../modules/staff/staff.module';
import { TablesModule } from '../modules/tables/tables.module';
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
    ExpensesModule,
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
