import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role, User } from 'src/modules/user/entities/user.entity';
import { LoginHistory } from './entities/login-history.entity';
import { BaseUserDTO } from '../user/dto/base-user.dto';
import { aggregateByProduct } from 'src/utils/aggrerate-by-product';

@Injectable()
export class AuthService {
  private readonly className = 'auth.service';
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(LoginHistory)
    private readonly logHistory: Repository<LoginHistory>,
    private readonly jwtService: JwtService,
  ) {}

  /*
   * เส้นสมัครสมาชิก
   * รับข้อมูลผู้ใช้มา -> hash รหัสผ่านของผู้ใช้
   * บันทึกลงฐานข้อมูล
   */
  async register(req: RegisterDTO): Promise<BaseUserDTO> {
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

    return newUser;
  }

  /*
   * เส้นเข้าสู่ระบบ
   * รับข้อมูลผู้ใช้มา -> เช็คว่าอีเมลมีอยู่ในระบบไหม && รหัสผ่านตรงกันไหม
   * ถ้าตรงหมดออก token ให้
   */
  async login(user: User): Promise<{ accessToken: string }> {
    this.logger.log(`[${this.className}::login] service called!`);

    this.logger.debug(
      `[${this.className}::login] check user by user_id=${user.id}`,
    );

    // find exists history
    const existsHistory = await this.logHistory.findOne({
      where: {
        user: { id: user.id },
      },
      order: { last_login_at: 'DESC' },
    });

    this.logger.debug(
      `[${this.className}::login] ${existsHistory ? `founded user (data=${JSON.stringify(existsHistory)})` : `not found history of user_id=${user.id}. will insert first history`}`,
    );

    // save history
    await this.logHistory.save({
      user: { id: user.id },
      count: existsHistory ? existsHistory.count + 1 : 1,
      last_login_at: new Date(),
    });

    // jwt payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: Role.USER,
    };

    const token = this.jwtService.sign(payload);
    this.logger.debug(`[${this.className}::login] accessToken generated`);

    return { accessToken: token };
  }
}
