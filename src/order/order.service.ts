import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaystackService } from './paystack.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MailService } from './Services/mail.service';
import { Repository } from 'typeorm';
import {
  BillingInfo,
  Order,
  OrderItem,
  PaymentStatus,
  Paystack,
} from './entities/order.entity';
import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
const ImageKit = require('imagekit');
@Injectable()
export class OrderService {
  private readonly logger = new Logger(PaystackService.name);
  private PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';
  private imagekit: ImageKit;
  constructor(
    @InjectRepository(Order) private OrderRepository: Repository<Order>,
    //  @InjectRepository(AdminUser.name)
    // private readonly AdminUserModel: Repository<AdminUser>,
    @InjectRepository(Product)
    private readonly ProductRepository: Repository<Product>,
    @InjectRepository(Auth) private AuthRepository: Repository<Auth>,
    @InjectRepository(BillingInfo)
    private billingInfoRepository: Repository<BillingInfo>,
    @InjectRepository(Paystack)
    private PaystackRepository: Repository<Paystack>,
    @InjectRepository(OrderItem)
    private OrderItemRepository: Repository<OrderItem>,
    private readonly configService: ConfigService,
    private readonly paystackService: PaystackService,
    private mailService: MailService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const { orderItems, billingInfo, redirect_url, projectDsc } =
      createOrderDto;

    const user = await this.AuthRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    let grandTotal = 0;
    const savedOrderItems: OrderItem[] = [];

    // Create OrderItems
    for (const item of orderItems) {
      const product = await this.ProductRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const totalPrice = Number(product.price) * item.totalQuantity;
      grandTotal += totalPrice;

      const orderItem = this.OrderItemRepository.create({
        product,
        totalQuantity: item.totalQuantity,
        totalPrice,
      });

      const savedItem = await this.OrderItemRepository.save(orderItem);
      savedOrderItems.push(savedItem);
    }

    // Save billing info
    const billingInfoEntity = this.billingInfoRepository.create(billingInfo);
    const savedBillingInfo =
      await this.billingInfoRepository.save(billingInfoEntity);

    // Initialize Paystack
    const paystackInit = await this.paystackService.initializePayment(
      userId,
      grandTotal,
      redirect_url,
    );

    if (!paystackInit?.data?.reference) {
      throw new BadRequestException('Failed to initialize Paystack payment');
    }

    const paystackEntity = this.PaystackRepository.create({
      user,
      reference: paystackInit.data.reference,
      authorization_url: paystackInit.data.authorization_url,
      access_code: paystackInit.data.access_code,
      transactionStatus: 'pending',
      status: PaymentStatus.NOT_PAID,
      orderItems: savedOrderItems,
      amount: grandTotal,
      email: user.email,
      billingInfo: savedBillingInfo,
    });

    const savedPaystack = await this.PaystackRepository.save(paystackEntity);

    // Create Order
    const orderEntity = this.OrderRepository.create({
      user,
      orderItems: savedOrderItems,
      billingInfo: savedBillingInfo,
      payStackPayment: savedPaystack,
      redirect_url,
      isPaid: false,
      grandTotal,
      projectDsc,
    });

    const savedOrder = await this.OrderRepository.save(orderEntity);

    // Send Confirmation Email
    try {
      await this.mailService.ConfirmOrder(
        user.email,
        user.firstName,
        user.lastName,
        grandTotal,
        paystackInit.data.reference,
      );
    } catch (err) {
      console.error(`Email send failed: ${err.message}`);
      // Optional: do not block order creation on email failure
    }

    return {
      message: 'Order created successfully. Proceed to Paystack for payment.',
      reference: paystackInit.data.reference,
      access_code: paystackInit.data.access_code,
      authorization_url: paystackInit.data.authorization_url,
      orderId: savedOrder.id,
      orderItems: savedOrderItems,
      billingInfo: savedBillingInfo,
      grandTotal,
      projectDsc,
      userId,
      email: user.email,
      redirect_url,
    };
  }

  // async createOrder(createOrderDTO: CreateOrderDto, userId: number) {
  //   const { orderItems, billingInfo, redirect_url, projectDsc } = createOrderDTO;

  //   const user = await this.AuthRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new BadRequestException(`User with ID ${userId} not found`);
  //   }

  //   let grandTotal = 0;
  //   const savedOrderItems: OrderItem[] = [];

  //   // Create and save OrderItems
  //   for (const item of orderItems) {
  //     const product = await this.ProductRepository.findOne({
  //       where: { id: item.productId },
  //     });

  //     if (!product) {
  //       throw new BadRequestException(`Product with ID ${item.productId} not found`);
  //     }

  //     const totalPrice = Number(product.price) * item.totalQuantity;
  //     grandTotal += totalPrice;

  //     const orderItem = this.OrderItemRepository.create({
  //       product,
  //       totalQuantity: item.totalQuantity,
  //       totalPrice,
  //     });

  //     const savedItem = await this.orderItemRepository.save(orderItem);
  //     savedOrderItems.push(savedItem);
  //   }

  //   // Initialize Paystack
  //   const paystackResponse = await this.paystackService.initializePayment(
  //     userId,
  //     grandTotal,
  //     redirect_url,
  //   );

