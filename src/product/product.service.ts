import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
const ImageKit = require('imagekit');
// import ImageKit from 'imagekit';
@Injectable()
export class ProductService {
  private imagekit: ImageKit;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async create(createProductDto: CreateProductDto, userId: number) {
    const {
      title,
      description,
      category,
      price,
      productBenefits,
      fileType,
      fileUrl = [],
    } = createProductDto;

    // Fetch the user entity using userId
    const user = await this.authRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check for existing product
    const existing = await this.productRepository.findOne({
      where: { title, category, postedBy: { id: userId } },
    });
    if (existing) {
      throw new BadRequestException('Product already created');
    }

    // Upload files to ImageKit
    const uploadedUrls: string[] = [];
    for (const file of fileUrl) {
      const uploaded = await this.imagekit.upload({
        file: file,
        fileName: `${title}-${Date.now()}`,
      });
      uploadedUrls.push(uploaded.url);
    }

    // Create and save the product
    const newProduct = this.productRepository.create({
      title,
      description,
      category,
      fileType,
      price,
      productBenefits,
      fileUrl: uploadedUrls,
      postedBy: user,
    });

    const savedProduct = await this.productRepository.save(newProduct);

    return {
      id: savedProduct.id,
      title: savedProduct.title,
      description: savedProduct.description,
      category: savedProduct.category,
      fileType: savedProduct.fileType,
      fileUrl: savedProduct.fileUrl,
      productBenefits: savedProduct.productBenefits,
      price: savedProduct.price,
      status: savedProduct.status,
      postedBy: savedProduct.postedBy,
      slug: savedProduct.slug,
    };
  }
  createNew(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
