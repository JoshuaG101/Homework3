import { FrequentItemset, AssociationRule, MiningConfig } from "@shared/schema";

type ItemsetMap = Map<string, number>;

export class AprioriAlgorithm {
  private transactions: string[][];
  private minSupport: number;
  private minConfidence: number;
  private totalTransactions: number;

  constructor(transactions: string[][], config: MiningConfig) {
    this.transactions = transactions;
    this.minSupport = config.minSupport;
    this.minConfidence = config.minConfidence;
    this.totalTransactions = transactions.length;
  }

  // Main algorithm execution
  run(): { itemsets: FrequentItemset[]; rules: AssociationRule[] } {
    const frequentItemsets = this.findFrequentItemsets();
    const rules = this.generateAssociationRules(frequentItemsets);
    return { itemsets: frequentItemsets, rules };
  }

  // Find all frequent itemsets
  private findFrequentItemsets(): FrequentItemset[] {
    const allFrequentItemsets: FrequentItemset[] = [];
    let k = 1;
    let currentItemsets = this.generateCandidates1();

    while (currentItemsets.size > 0) {
      const frequentK = this.filterFrequentItemsets(currentItemsets);
      
      if (frequentK.length === 0) break;
      
      allFrequentItemsets.push(...frequentK);
      
      // Continue generating larger itemsets as long as we have candidates
      if (frequentK.length === 1) {
        // Only one frequent itemset of this size, cannot generate larger ones
        break;
      }
      
      currentItemsets = this.generateCandidatesK(frequentK, k + 1);
      k++;
    }

    return allFrequentItemsets;
  }

  // Generate 1-itemset candidates
  private generateCandidates1(): ItemsetMap {
    const candidates = new Map<string, number>();

    this.transactions.forEach((transaction) => {
      transaction.forEach((item) => {
        const key = JSON.stringify([item]);
        candidates.set(key, (candidates.get(key) || 0) + 1);
      });
    });

    return candidates;
  }

  // Generate k-itemset candidates from (k-1)-frequent itemsets
  private generateCandidatesK(
    frequentItemsets: FrequentItemset[],
    k: number
  ): ItemsetMap {
    const candidates = new Map<string, number>();
    const items = frequentItemsets.map((itemset) => itemset.items);

    // Self-join step
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const union = [...new Set([...items[i], ...items[j]])].sort();
        
        if (union.length === k) {
          const key = JSON.stringify(union);
          
          // Prune step: check if all (k-1)-subsets are frequent
          if (this.hasFrequentSubsets(union, frequentItemsets)) {
            const count = this.countSupport(union);
            if (count > 0) {
              candidates.set(key, count);
            }
          }
        }
      }
    }

    return candidates;
  }

  // Check if all (k-1)-subsets of itemset are frequent
  private hasFrequentSubsets(
    itemset: string[],
    frequentItemsets: FrequentItemset[]
  ): boolean {
    if (itemset.length <= 1) return true;

    const frequentSets = new Set(
      frequentItemsets.map((f) => JSON.stringify(f.items.sort()))
    );

    for (let i = 0; i < itemset.length; i++) {
      const subset = [...itemset.slice(0, i), ...itemset.slice(i + 1)].sort();
      if (!frequentSets.has(JSON.stringify(subset))) {
        return false;
      }
    }

    return true;
  }

  // Count support for an itemset
  private countSupport(itemset: string[]): number {
    return this.transactions.filter((transaction) =>
      itemset.every((item) => transaction.includes(item))
    ).length;
  }

  // Filter itemsets that meet minimum support
  private filterFrequentItemsets(candidates: ItemsetMap): FrequentItemset[] {
    const frequent: FrequentItemset[] = [];
    const minCount = Math.ceil(this.minSupport * this.totalTransactions);

    candidates.forEach((count, key) => {
      if (count >= minCount) {
        const items = JSON.parse(key) as string[];
        frequent.push({
          items,
          support: count / this.totalTransactions,
          count,
        });
      }
    });

    return frequent;
  }

  // Generate association rules from frequent itemsets
  private generateAssociationRules(
    frequentItemsets: FrequentItemset[]
  ): AssociationRule[] {
    const rules: AssociationRule[] = [];

    // Only generate rules from itemsets with 2+ items
    const multiItemsets = frequentItemsets.filter((itemset) => itemset.items.length >= 2);

    multiItemsets.forEach((itemset) => {
      const subsets = this.generateSubsets(itemset.items);
      
      subsets.forEach((antecedent) => {
        if (antecedent.length === 0 || antecedent.length === itemset.items.length) {
          return;
        }

        const consequent = itemset.items.filter((item) => !antecedent.includes(item));
        
        if (consequent.length === 0) return;

        const antecedentSupport = this.calculateSupport(antecedent);
        const confidence = itemset.support / antecedentSupport;

        if (confidence >= this.minConfidence) {
          const consequentSupport = this.calculateSupport(consequent);
          const lift = confidence / consequentSupport;

          rules.push({
            antecedent: antecedent.sort(),
            consequent: consequent.sort(),
            support: itemset.support,
            confidence,
            lift,
          });
        }
      });
    });

    return rules.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate all non-empty subsets of an itemset
  private generateSubsets(items: string[]): string[][] {
    const subsets: string[][] = [];
    const n = items.length;
    const totalSubsets = Math.pow(2, n);

    for (let i = 1; i < totalSubsets - 1; i++) {
      const subset: string[] = [];
      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          subset.push(items[j]);
        }
      }
      subsets.push(subset);
    }

    return subsets;
  }

  // Calculate support for an itemset
  private calculateSupport(itemset: string[]): number {
    const count = this.countSupport(itemset);
    return count / this.totalTransactions;
  }
}
