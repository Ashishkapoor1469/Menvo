import { Global, Module } from '@nestjs/common';
import { HashService } from './services/hash.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GenerateSlug } from './services/generate-slug.service';
import { SortOrderService } from './services/sort-order.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [HashService, TokenService, GenerateSlug, SortOrderService],
  exports: [
    HashService,
    TokenService,
    JwtModule,
    GenerateSlug,
    SortOrderService,
  ],
})
export class CommonModule {}
