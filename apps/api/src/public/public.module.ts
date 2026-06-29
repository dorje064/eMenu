import { Module } from '@nestjs/common';
import { CategoryModule } from '../category/category.module';
import { MenuModule } from '../menu/menu.module';
import { OrdersModule } from '../orders/orders.module';
import { SettingsModule } from '../settings/settings.module';
import { PublicController } from './public.controller';

@Module({
  imports: [MenuModule, CategoryModule, SettingsModule, OrdersModule],
  controllers: [PublicController],
})
export class PublicModule {}