  //   if (!paystackResponse.data.reference) {
  //     throw new BadRequestException('Failed to generate Paystack reference');
  //   }

  //   // Save billing info
  //   const savedBillingInfo = await this.billingInfoRepository.save(
  //     this.billingInfoRepository.create(billingInfo),
  //   );

  //   // Save Paystack Payment
  //   const paystack = this.PaystackRepository.create({
  //     user,
  //     reference: paystackResponse.data.reference,
  //     authorization_url: paystackResponse.data.authorization_url,
  //     access_code: paystackResponse.data.access_code,
  //     amount: grandTotal,
  //     transactionStatus: 'pending',
  //     status: PaymentStatus.NOT_PAID,
  //     orderItems: savedOrderItems,
  //     email: user.email,
  //     billingInfo: savedBillingInfo,
  //   });

  //   const savedPaystack = await this.PaystackRepository.save(paystack);

  //   // Create final order
  //   const order = this.OrderRepository.create({
  //     user,
  //     orderItems: savedOrderItems,
  //     billingInfo: savedBillingInfo,
  //     payStackPayment: savedPaystack,
  //     redirect_url,
  //     isPaid: false,
  //     grandTotal,
  //     projectDsc,
  //   });

  //   const savedOrder = await this.OrderRepository.save(order);

  //   try {
  //     await this.mailService.ConfirmOrder(
  //       user.email,
  //       user.firstName,
  //       user.lastName,
  //       grandTotal,
  //       paystackResponse.data.reference,
  //     );
  //   } catch (error) {
  //     throw new Error(`Failed to send email to ${user.email}`);
  //   }

  //   return {
  //     message: 'Order created successfully, complete payment using Paystack',
  //     reference: paystackResponse.data.reference,
  //     access_code: paystackResponse.data.access_code,
  //     authorization_url: paystackResponse.data.authorization_url,
  //     orderId: savedOrder.id,
  //     orderItems: savedOrderItems,
  //     billingInfo: savedBillingInfo,
  //     redirect_url,
  //     projectDsc,
  //     userId,
  //     email: user.email,
  //     amount: grandTotal,
  //   };
  // }

  // async createOrder(createOrderDTO: CreateOrderDto, userId: number) {
  //   if (!this.paystackService) {
  //     throw new Error('PaystackService is not initialized'); // Debugging line
  //   }
  //   const { orderItems, billingInfo, redirect_url, projectDsc } =
  //     createOrderDTO;

  //   const user: any = await this.AuthRepository.findOne({
  //     where: { id: userId },
  //   });
  //   if (!user)
  //     throw new BadRequestException(`User with ID ${userId} not found`);

  //   let grandTotal = 0;

  //   for (const item of orderItems) {
  //     const product = await this.ProductRepository.findOne({
  //       where: { id: item.productId },
  //     });
  //     if (!product)
  //       throw new BadRequestException(
  //         `Creative Product with ID ${item.productId} not found`,
  //       );

  //     item.totalPrice = product.price * item.totalQuantity;
  //     grandTotal += item.totalPrice;
  //   }

  //   // Initialize Paystack Payment
  //   const paystackResponse = await this.paystackService.initializePayment(
  //     userId,
  //     grandTotal,
  //     redirect_url,
  //   );
  //   if (!paystackResponse.data.reference) {
  //     throw new BadRequestException(
  //       'Failed to generate Paystack payment reference.',
  //     );
  //   }

  //   // Save order to database
  //   const newOrder: any = this.OrderRepository.create({
  //     userId,
  //     orderItems,
  //     billingInfo,
  //     grandTotal,
  //     redirect_url,
  //     projectDsc,
  //     payStackPayment: {
  //       userId,
  //       email: user.email,
  //       billingInfo,
  //       reference: paystackResponse.data.reference,
  //       authorization_url: paystackResponse.data.authorization_url,
  //       access_code: paystackResponse.data.access_code,
  //       amount: grandTotal,
  //       transactionStatus: 'pending',
  //       status: 'notPaid',
  //       orderItems,
  //     },
  //   });

  //   await this.OrderRepository.save(newOrder);
  //   // await newOrder.save();
  //   const email = user.email;
  //   const firstName = user.firstName;
  //   const lastName = user.lastName;
  //   const amount = grandTotal;
  //   const reference = paystackResponse.data.reference;

  //   try {
  //     await this.mailService.ConfirmOrder(
  //       email,
  //       firstName,
  //       lastName,
  //       amount,
  //       reference,
  //     );
  //   } catch (error) {
  //     throw new Error(`Failed to send email to ${email}`);
  //   }

  //   return {
  //     message: 'Order created successfully, complete payment using Paystack',
  //     reference: paystackResponse.data.reference,
  //     access_code: paystackResponse.data.access_code,
  //     authorization_url: paystackResponse.data.authorization_url,
  //     orderId: newOrder.id,
  //     orderItems,
  //     billingInfo,
  //     redirect_url,
  //     projectDsc,
  //     userId,
  //     email: user.email,
  //     amount: grandTotal,
  //   };
  // }
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
