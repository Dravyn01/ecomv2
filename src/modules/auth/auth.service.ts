import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { RegisterRequest } from './dto/register.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from 'src/modules/user/dto/user.response';
import { toUserResponse } from 'src/common/mapper/user.mapper';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /*
   * เส้นสมัครสมาชิก
   * รับข้อมูลผู้ใช้มา -> hash รหัสผ่านของผู้ใช้
   * บันทึกลงฐานข้อมูล
   *
   * TODO:
   * - เช็คว่าบัญชีนี้มีอยู่ในระบบหรือป่าว
   */
  async register(req: RegisterRequest): Promise<UserResponse> {
    this.logger.log('[AuthService][register] - Start process');

    const is_existing = await this.userRepo.existsBy({ email: req.email });

    if (is_existing) {
      throw new ConflictException('existing email');
    }

    const hash_password = await bcrypt.hash(req.password, 10);
    this.logger.debug('[AuthService][register] - Hashed password generated');

    const user = this.userRepo.create({
      username: req.username,
      email: req.email,
      password: hash_password,
    });

    this.logger.debug(
      `[AuthService][register] - User entity created: ${JSON.stringify(user)}`,
    );

    const saved_user = await this.userRepo.save(user);

    this.logger.log(
      `[AuthService][register] - User registered successfully: ${saved_user.email}`,
    );

    return toUserResponse(user);
  }

  /*
   * เส้นเข้าสู่ระบบ
   * รับข้อมูลผู้ใช้มา -> เช็คว่าอีเมลมีอยู่ในระบบไหม && รหัสผ่านตรงกันไหม
   * ถ้าตรงหมดออก token ให้
   */
  async login(user: User): Promise<{ accessToken: string }> {
    this.logger.log('[AuthService][login] - Start process');

    const payload = {
      sub: user.id,
      email: user.email,
    };

    this.logger.debug(
      `[AuthService][login] - Payload for token: ${JSON.stringify(payload)}`,
    );

    const token = this.jwtService.sign(payload);
    this.logger.debug(`[AuthService][login] - Token generated`);

    return { accessToken: token };
  }
}
