import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import slugify from 'slugify';
import { Auth } from 'src/auth/entities/auth.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: ['Image', 'Audio', 'Video', 'Other'],
    default: 'Other',
  })
  fileType: string;

  @Column({ type: 'text', array: true, nullable: true })
  fileUrl: string[];

  @Column({ type: 'text', array: true, default: [] })
  views: string[];

  @ManyToOne(() => Auth, { eager: true })
  @JoinColumn({ name: 'postedBy' })
  postedBy: Auth;

  @Column({ unique: true, nullable: true })
  slug: string;

  @OneToMany(() => Comment, (comment) => comment.product, {
    cascade: true,
    eager: true,
  })
  comments: Comment[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', array: true, default: [] })
  productBenefits: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async generateSlug() {
    if (this.title) {
      const baseSlug = slugify(this.title, { lower: true, strict: true });
      this.slug = baseSlug;
      // Check for uniqueness in service
    }
  }
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Auth, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: Auth;

  @ManyToOne(() => Product, (product) => product.comments)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'text' })
  commentText: string;

  @CreateDateColumn()
  createdAt: Date;
}
