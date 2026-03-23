import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResidentsService } from './residents.service';
import { Resident } from './entities/resident.entity';
import { LoggerService } from '@condominios/infrastructure/logger/logger.service';
import { RedisCacheService } from '@condominios/infrastructure/redis/redis-cache.service';
import {
  AlreadyExistsException,
  NotFoundException,
} from '@condominios/common/exceptions/business.exception';
import { SoftDeleteRepositoryHelper } from '@condominios/common/repositories/base.repository';
import { UnitsService } from '../units/units.service';
import { ResidentType } from '@condominios/shared/enums/resident-type.enum';
import { DocumentType } from '@condominios/shared/enums/document-type.enum';

jest.mock('@condominios/common/repositories/base.repository');

describe('ResidentsService', () => {
  let service: ResidentsService;
  let repository: jest.Mocked<Repository<Resident>>;
  let cache: jest.Mocked<RedisCacheService>;
  let unitsService: jest.Mocked<UnitsService>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
    getOrSet: jest.fn(async (_key, fn) => fn()),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockUnitsService = {
    findOne: jest.fn().mockResolvedValue({ id: 'unit-1', number: '101' }),
  };

  const createMockResident = (overrides?: Partial<Resident>): Resident => {
    const resident = new Resident();
    resident.id = overrides?.id || 'res-1';
    resident.firstName = overrides?.firstName || 'Juan';
    resident.lastName = overrides?.lastName || 'Perez';
    resident.documentType = overrides?.documentType || DocumentType.RUT;
    resident.documentNumber = overrides?.documentNumber || '12345678-9';
    resident.dateOfBirth = overrides?.dateOfBirth || new Date('1990-01-01');
    resident.unitId = overrides?.unitId || 'unit-1';
    resident.residentType = overrides?.residentType || ResidentType.OWNER;
    resident.isPrimary = overrides?.isPrimary ?? true;
    resident.isActive = overrides?.isActive ?? true;
    return resident;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUnitsService.findOne.mockResolvedValue({ id: 'unit-1', number: '101' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResidentsService,
        { provide: getRepositoryToken(Resident), useValue: mockRepository },
        { provide: RedisCacheService, useValue: mockCache },
        { provide: LoggerService, useValue: mockLogger },
        { provide: UnitsService, useValue: mockUnitsService },
      ],
    }).compile();

    service = module.get<ResidentsService>(ResidentsService);
    repository = module.get(getRepositoryToken(Resident));
    cache = module.get(RedisCacheService);
    unitsService = module.get(UnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      firstName: 'Juan',
      lastName: 'Perez',
      documentType: DocumentType.RUT,
      documentNumber: '12345678-9',
      dateOfBirth: '1990-01-01',
      unitId: 'unit-1',
      residentType: ResidentType.OWNER,
    };

    it('should create a resident successfully', async () => {
      const mockResident = createMockResident();
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockResident);
      mockRepository.save.mockResolvedValue(mockResident);

      const result = await service.create(createDto as any);

      expect(unitsService.findOne).toHaveBeenCalledWith('unit-1');
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockResident);
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should throw AlreadyExistsException for duplicate document', async () => {
      const existingResident = createMockResident();
      mockQueryBuilder.getOne.mockResolvedValue(existingResident);

      await expect(service.create(createDto as any)).rejects.toThrow(
        AlreadyExistsException,
      );
    });

    it('should verify unit exists before creating', async () => {
      mockUnitsService.findOne.mockRejectedValue(new NotFoundException('Unit'));

      await expect(service.create(createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByUnit', () => {
    it('should return paginated residents', async () => {
      const mockResidents = [createMockResident()];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockResidents, 1]);

      const result = await service.findAllByUnit('unit-1', { page: 1, limit: 10 });

      expect(unitsService.findOne).toHaveBeenCalledWith('unit-1');
      expect(result).toEqual({ data: mockResidents, total: 1 });
    });

    it('should verify unit exists', async () => {
      mockUnitsService.findOne.mockRejectedValue(new NotFoundException('Unit'));

      await expect(
        service.findAllByUnit('invalid', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a resident by id', async () => {
      const mockResident = createMockResident();
      mockRepository.findOne.mockResolvedValue(mockResident);

      const result = await service.findOne('res-1');

      expect(result).toEqual(mockResident);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should include deleted when flag is true', async () => {
      const mockResident = createMockResident();
      mockRepository.findOne.mockResolvedValue(mockResident);

      await service.findOne('res-1', true);

      expect(mockRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('update', () => {
    it('should update a resident', async () => {
      const mockResident = createMockResident();
      const updatedResident = { ...mockResident, firstName: 'Carlos' };
      mockRepository.findOne.mockResolvedValue(mockResident);
      mockRepository.save.mockResolvedValue(updatedResident);

      const result = await service.update('res-1', { firstName: 'Carlos' });

      expect(result.firstName).toBe('Carlos');
      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should throw NotFoundException when resident not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid', { firstName: 'Carlos' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a resident', async () => {
      const mockResident = createMockResident();
      mockRepository.findOne.mockResolvedValue(mockResident);
      (SoftDeleteRepositoryHelper.softDeleteEntity as jest.Mock).mockResolvedValue(undefined);

      await service.remove('res-1');

      expect(SoftDeleteRepositoryHelper.softDeleteEntity).toHaveBeenCalledWith(
        mockRepository,
        mockResident,
      );
      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should throw NotFoundException when resident not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
