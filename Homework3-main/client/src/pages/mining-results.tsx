import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TrendingUp, ArrowRight, ChevronDown, Activity, Zap, Clock } from "lucide-react";
import { MiningResult } from "@shared/schema";
import { useState } from "react";

export default function MiningResults() {
  const [expandedSize, setExpandedSize] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { data: result, isLoading } = useQuery<MiningResult>({
    queryKey: ["/api/mining/results"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-6">
          <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-medium mb-2">No Results Yet</h2>
          <p className="text-muted-foreground mb-4">
            Run the association rule mining algorithm from the Settings page to discover purchasing patterns.
          </p>
          <Button onClick={() => setLocation("/settings")} data-testid="button-go-to-settings">
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  const itemsetsBySize = result.frequentItemsets.reduce((acc, itemset) => {
    const size = itemset.items.length;
    if (!acc[size]) acc[size] = [];
    acc[size].push(itemset);
    return acc;
  }, {} as Record<number, typeof result.frequentItemsets>);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-medium mb-2">Mining Results</h1>
          <p className="text-muted-foreground">
            Association rules and frequent itemsets discovered by Apriori algorithm
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium" data-testid="stat-total-rules">
                {result.rules.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Discovered patterns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium" data-testid="stat-avg-confidence">
                {result.rules.length > 0
                  ? (
                      result.rules.reduce((sum, r) => sum + r.confidence, 0) /
                      result.rules.length *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rule strength
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium" data-testid="stat-processing-time">
                {result.processingTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Algorithm execution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Association Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Association Rules ({result.rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {result.rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No association rules found with current parameters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Antecedent</TableHead>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Consequent</TableHead>
                      <TableHead className="text-right">Support</TableHead>
                      <TableHead className="text-right">Confidence</TableHead>
                      <TableHead className="text-right">Lift</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rules.map((rule, idx) => (
                      <TableRow key={idx} data-testid={`rule-${idx}`}>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rule.antecedent.map((item, i) => (
                              <Badge key={i} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rule.consequent.map((item, i) => (
                              <Badge key={i} variant="default">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(rule.support * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(rule.confidence * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {rule.lift.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequent Itemsets */}
        <Card>
          <CardHeader>
            <CardTitle>
              Frequent Itemsets ({result.frequentItemsets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(itemsetsBySize)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([size, itemsets]) => (
                <Collapsible
                  key={size}
                  open={expandedSize === Number(size)}
                  onOpenChange={(open) => setExpandedSize(open ? Number(size) : null)}
                >
                  <Card className="hover-elevate">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium">
                            {size}-Itemsets
                            <span className="text-sm text-muted-foreground ml-2">
                              ({itemsets.length} found)
                            </span>
                          </div>
                          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4 space-y-2">
                          {itemsets.map((itemset, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                              data-testid={`itemset-${size}-${idx}`}
                            >
                              <div className="flex flex-wrap gap-1">
                                {itemset.items.map((item, i) => (
                                  <Badge key={i} variant="outline">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Support</div>
                                  <div className="font-mono text-sm font-medium">
                                    {(itemset.support * 100).toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Count</div>
                                  <div className="font-mono text-sm font-medium">
                                    {itemset.count}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
