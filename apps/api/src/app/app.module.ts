import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../database/data-source';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { MenuModule } from '../menu/menu.module';
import { OrdersModule } from '../orders/orders.module';
import { PublicModule } from '../public/public.module';
import { SettingsModule } from '../settings/settings.module';
import { TablesModule } from '../tables/tables.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      // Schema is owned by migrations; apply any pending ones on boot.
      migrationsRun: true,
    }),
    AuthModule,
    CategoryModule,
    MenuModule,
    OrdersModule,
    PublicModule,
    SettingsModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
