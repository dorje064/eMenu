import { Module } from '@nestjs/common';
import { CategoryModule } from '../modules/category/category.module';
import { MenuModule } from '../modules/menu/menu.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { PublicController } from './public.controller';

@Module({
  imports: [MenuModule, CategoryModule, SettingsModule, OrdersModule],
  controllers: [PublicController],
})
export class PublicModule {}
