import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ColorModule } from './modules/color/color.module';
import { SizeModule } from './modules/size/size.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { TypeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    // .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // typeorm config
    TypeOrmModule.forRoot(TypeOrmConfig),

    // modules
    AuthModule,
    UserModule,
    ProductModule,
    ColorModule,
    SizeModule,
    CategoryModule,
    CartModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
