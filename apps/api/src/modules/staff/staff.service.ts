import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Customer } from '../auth/entities/customer.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

/**
 * Staff management for a café owner. Staff are `customers` rows whose
 * `ownerId` points at the owner; every query/mutation is scoped to the calling
 * owner so one café can never touch another's staff.
 */
@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Customer)
    private readonly users: Repository<Customer>,
  ) {}

  async create(ownerId: string, dto: CreateStaffDto): Promise<StaffDto> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const staff = this.users.create({
      email,
      passwordHash,
      fullName: dto.fullName,
      phone: null,
      role: dto.role,
      ownerId,
      active: true,
    });
    await this.users.save(staff);
    return this.toDto(staff);
  }

  async findAll(ownerId: string): Promise<StaffDto[]> {
    const staff = await this.users.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
    return staff.map((s) => this.toDto(s));
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateStaffDto,
  ): Promise<StaffDto> {
    const staff = await this.getOwnedStaff(ownerId, id);
    if (dto.role !== undefined) staff.role = dto.role;
    if (dto.active !== undefined) staff.active = dto.active;
    await this.users.save(staff);
    return this.toDto(staff);
  }

  async resetPassword(
    ownerId: string,
    id: string,
    dto: ResetPasswordDto,
  ): Promise<StaffDto> {
    const staff = await this.getOwnedStaff(ownerId, id);
    staff.passwordHash = await bcrypt.hash(dto.password, 10);
    await this.users.save(staff);
    return this.toDto(staff);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const staff = await this.getOwnedStaff(ownerId, id);
    await this.users.remove(staff);
  }

  /** Fetch a staff row, asserting it belongs to this owner (else 404). */
  private async getOwnedStaff(ownerId: string, id: string): Promise<Customer> {
    const staff = await this.users.findOne({ where: { id, ownerId } });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  private toDto(staff: Customer): StaffDto {
    return {
      id: staff.id,
      email: staff.email,
      fullName: staff.fullName,
      // Staff always carry a staff role; the cast narrows the entity's wider
      // UserRole (which includes 'owner') for the response shape.
      role: staff.role as StaffDto['role'],
      active: staff.active,
      createdAt: staff.createdAt,
    };
  }
}
