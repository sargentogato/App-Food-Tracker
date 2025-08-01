import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async create(createProductDto: CreateProductDto) {
    const createdProduct = new this.productModel(createProductDto);
    return await createdProduct.save();
  }

  async findAll() {
    return await this.productModel.find().exec();
  }

  async findOne(id: string) {
    const foundProduct = await this.productModel.findById(id);
    if (!foundProduct) {
      throw new HttpException('producto not found', 404);
    }
    return foundProduct;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
