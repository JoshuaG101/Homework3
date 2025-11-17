import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Play, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MiningConfig } from "@shared/schema";

export default function Settings() {
  const [config, setConfig] = useState<MiningConfig>({
    minSupport: 0.2,
    minConfidence: 0.5,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const runMining = useMutation({
    mutationFn: async (params: MiningConfig) => {
      return await apiRequest("POST", "/api/mining/run", params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining/results"] });
      toast({
        title: "Mining complete",
        description: "Association rules have been discovered successfully",
      });
      setTimeout(() => setLocation("/results"), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Mining failed",
        description: error?.message || "An error occurred while running the algorithm",
        variant: "destructive",
      });
    },
  });

  const handleRunMining = () => {
    // Validate config
    if (config.minSupport <= 0 || config.minSupport > 1) {
      toast({
        title: "Invalid configuration",
        description: "Minimum support must be between 0 and 1",
        variant: "destructive",
      });
      return;
    }
    if (config.minConfidence <= 0 || config.minConfidence > 1) {
      toast({
        title: "Invalid configuration",
        description: "Minimum confidence must be between 0 and 1",
        variant: "destructive",
      });
      return;
    }
    runMining.mutate(config);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-medium mb-2">Mining Settings</h1>
          <p className="text-muted-foreground">
            Configure association rule mining parameters
          </p>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Algorithm Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Minimum Support */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="min-support" className="text-base font-medium">
                    Minimum Support
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum frequency for itemsets to be considered frequent
                  </p>
                </div>
                <div className="font-mono text-2xl font-medium min-w-[4ch] text-right" data-testid="value-min-support">
                  {(config.minSupport * 100).toFixed(0)}%
                </div>
              </div>
              <Slider
                id="min-support"
                min={5}
                max={50}
                step={5}
                value={[config.minSupport * 100]}
                onValueChange={([value]) => setConfig({ ...config, minSupport: value / 100 })}
                className="cursor-pointer"
                data-testid="slider-min-support"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Minimum Confidence */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="min-confidence" className="text-base font-medium">
                    Minimum Confidence
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum confidence for association rules to be generated
                  </p>
                </div>
                <div className="font-mono text-2xl font-medium min-w-[4ch] text-right" data-testid="value-min-confidence">
                  {(config.minConfidence * 100).toFixed(0)}%
                </div>
              </div>
              <Slider
                id="min-confidence"
                min={10}
                max={100}
                step={5}
                value={[config.minConfidence * 100]}
                onValueChange={([value]) => setConfig({ ...config, minConfidence: value / 100 })}
                className="cursor-pointer"
                data-testid="slider-min-confidence"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleRunMining}
                disabled={runMining.isPending}
                size="lg"
                className="w-full"
                data-testid="button-run-mining"
              >
                {runMining.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Running Algorithm...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run Association Rule Mining
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About the Algorithm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Apriori Algorithm</h3>
              <p className="text-muted-foreground">
                The Apriori algorithm discovers frequent itemsets in transaction databases and
                generates association rules based on minimum support and confidence thresholds.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Support</h3>
              <p className="text-muted-foreground">
                Indicates how frequently an itemset appears in the dataset. Higher support means
                the pattern is more common.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Confidence</h3>
              <p className="text-muted-foreground">
                Measures the likelihood that consequent items are purchased when antecedent items
                are purchased. Higher confidence indicates stronger association.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Lift</h3>
              <p className="text-muted-foreground">
                Measures how much more likely items appear together compared to random chance. Lift
                {" > "} 1 indicates positive correlation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
