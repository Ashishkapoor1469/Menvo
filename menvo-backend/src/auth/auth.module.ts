import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtGuard } from './guards/jwt.guard';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtGuard],
})
export class AuthModule {}
