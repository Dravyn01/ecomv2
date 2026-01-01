import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, User } from './entities/user.entity';
import { UserResponseDTO } from './dto/user-response.dto';
import { BaseUserDTO } from './dto/base-user.dto';
import { ImageService } from '../image/image.service';
import { CreateImageDTO } from '../image/dto/create-image.dto';
import { ImageOwnerType } from '../image/entities/image.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly imageService: ImageService,
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

  async getAllUser(): Promise<BaseUserDTO[]> {
    this.logger.log('getAllUser called');
    return await this.userRepo.find();
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`findByEmail called with email=${email}`);
    const user = await this.userRepo.findOneBy({ email });
    if (user) {
      this.logger.debug(`findByEmail success for email=${email}`);
      return user;
    }

    this.logger.error(`findByEmail user not found for email=${email}`);
    throw new NotFoundException('user not found');
  }

  async findOne(user_id: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['cart', 'orders'],
    });
    if (!user) throw new NotFoundException('not found user');
    return user;
  }

  async getProfile(email: string): Promise<UserResponseDTO> {
    return await this.findByEmail(email);
  }

  async checkRole(user_id: string, role: Role): Promise<Boolean> {
    const user = await this.userRepo.findOneBy({ id: user_id });
    if (!user) throw new NotFoundException('not found user');
    if (user.role === role) {
      return true;
    }
    return false;
  }

  async findConversation(user_id: string): Promise<string> {
    const exists = await this.userRepo.findOne({
      where: {
        id: user_id,
      },
      relations: ['conversation'],
    });
    if (!exists)
      throw new NotFoundException('not found conversation by this user');
    return exists.conversation.id;
  }

  async uploadProfile(user_id: string, image: CreateImageDTO): Promise<void> {
    await this.imageService.createImage({
      image,
      owner_id: user_id,
      owner_type: ImageOwnerType.PROFILE,
    });
  }
}
