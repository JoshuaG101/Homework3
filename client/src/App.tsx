import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Shop from "@/pages/shop";
import Transactions from "@/pages/transactions";
import MiningResults from "@/pages/mining-results";
import Settings from "@/pages/settings";
import { ShoppingCart, Receipt, TrendingUp, Settings as SettingsIcon } from "lucide-react";

function App() {
  const [location, setLocation] = useLocation();

  const tabs = [
    { value: "/", label: "Shop", icon: ShoppingCart },
    { value: "/transactions", label: "Transactions", icon: Receipt },
    { value: "/results", label: "Mining Results", icon: TrendingUp },
    { value: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background">
          {/* Header with Tabs */}
          <header className="border-b bg-card sticky top-0 z-50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-medium flex items-center gap-2">
                    <span className="material-icons text-primary text-3xl">shopping_cart</span>
                    Supermarket Mining
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Association Rule Mining & Pattern Discovery
                  </p>
                </div>
              </div>

              <Tabs value={location} onValueChange={setLocation}>
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto gap-2">
                  {tabs.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="gap-2 py-3"
                      data-testid={`tab-${value.slice(1) || "shop"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/" component={Shop} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/results" component={MiningResults} />
              <Route path="/settings" component={Settings} />
            </Switch>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
