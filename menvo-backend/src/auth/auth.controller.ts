import { Controller, Get, Body, Post } from '@nestjs/common';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() { name, email, password }: AuthRegisterDto) {
    return this.auth.register({ name, email, password });
  }

  @Post('login')
  login(@Body() { email, password }: AuthLoginDto) {
    return this.auth.login({ email, password });
  }
}
