import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from './dto/user.response';
import { toUserResponse } from 'src/common/mapper/user.mapper';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.debug(`validateUser called with email=${email}`);

    const user = await this.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.log(`validateUser success for email=${email}`);
      return user;
    }

    this.logger.error(`validateUser failed for email=${email}`);
    throw new UnauthorizedException('invalid email or password');
  }

  async getAllUser(): Promise<UserResponse[]> {
    this.logger.log('getAllUser called');
    const users = await this.userRepository.find();
    return users.map(toUserResponse);
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`findByEmail called with email=${email}`);
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      this.logger.debug(`findByEmail success for email=${email}`);
      return user;
    }

    this.logger.error(`findByEmail user not found for email=${email}`);
    throw new NotFoundException('user not found');
  }

  async getProfile(email: string): Promise<UserResponse> {
    this.logger.log(`getProfile called with email=${email}`);
    const user = await this.findByEmail(email);
    return toUserResponse(user);
  }
}
