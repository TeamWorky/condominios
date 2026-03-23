import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateResidentDto } from './create-resident.dto';

export class UpdateResidentDto extends PartialType(
  OmitType(CreateResidentDto, ['unitId', 'documentType', 'documentNumber'] as const),
) {}
