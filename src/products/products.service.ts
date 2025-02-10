import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, userId: number) {
    try {
      return await this.prismaService.product.create({
        data: {
          ...createProductDto,
          user: { connect: { id: userId } },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getProducts() {
    try {
      return await this.prismaService.product.findMany();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
