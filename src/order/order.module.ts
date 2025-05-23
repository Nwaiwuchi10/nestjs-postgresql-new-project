import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import {
  BillingInfo,
  Order,
  OrderItem,
  Paystack,
} from './entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { MailService } from './Services/mail.service';
import { PaystackService } from './paystack.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Auth,
      BillingInfo,
      Paystack,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, MailService, PaystackService],
})
export class OrderModule {}
