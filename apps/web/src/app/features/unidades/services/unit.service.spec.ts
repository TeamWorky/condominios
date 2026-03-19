import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnitService } from './unit.service';
import { IUnit, UnitStatus, UnitType } from '../../../core/models/unit.model';

describe('UnitService', () => {
  let service: UnitService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/v1';

  const mockUnit: IUnit = {
    id: '17ab22fa-2a9f-498a-a967-8d4e3e635305',
    buildingId: '1f825b2a-2e40-478d-9e53-a6be0360155f',
    number: '001',
    floor: 1,
    block: 'A',
    unitType: UnitType.APARTMENT,
    areaM2: 100,
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: 2,
    storageUnits: 1,
    status: UnitStatus.AVAILABLE,
    isOccupied: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    building: { id: '1f825b2a-2e40-478d-9e53-a6be0360155f', name: 'Torre A', code: 'TA' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnitService]
    });
    service = TestBed.inject(UnitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('getUnitsByCondominium', () => {
    it('debería obtener unidades de un condominio y mapear la respuesta anidada', () => {
      const condoId = '764efaaa-a7fe-48a0-a702-a412e31b8a5f';
      const backendResponse = {
        success: true,
        data: [mockUnit],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };

      service.getUnitsByCondominium(condoId, 1, 10).subscribe((result) => {
        expect(result.data).toEqual([mockUnit]);
        expect(result.total).toBe(1);
      });

      const req = httpMock.expectOne(
        (r) => r.url.startsWith(`${apiUrl}/condominiums/${condoId}/units`) && r.method === 'GET'
      );
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(backendResponse);
    });

    it('debería manejar respuesta sin estructura anidada', () => {
      const condoId = 'condo-1';
      const simpleResponse = { success: true, data: [mockUnit], meta: { total: 1 } };

      service.getUnitsByCondominium(condoId).subscribe((result) => {
        expect(result.data.length).toBeGreaterThanOrEqual(0);
      });

      const req = httpMock.expectOne((r) => r.url.includes(`/condominiums/${condoId}/units`));
      req.flush(simpleResponse);
    });
  });

  describe('getUnitById', () => {
    it('debería obtener una unidad por ID y extraer data de la respuesta', () => {
      const id = mockUnit.id;
      const backendResponse = { success: true, data: mockUnit };

      service.getUnitById(id).subscribe((unit) => {
        expect(unit.id).toBe(mockUnit.id);
        expect(unit.number).toBe(mockUnit.number);
        expect(unit.buildingId).toBe(mockUnit.buildingId);
      });

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/units/${id}` && r.method === 'GET');
      req.flush(backendResponse);
    });

    it('debería manejar respuesta estandar de la API', () => {
      const id = mockUnit.id;
      const response = { success: true, data: mockUnit };

      service.getUnitById(id).subscribe((unit) => {
        expect(unit).toBeDefined();
        expect(unit.id).toBe(mockUnit.id);
      });

      const req = httpMock.expectOne(`${apiUrl}/units/${id}`);
      req.flush(response);
    });
  });

  describe('getUnitsByBuilding', () => {
    it('debería obtener unidades por edificio', () => {
      const buildingId = 'building-1';
      const response = { success: true, data: [mockUnit], meta: { total: 1 } };

      service.getUnitsByBuilding(buildingId, 1, 10).subscribe((result) => {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      const req = httpMock.expectOne((r) =>
        r.url.includes(`/buildings/${buildingId}/units`) && r.method === 'GET'
      );
      req.flush(response);
    });
  });

  describe('createUnit', () => {
    it('debería crear una unidad', () => {
      const buildingId = 'building-1';
      const createDto = {
        buildingId,
        number: '102',
        floor: 2,
        unitType: UnitType.APARTMENT,
        areaM2: 85,
        bedrooms: 2,
        bathrooms: 1,
        parkingSpots: 1,
        storageUnits: 0
      };
      const response = { success: true, data: { ...mockUnit, ...createDto } };

      service.createUnit(buildingId, createDto).subscribe((unit) => {
        expect(unit).toBeDefined();
        expect(unit.number).toBe(createDto.number);
      });

      const req = httpMock.expectOne((r) =>
        r.url.includes(`/buildings/${buildingId}/units`) && r.method === 'POST'
      );
      req.flush(response);
    });
  });

  describe('updateUnit', () => {
    it('debería actualizar una unidad', () => {
      const id = mockUnit.id;
      const updateDto = { number: '001-A', status: UnitStatus.MAINTENANCE };
      const response = { success: true, data: { ...mockUnit, ...updateDto } };

      service.updateUnit(id, updateDto).subscribe((unit) => {
        expect(unit).toBeDefined();
      });

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/units/${id}` && r.method === 'PATCH');
      req.flush(response);
    });
  });

  describe('deleteUnit', () => {
    it('debería eliminar una unidad', () => {
      const id = mockUnit.id;

      service.deleteUnit(id).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/units/${id}` && r.method === 'DELETE');
      req.flush(null);
    });
  });

  describe('updateUnitStatus', () => {
    it('debería actualizar el estado de una unidad', () => {
      const id = mockUnit.id;
      const response = { success: true, data: { ...mockUnit, status: UnitStatus.OCCUPIED } };

      service.updateUnitStatus(id, UnitStatus.OCCUPIED).subscribe((unit) => {
        expect(unit).toBeDefined();
      });

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/units/${id}` && r.method === 'PATCH');
      expect(req.request.body.status).toBe(UnitStatus.OCCUPIED);
      req.flush(response);
    });
  });
});
