import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';
import { Condominium } from './entities/condominium.entity';
import { Building } from '../buildings/entities/building.entity';
import { Unit } from '../units/entities/unit.entity';
import { User } from '../users/entities/user.entity';
import { CondominiumSeeder } from '@libs/database/seeders/condominium.seeder';
import { RedisModule } from '@libs/infrastructure/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Condominium, Building, Unit, User]), RedisModule],
  controllers: [CondominiumsController],
  providers: [CondominiumsService, CondominiumSeeder],
  exports: [CondominiumsService],
})
export class CondominiumsModule {}
