import { envConfig } from './env/env.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envConfig,
    }),
  ],
})
export class ConfigationModule {}
