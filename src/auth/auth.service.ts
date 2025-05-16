import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly AuthRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    const { email } = createAuthDto;
    const userExist = await this.AuthRepository.findOne({
      where: { email },
    });
    if (userExist) {
      throw new BadRequestException('User Already exist');
    }
    const newUser = this.AuthRepository.create(createAuthDto);
    await this.AuthRepository.save(newUser);
    const token = await this.generateJWT(newUser);

    // Return user data and token
    return {
      user: newUser,
      accessToken: token,
    };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.AuthRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = await this.generateJWT(user);
    return { token, user };
  }

  async generateJWT(user: Auth) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
