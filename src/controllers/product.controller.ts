import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';

const productService = new ProductService();
const categoryService = new CategoryService();

export class ProductController {
  /**
   * GET /api/products
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.getProducts();
      res.status(200).json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/products/:id
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json(product);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/products
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, category_id, product_type, price, quantity, low_stock_threshold, recipe_description, image, status } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Product name is required and must be a non-empty string' });
        return;
      }

      if (category_id === undefined || typeof category_id !== 'number' || isNaN(category_id)) {
        res.status(400).json({ error: 'Valid category_id is required' });
        return;
      }

      if (product_type !== 'FINISHED' && product_type !== 'RECIPE') {
        res.status(400).json({ error: "Product type must be either 'FINISHED' or 'RECIPE'" });
        return;
      }

      if (price === undefined || typeof price !== 'number' || price < 0) {
        res.status(400).json({ error: 'Price is required and must be a non-negative number' });
        return;
      }

      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity))) {
        res.status(400).json({ error: 'Quantity must be a non-negative integer' });
        return;
      }

      if (low_stock_threshold !== undefined && (typeof low_stock_threshold !== 'number' || low_stock_threshold < 0 || !Number.isInteger(low_stock_threshold))) {
        res.status(400).json({ error: 'Low stock threshold must be a non-negative integer' });
        return;
      }

      if (recipe_description !== undefined && typeof recipe_description !== 'string') {
        res.status(400).json({ error: 'Recipe description must be a string' });
        return;
      }

      // Verify category exists
      const category = await categoryService.getCategoryById(category_id);
      if (!category) {
        res.status(400).json({ error: `Category with ID ${category_id} does not exist` });
        return;
      }

      const product = await productService.createProduct({
        name: name.trim(),
        category_id,
        product_type,
        price,
        quantity,
        low_stock_threshold,
        recipe_description,
        image,
        status,
      });

      res.status(201).json(product);
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/products/:id
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const { name, category_id, product_type, price, quantity, low_stock_threshold, recipe_description, image, status } = req.body;

      const updatedData: any = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
          res.status(400).json({ error: 'Product name must be a non-empty string' });
          return;
        }
        updatedData.name = name.trim();
      }

      if (category_id !== undefined) {
        if (typeof category_id !== 'number' || isNaN(category_id)) {
          res.status(400).json({ error: 'Valid category_id must be a number' });
          return;
        }
        // Verify category exists
        const category = await categoryService.getCategoryById(category_id);
        if (!category) {
          res.status(400).json({ error: `Category with ID ${category_id} does not exist` });
          return;
        }
        updatedData.category_id = category_id;
      }

      if (product_type !== undefined) {
        if (product_type !== 'FINISHED' && product_type !== 'RECIPE') {
          res.status(400).json({ error: "Product type must be either 'FINISHED' or 'RECIPE'" });
          return;
        }
        updatedData.product_type = product_type;
      }

      if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
          res.status(400).json({ error: 'Price must be a non-negative number' });
          return;
        }
        updatedData.price = price;
      }

      if (quantity !== undefined) {
        if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
          res.status(400).json({ error: 'Quantity must be a non-negative integer' });
          return;
        }
        updatedData.quantity = quantity;
      }

      if (low_stock_threshold !== undefined) {
        if (typeof low_stock_threshold !== 'number' || low_stock_threshold < 0 || !Number.isInteger(low_stock_threshold)) {
          res.status(400).json({ error: 'Low stock threshold must be a non-negative integer' });
          return;
        }
        updatedData.low_stock_threshold = low_stock_threshold;
      }

      if (recipe_description !== undefined) {
        if (typeof recipe_description !== 'string') {
          res.status(400).json({ error: 'Recipe description must be a string' });
          return;
        }
        updatedData.recipe_description = recipe_description;
      }

      if (image !== undefined) updatedData.image = image;
      if (status !== undefined) updatedData.status = !!status;

      const product = await productService.updateProduct(id, updatedData);
      res.status(200).json(product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /api/products/:id
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      await productService.deleteProduct(id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
