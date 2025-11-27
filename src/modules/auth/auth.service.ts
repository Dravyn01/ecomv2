import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from 'src/modules/user/dto/user.response';
import { toUserResponse } from 'src/common/mapper/user.mapper';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly className = 'auth.service';
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
   */
  async register(req: RegisterDTO): Promise<UserResponse> {
    this.logger.log(`[${this.className}::register] service called!`);

    const user = await this.userRepo.existsBy({ email: req.email });
    if (user) {
      this.logger.log(
        `[${this.className}::register] not found user by email=${req.email}`,
      );
      throw new ConflictException('existing email');
    }

    const hash_password = await bcrypt.hash(req.password, 10);
    this.logger.log(`[${this.className}::register] hashed password`);

    const newUser = await this.userRepo.save({
      username: req.username,
      email: req.email,
      password: hash_password,
    });

    this.logger.log(
      `[${this.className}::register] register email=${req.email} success`,
    );

    return toUserResponse(newUser);
  }

  /*
   * เส้นเข้าสู่ระบบ
   * รับข้อมูลผู้ใช้มา -> เช็คว่าอีเมลมีอยู่ในระบบไหม && รหัสผ่านตรงกันไหม
   * ถ้าตรงหมดออก token ให้
   */
  async login(user: User): Promise<{ accessToken: string }> {
    this.logger.log(`[${this.className}::login] service called!`);

    const payload = {
      sub: user.id,
      email: user.email,
      role: 'admin',
    };

    const token = this.jwtService.sign(payload);
    this.logger.debug(`[${this.className}::login] accessToken generated`);

    return { accessToken: token };
  }
}
