import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  RelationId,
} from 'typeorm';
import { PaymentStatus } from '../dto/paystack.payment.dto';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn()
  product: Product;

  @Column({ type: 'int', default: 1 })
  totalQuantity: number;

  @Column({ type: 'float', default: 0.0 })
  totalPrice: number;
}

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auth)
  @JoinColumn()
  user: Auth;

  @Column({ nullable: true })
  commentText: string;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
export class DeliveryStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auth)
  @JoinColumn()
  user: Auth;

  @Column({
    type: 'enum',
    enum: ['ongoing', 'delivered', 'on-review'],
    default: 'ongoing',
  })
  deliveryStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
export class DeliveryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auth)
  @JoinColumn()
  user: Auth;

  @Column({ nullable: true })
  commentText: string;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
export class BillingInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  date: Date;
}

@Entity()
export class Paystack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  authorization_url: string;

  @Column({ nullable: true })
  access_code: string;

  @Column({ nullable: true })
  transactionStatus: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.notPaid })
  status: PaymentStatus;

  @OneToMany(() => OrderItem, () => OrderItem, { cascade: true, eager: true })
  orderItems: OrderItem[];

  @Column({ type: 'float', default: 0.0 })
  amount: number;

  @Column({ nullable: true })
  email: string;

  @ManyToOne(() => Auth, { nullable: true })
  @JoinColumn()
  user: Auth;

  @OneToOne(() => BillingInfo, { cascade: true, nullable: true, eager: true })
  @JoinColumn()
  billingInfo: BillingInfo;

  @CreateDateColumn()
  date: Date;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auth)
  @JoinColumn()
  user: Auth;

  @Column({ nullable: true })
  paymentMethod: string;

  @OneToMany(() => OrderItem, () => OrderItem, { cascade: true, eager: true })
  orderItems: OrderItem[];

  @OneToOne(() => BillingInfo, { cascade: true, nullable: true, eager: true })
  @JoinColumn()
  billingInfo: BillingInfo;

  @OneToOne(() => Paystack, { cascade: true, nullable: true, eager: true })
  @JoinColumn()
  payStackPayment: Paystack;

  @Column({ nullable: true })
  redirect_url: string;

  @Column({ default: false })
  isPaid: boolean;

  @OneToOne(() => DeliveryStatus, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  deliveryStatus: DeliveryStatus;

  @Column({ type: 'float', default: 0.0 })
  grandTotal: number;

  @Column({ nullable: true })
  projectDsc: string;

  @OneToMany(() => Comment, () => Comment, { cascade: true, eager: true })
  comments: Comment[];

  @OneToMany(() => DeliveryComment, () => DeliveryComment, {
    cascade: true,
    eager: true,
  })
  deliveryComment: DeliveryComment[];

  @Column({ nullable: true })
  amountPaid: string;

  @Column({ nullable: true })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
