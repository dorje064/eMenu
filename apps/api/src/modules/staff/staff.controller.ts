import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnerId } from '../auth/owner-id.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'Only café owners can manage staff' })
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Add a staff member (kitchen or waiter)' })
  @ApiCreatedResponse({ type: StaffDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateStaffDto,
  ): Promise<StaffDto> {
    return this.staffService.create(ownerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List this café's staff" })
  @ApiOkResponse({ type: [StaffDto] })
  findAll(@OwnerId() ownerId: string): Promise<StaffDto[]> {
    return this.staffService.findAll(ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a staff member's role or active status" })
  @ApiOkResponse({ type: StaffDto })
  @ApiNotFoundResponse({ description: 'Staff member not found' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffDto> {
    return this.staffService.update(ownerId, id, dto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: "Reset a staff member's password" })
  @ApiOkResponse({ type: StaffDto })
  @ApiNotFoundResponse({ description: 'Staff member not found' })
  resetPassword(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<StaffDto> {
    return this.staffService.resetPassword(ownerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a staff member' })
  @ApiNoContentResponse({ description: 'Staff member removed' })
  @ApiNotFoundResponse({ description: 'Staff member not found' })
  remove(@OwnerId() ownerId: string, @Param('id') id: string): Promise<void> {
    return this.staffService.remove(ownerId, id);
  }
}
