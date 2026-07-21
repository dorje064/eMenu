import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../auth/entities/customer.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
