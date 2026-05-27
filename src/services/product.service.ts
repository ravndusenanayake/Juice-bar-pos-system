import { prisma } from '../config/prisma';

export interface CreateProductInput {
  name: string;
  category_id: number;
  product_type: 'FINISHED' | 'RECIPE';
  price: number;
  quantity?: number;
  low_stock_threshold?: number;
  recipe_description?: string;
  image?: string;
  status?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  category_id?: number;
  product_type?: 'FINISHED' | 'RECIPE';
  price?: number;
  quantity?: number;
  low_stock_threshold?: number;
  recipe_description?: string;
  image?: string;
  status?: boolean;
}

export class ProductService {
  /**
   * Retrieve all products with their categories
   */
  async getProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Retrieve a single product by ID with its category
   */
  async getProductById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        category_id: data.category_id,
        product_type: data.product_type,
        price: data.price,
        quantity: data.quantity !== undefined ? data.quantity : 0,
        low_stock_threshold: data.low_stock_threshold !== undefined ? data.low_stock_threshold : 5,
        recipe_description: data.recipe_description || null,
        image: data.image || null,
        status: data.status !== undefined ? data.status : true,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category_id: data.category_id,
        product_type: data.product_type,
        price: data.price,
        quantity: data.quantity,
        low_stock_threshold: data.low_stock_threshold,
        recipe_description: data.recipe_description,
        image: data.image,
        status: data.status,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
