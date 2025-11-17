import {
  type Product,
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type TransactionStats,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactionsBulk(transactions: InsertTransaction[]): Promise<Transaction[]>;
  getTransactionStats(): Promise<TransactionStats>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.products = new Map();
    this.transactions = new Map();
    this.initializeProducts();
  }

  // Initialize default products
  private initializeProducts() {
    const defaultProducts: InsertProduct[] = [
      { id: "milk", name: "Milk", category: "Dairy", price: "3.99" },
      { id: "bread", name: "Bread", category: "Bakery", price: "2.49" },
      { id: "eggs", name: "Eggs", category: "Dairy", price: "4.29" },
      { id: "cheese", name: "Cheese", category: "Dairy", price: "5.99" },
      { id: "butter", name: "Butter", category: "Dairy", price: "4.49" },
      { id: "coffee", name: "Coffee", category: "Beverages", price: "8.99" },
      { id: "tea", name: "Tea", category: "Beverages", price: "5.49" },
      { id: "chips", name: "Potato Chips", category: "Snacks", price: "3.29" },
      { id: "cookies", name: "Cookies", category: "Snacks", price: "4.99" },
      { id: "chicken", name: "Chicken Breast", category: "Meat", price: "7.99" },
      { id: "beef", name: "Ground Beef", category: "Meat", price: "6.99" },
      { id: "apples", name: "Apples", category: "Produce", price: "4.49" },
      { id: "bananas", name: "Bananas", category: "Produce", price: "2.99" },
      { id: "carrots", name: "Carrots", category: "Produce", price: "2.49" },
      { id: "tomatoes", name: "Tomatoes", category: "Produce", price: "3.79" },
    ];

    defaultProducts.forEach((product) => {
      this.products.set(product.id, product as Product);
    });
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = { ...product } as Product;
    this.products.set(product.id, newProduct);
    return newProduct;
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async createTransactionsBulk(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    for (const insertTransaction of insertTransactions) {
      const transaction = await this.createTransaction(insertTransaction);
      transactions.push(transaction);
    }
    return transactions;
  }

  async getTransactionStats(): Promise<TransactionStats> {
    const transactions = await this.getAllTransactions();
    const totalTransactions = transactions.length;
    
    if (totalTransactions === 0) {
      return {
        totalTransactions: 0,
        uniqueItems: 0,
        avgItemsPerTransaction: 0,
        mostFrequentItems: [],
      };
    }

    const itemCounts = new Map<string, number>();
    let totalItems = 0;

    transactions.forEach((transaction) => {
      totalItems += transaction.items.length;
      transaction.items.forEach((item) => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      });
    });

    const mostFrequentItems = Array.from(itemCounts.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTransactions,
      uniqueItems: itemCounts.size,
      avgItemsPerTransaction: totalItems / totalTransactions,
      mostFrequentItems,
    };
  }
}

export const storage = new MemStorage();
