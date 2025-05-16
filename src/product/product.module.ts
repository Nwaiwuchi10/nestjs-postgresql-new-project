import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Auth])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
