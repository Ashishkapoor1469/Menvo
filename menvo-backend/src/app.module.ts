import { Module } from '@nestjs/common';
import { ConfigationModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RestrauntModule } from './restaurant/restaurant.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    ConfigationModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    RestrauntModule,
    CategoryModule,
    MenuModule,
  ],
})
export class AppModule {}
