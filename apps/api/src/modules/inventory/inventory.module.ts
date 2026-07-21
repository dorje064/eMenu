import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryAdjustment } from './entities/inventory-adjustment.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryLink } from './entities/inventory-link.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      InventoryLink,
      InventoryAdjustment,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
