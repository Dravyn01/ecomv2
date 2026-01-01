import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    // import typeorm and use user entity in user model
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ImageModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, LocalStrategy],
  exports: [UserService],
})
export class UserModule {}
