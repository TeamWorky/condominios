import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { PaginationDto } from '@condominios/common/dto/pagination.dto';
import { ResponseUtil } from '@condominios/common/utils/response.util';
import { SUCCESS_MESSAGES } from '@condominios/common/constants/app.constants';
import { JwtAuthGuard } from '@condominios/common/guards/jwt-auth.guard';
import { MinRoleGuard } from '@condominios/common/guards/min-role.guard';
import { MinRole } from '@condominios/common/decorators/min-role.decorator';
import { Role } from '@condominios/shared/enums/role.enum';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('units/:unitId/payments')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment for a unit (ADMIN+)' })
  @ApiParam({ name: 'unitId', description: 'Unit ID', type: 'string' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async create(
    @Param('unitId') unitId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    createPaymentDto.unitId = unitId;
    const payment = await this.paymentsService.create(createPaymentDto);
    return ResponseUtil.success(payment, SUCCESS_MESSAGES.CREATED);
  }

  @Get('condominiums/:condoId/payments')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'List all payments for a condominium (USER+)' })
  @ApiParam({ name: 'condoId', description: 'Condominium ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByCondominium(
    @Param('condoId') condoId: string,
    @Query() pagination: PaginationDto,
  ) {
    const { data, total } = await this.paymentsService.findAllByCondominium(
      condoId,
      pagination,
    );
    return ResponseUtil.paginated(
      data,
      pagination.page || 1,
      pagination.limit || 10,
      total,
    );
  }

  @Get('units/:unitId/payments')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'List all payments for a unit (USER+)' })
  @ApiParam({ name: 'unitId', description: 'Unit ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async findAllByUnit(
    @Param('unitId') unitId: string,
    @Query('condoId') condoId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination: PaginationDto = { page: page || 1, limit: limit || 10 };
    const { data, total } = await this.paymentsService.findAllByUnit(
      unitId,
      condoId,
      pagination,
    );
    return ResponseUtil.paginated(
      data,
      pagination.page || 1,
      pagination.limit || 10,
      total,
    );
  }

  @Get('payments/:id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get payment details by ID (USER+)' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    return ResponseUtil.success(payment);
  }

  @Patch('payments/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment by ID (ADMIN+)' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or paid payment amount change' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Query('condoId') condoId: string,
  ) {
    const payment = await this.paymentsService.update(
      id,
      updatePaymentDto,
      condoId,
    );
    return ResponseUtil.success(payment, SUCCESS_MESSAGES.UPDATED);
  }

  @Patch('payments/:id/status')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Change payment status (ADMIN+)' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment status changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @Query('condoId') condoId: string,
  ) {
    const payment = await this.paymentsService.changeStatus(
      id,
      changeStatusDto,
      condoId,
    );
    return ResponseUtil.success(payment, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete('payments/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete payment by ID (ADMIN+)' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Payment soft deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete a paid payment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(
    @Param('id') id: string,
    @Query('condoId') condoId: string,
  ) {
    await this.paymentsService.remove(id, condoId);
  }
}
