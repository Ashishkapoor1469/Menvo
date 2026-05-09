import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type TPayload = {
  userId: string;
  email: string;
};

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}
  async GenerateJwtAccessToken(payload: TPayload) {
    return await this.jwt.signAsync(payload, {
      expiresIn: '7d',
    });
  }
}
