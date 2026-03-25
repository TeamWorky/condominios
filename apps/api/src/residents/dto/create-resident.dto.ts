import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsDateString,
  IsEmail,
  MaxLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResidentType } from '@condominios/shared/enums/resident-type.enum';
import { DocumentType } from '@condominios/shared/enums/document-type.enum';
import { isValidRut } from '@condominios/shared/validators/rut.validator';

@ValidatorConstraint({ name: 'isValidChileanRut', async: false })
class IsValidChileanRut implements ValidatorConstraintInterface {
  validate(documentNumber: string, args: ValidationArguments): boolean {
    const dto = args.object as CreateResidentDto;
    if (dto.documentType !== DocumentType.RUT) return true;
    return isValidRut(documentNumber);
  }

  defaultMessage(): string {
    return 'Invalid RUT: verification digit does not match';
  }
}

export class CreateResidentDto {
  @ApiProperty({ example: 'Juan', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Perez', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.RUT, description: 'Document type' })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @ApiProperty({ example: '12.345.678-5', description: 'Document number (unique among active residents). If RUT, must have valid verification digit.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Validate(IsValidChileanRut)
  documentNumber: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'juan@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'User ID for system access (optional)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unit ID' })
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @ApiPropertyOptional({ enum: ResidentType, example: ResidentType.OWNER, description: 'Type of resident' })
  @IsEnum(ResidentType)
  @IsOptional()
  residentType?: ResidentType;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Move in date' })
  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @ApiPropertyOptional({ example: '2025-01-15', description: 'Move out date' })
  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Is primary resident', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'Spouse', description: 'Relationship to primary resident' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
