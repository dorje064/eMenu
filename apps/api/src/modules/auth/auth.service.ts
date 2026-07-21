import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { AuthResponseDto, CustomerDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    private readonly jwt: JwtService,
    private readonly categoryService: CategoryService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.customers.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    // A self-service signup always creates a café owner (staff are added by an
    // owner). Set the defaults explicitly so the in-memory entity is complete
    // for the token/response without a reload.
    const customer = this.customers.create({
      email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      role: 'owner',
      ownerId: null,
      active: true,
    });
    await this.customers.save(customer);

    // Give the new café a starter set of categories.
    await this.categoryService.seedDefaults(customer.id);

    return this.buildAuthResponse(customer);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const customer = await this.customers.findOne({ where: { email } });
    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!customer.active) {
      throw new UnauthorizedException('Account has been deactivated');
    }
    return this.buildAuthResponse(customer);
  }

  findById(id: string): Promise<Customer | null> {
    return this.customers.findOne({ where: { id } });
  }

  toDto(customer: Customer): CustomerDto {
    return {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      role: customer.role,
      ownerId: customer.ownerId,
      createdAt: customer.createdAt,
    };
  }

  private buildAuthResponse(customer: Customer): AuthResponseDto {
    const accessToken = this.jwt.sign({
      sub: customer.id,
      email: customer.email,
      role: customer.role,
      ownerId: customer.ownerId,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      customer: this.toDto(customer),
    };
  }
}
