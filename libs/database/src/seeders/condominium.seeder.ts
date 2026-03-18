import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condominium } from '../../../../apps/api/src/condominiums/entities/condominium.entity';
import { Building } from '../../../../apps/api/src/buildings/entities/building.entity';
import { Unit } from '../../../../apps/api/src/units/entities/unit.entity';
import { User } from '../../../../apps/api/src/users/entities/user.entity';
import { UnitType } from '@condominios/shared/enums/unit-type.enum';
import { UnitStatus } from '@condominios/shared/enums/unit-status.enum';
import { Role } from '@condominios/shared/enums/role.enum';
import { LoggerService } from '@condominios/infrastructure/logger/logger.service';
import { RedisCacheService } from '@condominios/infrastructure/redis/redis-cache.service';

@Injectable()
export class CondominiumSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv !== 'development') {
      this.logger.log(
        'Skipping condominium seeder - not in development environment',
        CondominiumSeeder.name,
      );
      return;
    }

    await this.delay(3000);
    await this.seedCondominiumData();
  }

  private async seedCondominiumData(): Promise<void> {
    try {
      // Check if data already exists
      const existingCondominiums = await this.condominiumRepository.count();

      if (existingCondominiums > 0) {
        this.logger.log(
          `Condominium data already exists (${existingCondominiums} records), skipping seed`,
          CondominiumSeeder.name,
        );
        // Aún así, asegurar que todos los condominios estén asociados al SUPER_ADMIN
        await this.associateAllCondominiumsToSuperAdmin();
        return;
      }

      this.logger.log('Starting condominium demo data seeding...', CondominiumSeeder.name);

      // Define condominiums with their buildings and admin users
      const condominiumsData = [
        {
          condominium: {
            name: 'Torres del Sol',
            legalName: 'Condominio Torres del Sol SpA',
            rut: '76.123.456-7',
            address: 'Av. Las Condes 12345',
            city: 'Santiago',
            region: 'Región Metropolitana',
            postalCode: '7550000',
            phone: '+56912345678',
            email: 'contacto@torresdelsol.cl',
            settings: { currency: 'CLP', timezone: 'America/Santiago', language: 'es' },
            isActive: true,
          },
          buildings: [
            { name: 'Torre A', code: 'TA', floors: 5, undergroundFloors: 1, hasElevator: true, address: 'Entrada principal', isActive: true },
            { name: 'Torre B', code: 'TB', floors: 5, undergroundFloors: 1, hasElevator: true, address: 'Entrada secundaria', isActive: true },
          ],
          admin: { email: 'admin@torresdelsol.cl', password: 'Admin123!', firstName: 'Admin', lastName: 'Torres del Sol', role: Role.ADMIN },
        },
        {
          condominium: {
            name: 'Jardines del Este',
            legalName: 'Condominio Jardines del Este SpA',
            rut: '76.234.567-8',
            address: 'Av. Vitacura 6789',
            city: 'Santiago',
            region: 'Región Metropolitana',
            postalCode: '7630000',
            phone: '+56923456789',
            email: 'contacto@jardinesdeleste.cl',
            settings: { currency: 'CLP', timezone: 'America/Santiago', language: 'es' },
            isActive: true,
          },
          buildings: [
            { name: 'Edificio Central', code: 'EC', floors: 8, undergroundFloors: 2, hasElevator: true, address: 'Acceso principal', isActive: true },
          ],
          admin: { email: 'admin@jardinesdeleste.cl', password: 'Admin123!', firstName: 'Admin', lastName: 'Jardines', role: Role.ADMIN },
        },
      ];

      let totalUnits = 0;
      const savedCondominiumIds: string[] = [];

      for (const data of condominiumsData) {
        // Create condominium
        const condominium = this.condominiumRepository.create(data.condominium);
        const savedCondominium = await this.condominiumRepository.save(condominium);
        savedCondominiumIds.push(savedCondominium.id);

        this.logger.log(
          `Created condominium: ${savedCondominium.name}`,
          CondominiumSeeder.name,
          { condominiumId: savedCondominium.id },
        );

        // Create buildings
        for (const buildingData of data.buildings) {
          const building = this.buildingRepository.create({
            ...buildingData,
            condominiumId: savedCondominium.id,
          });
          const savedBuilding = await this.buildingRepository.save(building);

          this.logger.log(
            `Created building: ${savedBuilding.name}`,
            CondominiumSeeder.name,
            { buildingId: savedBuilding.id },
          );

          // Create units (floors × 2 units per floor)
          for (let floor = 1; floor <= savedBuilding.floors; floor++) {
            for (let unitNum = 1; unitNum <= 2; unitNum++) {
              const unitNumber = `${floor}0${unitNum}`;
              const unit = this.unitRepository.create({
                buildingId: savedBuilding.id,
                number: unitNumber,
                floor,
                unitType: UnitType.APARTMENT,
                areaM2: 70 + Math.random() * 30,
                aliquot: 0.025,
                bedrooms: 2 + Math.floor(Math.random() * 2),
                bathrooms: 1 + Math.floor(Math.random() * 2),
                status: UnitStatus.AVAILABLE,
                isOccupied: false,
              });
              await this.unitRepository.save(unit);
              totalUnits++;
            }
          }
        }

        // Create admin user for this condominium
        const existingAdmin = await this.userRepository.findOne({
          where: { email: data.admin.email },
        });

        if (!existingAdmin) {
          const adminUser = this.userRepository.create({
            email: data.admin.email,
            password: data.admin.password,
            firstName: data.admin.firstName,
            lastName: data.admin.lastName,
            role: data.admin.role,
            isActive: true,
          });
          const savedAdmin = await this.userRepository.save(adminUser);

          // Associate admin to their condominium
          savedAdmin.condominios = [savedCondominium];
          await this.userRepository.save(savedAdmin);

          this.logger.log(
            `Created admin user: ${savedAdmin.email} for ${savedCondominium.name}`,
            CondominiumSeeder.name,
            { userId: savedAdmin.id, condominiumId: savedCondominium.id },
          );
        }
      }

      // Associate all condominiums to SUPER_ADMIN
      for (const condoId of savedCondominiumIds) {
        await this.associateCondominiumToSuperAdmin(condoId);
      }

      this.logger.warn(
        '✅ DEMO DATA CREATED SUCCESSFULLY',
        CondominiumSeeder.name,
        {
          condominiums: condominiumsData.length,
          totalUnits,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to seed condominium demo data',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message },
      );
    }
  }

  /**
   * Asocia todos los condominios existentes al usuario SUPER_ADMIN
   */
  private async associateAllCondominiumsToSuperAdmin(): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
      const superAdmin = await this.userRepository.findOne({
        where: { email: adminEmail, role: Role.SUPER_ADMIN },
        relations: ['condominios'],
      });

      if (!superAdmin) {
        this.logger.warn(
          'Super admin user not found, skipping condominium association',
          CondominiumSeeder.name,
          { adminEmail },
        );
        return;
      }

      // Obtener todos los condominios activos
      const allCondominiums = await this.condominiumRepository.find({
        where: { isActive: true },
      });

      if (allCondominiums.length === 0) {
        return;
      }

      // Obtener IDs de condominios ya asociados
      const associatedIds = superAdmin.condominios?.map((c) => c.id) || [];

      // Filtrar condominios que no están asociados
      const condominiumsToAdd = allCondominiums.filter(
        (c) => !associatedIds.includes(c.id),
      );

      if (condominiumsToAdd.length === 0) {
        this.logger.log(
          'All condominiums already associated to super admin',
          CondominiumSeeder.name,
        );
        return;
      }

      // Asociar los condominios faltantes
      if (!superAdmin.condominios) {
        superAdmin.condominios = [];
      }
      superAdmin.condominios.push(...condominiumsToAdd);
      await this.userRepository.save(superAdmin);

      // Invalidar cache del usuario para forzar refresco de condominios
      await this.cache.invalidate(`user:${superAdmin.id}`);
      await this.cache.invalidate(`user:email:${superAdmin.email}`);

      this.logger.log(
        'All condominiums associated to super admin successfully',
        CondominiumSeeder.name,
        {
          userId: superAdmin.id,
          totalCondominiums: allCondominiums.length,
          newlyAssociated: condominiumsToAdd.length,
          condominiumNames: condominiumsToAdd.map((c) => c.name),
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to associate all condominiums to super admin',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message },
      );
    }
  }

  /**
   * Asocia un condominio al usuario SUPER_ADMIN
   */
  private async associateCondominiumToSuperAdmin(condominiumId: string): Promise<void> {
    try {
      // Buscar el usuario SUPER_ADMIN
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
      const superAdmin = await this.userRepository.findOne({
        where: { email: adminEmail, role: Role.SUPER_ADMIN },
        relations: ['condominios'],
      });

      if (!superAdmin) {
        this.logger.warn(
          'Super admin user not found, skipping condominium association',
          CondominiumSeeder.name,
          { adminEmail },
        );
        return;
      }

      // Verificar si ya está asociado
      const isAlreadyAssociated = superAdmin.condominios?.some(
        (c) => c.id === condominiumId,
      );

      if (isAlreadyAssociated) {
        this.logger.log(
          'Condominium already associated to super admin',
          CondominiumSeeder.name,
          { condominiumId, userId: superAdmin.id },
        );
        return;
      }

      // Obtener el condominio
      const condominium = await this.condominiumRepository.findOne({
        where: { id: condominiumId },
      });

      if (!condominium) {
        this.logger.warn(
          'Condominium not found for association',
          CondominiumSeeder.name,
          { condominiumId },
        );
        return;
      }

      // Asociar el condominio al super admin
      if (!superAdmin.condominios) {
        superAdmin.condominios = [];
      }
      superAdmin.condominios.push(condominium);
      await this.userRepository.save(superAdmin);

      // Invalidar cache del usuario para forzar refresco de condominios
      await this.cache.invalidate(`user:${superAdmin.id}`);
      await this.cache.invalidate(`user:email:${superAdmin.email}`);

      this.logger.log(
        'Condominium associated to super admin successfully',
        CondominiumSeeder.name,
        {
          condominiumId,
          condominiumName: condominium.name,
          userId: superAdmin.id,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to associate condominium to super admin',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message, condominiumId },
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
