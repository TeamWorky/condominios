import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonSpace } from './entities/common-space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommonSpace])],
  exports: [TypeOrmModule],
})
export class CommonSpacesModule {}
