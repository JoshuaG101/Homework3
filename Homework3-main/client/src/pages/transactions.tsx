import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Receipt, Upload, ChevronDown, Database, TrendingUp } from "lucide-react";
import { Transaction, TransactionStats } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Transactions() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: stats } = useQuery<TransactionStats>({
    queryKey: ["/api/transactions/stats"],
  });

  const importTransactions = useMutation({
    mutationFn: async (data: { transactions: { items: string[] }[] }) => {
      return await apiRequest("POST", "/api/transactions/import", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/stats"] });
      toast({
        title: "Import successful",
        description: `Imported ${data.count} transactions`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import transactions from CSV",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      try {
        const lines = text.trim().split("\n");
        
        // Skip header if present (check if first line contains common header words)
        const startIndex = lines[0]?.toLowerCase().includes('item') || 
                          lines[0]?.toLowerCase().includes('product') ||
                          lines[0]?.toLowerCase().includes('transaction') ? 1 : 0;
        
        const transactions = lines
          .slice(startIndex)
          .filter((line) => line.trim())
          .map((line, index) => {
            const items = line.split(",").map((item) => item.trim()).filter(Boolean);
            if (items.length === 0) {
              console.warn(`Empty transaction at line ${startIndex + index + 1}`);
            }
            return { items };
          })
          .filter((t) => t.items.length > 0);

        if (transactions.length === 0) {
          toast({
            title: "Empty file",
            description: "No valid transactions found in CSV",
            variant: "destructive",
          });
          return;
        }

        importTransactions.mutate({ transactions });
      } catch (error) {
        console.error("CSV parse error:", error);
        toast({
          title: "Parse error",
          description: "Failed to parse CSV file. Ensure format is: item1,item2,item3 per line",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-medium mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage shopping transactions for analysis
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Receipt className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-medium" data-testid="stat-total-transactions">
                  {stats.totalTransactions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for mining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Items</CardTitle>
                <Database className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-medium" data-testid="stat-unique-items">
                  {stats.uniqueItems}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Distinct products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Items/Transaction</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-medium" data-testid="stat-avg-items">
                  {stats.avgItemsPerTransaction.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average basket size
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Import CSV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-md"
                data-testid="input-csv-file"
                disabled={importTransactions.isPending}
              />
              <Button
                variant="outline"
                disabled={importTransactions.isPending}
                data-testid="button-upload"
              >
                {importTransactions.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a CSV file with transaction data. Format: one transaction per line, items
              separated by commas.
            </p>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-1">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Create transactions from the Shop page or import CSV data
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <Collapsible
                    key={transaction.id}
                    open={expandedId === transaction.id}
                    onOpenChange={(open) => setExpandedId(open ? transaction.id : null)}
                  >
                    <Card className="hover-elevate" data-testid={`transaction-${transaction.id}`}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Receipt className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-mono text-sm text-muted-foreground">
                                  {transaction.id.slice(0, 8)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.timestamp), "PPp")}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">
                                {transaction.items.length} items
                              </Badge>
                              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="border-t pt-4">
                            <div className="text-sm font-medium mb-2">Items:</div>
                            <div className="flex flex-wrap gap-2">
                              {transaction.items.map((item, idx) => (
                                <Badge key={idx} variant="outline">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
