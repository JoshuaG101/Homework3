import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AprioriAlgorithm } from "./apriori";
import { insertTransactionSchema } from "@shared/schema";
import type { MiningConfig, MiningResult } from "@shared/schema";

// Store mining results in memory
let lastMiningResult: MiningResult | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Transactions endpoints
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validated = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validated);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.post("/api/transactions/import", async (req, res) => {
    try {
      const { transactions: transactionsData } = req.body as {
        transactions: { items: string[] }[];
      };

      if (!Array.isArray(transactionsData)) {
        return res.status(400).json({ 
          error: "Invalid data format: expected array of transactions" 
        });
      }

      if (transactionsData.length === 0) {
        return res.status(400).json({ 
          error: "No transactions to import" 
        });
      }

      const validated = [];
      const errors = [];
      
      for (let i = 0; i < transactionsData.length; i++) {
        try {
          const valid = insertTransactionSchema.parse(transactionsData[i]);
          if (valid.items.length > 0) {
            validated.push(valid);
          }
        } catch (err) {
          errors.push(`Transaction ${i + 1}: Invalid format`);
        }
      }

      if (validated.length === 0) {
        return res.status(400).json({ 
          error: "No valid transactions found",
          details: errors.slice(0, 5),
        });
      }

      const transactions = await storage.createTransactionsBulk(validated);
      
      res.json({
        success: true,
        count: transactions.length,
        transactions,
        skipped: transactionsData.length - validated.length,
      });
    } catch (error) {
      console.error("Error importing transactions:", error);
      res.status(400).json({ 
        error: "Failed to import transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/transactions/stats", async (req, res) => {
    try {
      const stats = await storage.getTransactionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Mining endpoints
  app.post("/api/mining/run", async (req, res) => {
    try {
      const config = req.body as MiningConfig;
      
      if (
        typeof config.minSupport !== "number" ||
        typeof config.minConfidence !== "number"
      ) {
        return res.status(400).json({ error: "Invalid configuration: missing parameters" });
      }

      if (config.minSupport <= 0 || config.minSupport > 1) {
        return res.status(400).json({ 
          error: "Invalid configuration: minSupport must be between 0 and 1" 
        });
      }

      if (config.minConfidence <= 0 || config.minConfidence > 1) {
        return res.status(400).json({ 
          error: "Invalid configuration: minConfidence must be between 0 and 1" 
        });
      }

      const startTime = Date.now();
      const transactions = await storage.getAllTransactions();
      
      if (transactions.length === 0) {
        return res.status(400).json({ 
          error: "No transactions available for mining. Please create some transactions first." 
        });
      }

      const transactionItems = transactions.map((t) => t.items);
      const apriori = new AprioriAlgorithm(transactionItems, config);
      const { itemsets, rules } = apriori.run();
      const processingTime = Date.now() - startTime;

      lastMiningResult = {
        frequentItemsets: itemsets,
        rules,
        totalTransactions: transactions.length,
        processingTime,
      };

      res.json({
        success: true,
        result: lastMiningResult,
      });
    } catch (error) {
      console.error("Error running mining:", error);
      res.status(500).json({ 
        error: "Failed to run mining algorithm",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/mining/results", async (req, res) => {
    try {
      if (!lastMiningResult) {
        return res.status(404).json({ error: "No results available" });
      }
      res.json(lastMiningResult);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
