import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  // creative-products.service.ts

  async findAll(query: any): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const [data, total] = await this.productRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      relations: ['postedBy'],
      take: resPerPage,
      skip: skip,
    });

    // Optionally remove password from postedBy
    const cleanedData = data.map((product) => {
      if (product.postedBy) {
        const { password, ...safeUser } = product.postedBy;
        return { ...product, postedBy: safeUser };
      }
      return product;
    });

    return {
      data: cleanedData,
      total,
      currentPage,
      totalPages: Math.ceil(total / resPerPage),
    };
  }

  createNew(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAlls() {
    return `This action returns all product`;
  }

  async findOne(id: string) {
    const data = await this.productRepository.findOne({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Product not found');
    }
    return data;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
