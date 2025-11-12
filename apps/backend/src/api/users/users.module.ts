import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DataModule],
})
export class UsersModule {}
