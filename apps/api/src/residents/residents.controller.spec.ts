import { Test, TestingModule } from '@nestjs/testing';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { Resident } from './entities/resident.entity';
import { ResidentType } from '@condominios/shared/enums/resident-type.enum';
import { DocumentType } from '@condominios/shared/enums/document-type.enum';

describe('ResidentsController', () => {
  let controller: ResidentsController;
  let service: jest.Mocked<ResidentsService>;

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

  const mockService = {
    create: jest.fn(),
    findAllByUnit: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentsController],
      providers: [
        { provide: ResidentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ResidentsController>(ResidentsController);
    service = module.get(ResidentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a resident', async () => {
      const mockResident = createMockResident();
      mockService.create.mockResolvedValue(mockResident);

      const dto = {
        firstName: 'Juan',
        lastName: 'Perez',
        documentType: DocumentType.RUT,
        documentNumber: '12345678-9',
        dateOfBirth: '1990-01-01',
        residentType: ResidentType.OWNER,
      };

      const result = await controller.create('unit-1', dto as any);

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: 'unit-1' }),
      );
      expect(result).toHaveProperty('data', mockResident);
    });
  });

  describe('findAllByUnit', () => {
    it('should return paginated residents', async () => {
      const mockResidents = [createMockResident()];
      mockService.findAllByUnit.mockResolvedValue({ data: mockResidents, total: 1 });

      const result = await controller.findAllByUnit('unit-1', { page: 1, limit: 10 });

      expect(mockService.findAllByUnit).toHaveBeenCalledWith('unit-1', { page: 1, limit: 10 });
      expect(result).toHaveProperty('data', mockResidents);
      expect(result).toHaveProperty('meta');
    });
  });

  describe('findOne', () => {
    it('should return a resident by id', async () => {
      const mockResident = createMockResident();
      mockService.findOne.mockResolvedValue(mockResident);

      const result = await controller.findOne('res-1');

      expect(mockService.findOne).toHaveBeenCalledWith('res-1');
      expect(result).toHaveProperty('data', mockResident);
    });
  });

  describe('update', () => {
    it('should update a resident', async () => {
      const mockResident = createMockResident({ firstName: 'Carlos' });
      mockService.update.mockResolvedValue(mockResident);

      const result = await controller.update('res-1', { firstName: 'Carlos' } as any);

      expect(mockService.update).toHaveBeenCalledWith('res-1', { firstName: 'Carlos' });
      expect(result).toHaveProperty('data', mockResident);
    });
  });

  describe('remove', () => {
    it('should soft delete a resident', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('res-1');

      expect(mockService.remove).toHaveBeenCalledWith('res-1');
    });
  });
});
