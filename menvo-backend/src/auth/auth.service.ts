import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRegister } from './types/auth.type';
import { AuthLoginDto } from './dto/auth.dto';
import { HashService } from '../common/services/hash.service';
import { TokenService } from '../common/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private jwtTokenService: TokenService,
  ) {}

  async register({ name, email, password }: TRegister) {
    if (!email || !password || !name) {
      throw new BadRequestException('All fields must be filled');
    }

    const existedUser = await this.prisma.user.findFirst({ where: { email } });
    if (existedUser) {
      throw new ConflictException(`User with ${email} already exists`);
    }

    const hashed = await this.hashService.hash(password);
    await this.prisma.user.create({
      data: { name, email, passwordHash: hashed },
    });

    return {
      message: 'User registered successfully',
      success: true,
    };
  }

  async login({ email, password }: AuthLoginDto) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await this.hashService.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = await this.jwtTokenService.GenerateJwtAccessToken({
      userId: user.id,
      email: user.email,
    });
    return {
      message: 'Login successful',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
