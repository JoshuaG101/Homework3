import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus } from "lucide-react";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Shop() {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createTransaction = useMutation({
    mutationFn: async (items: string[]) => {
      return await apiRequest("POST", "/api/transactions", { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/stats"] });
      setCart({});
      toast({
        title: "Purchase completed",
        description: "Transaction has been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete purchase",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
      duration: 2000,
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const newQty = (prev[productId] || 0) + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handleCompletePurchase = () => {
    const items: string[] = [];
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        for (let i = 0; i < quantity; i++) {
          items.push(product.name);
        }
      }
    });
    createTransaction.mutate(items);
  };

  const cartItems = products.filter((p) => cart[p.id] > 0);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-6 h-full overflow-hidden">
      {/* Products Grid */}
      <div className="overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-medium mb-2">Shop Products</h1>
          <p className="text-muted-foreground">Select products to create a transaction</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover-elevate active-elevate-2 transition-shadow overflow-hidden"
              data-testid={`card-product-${product.id}`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                  <span className="material-icons text-5xl text-muted-foreground">
                    {product.category === "Dairy" ? "egg" :
                     product.category === "Bakery" ? "bakery_dining" :
                     product.category === "Beverages" ? "local_cafe" :
                     product.category === "Snacks" ? "cookie" :
                     product.category === "Meat" ? "set_meal" :
                     product.category === "Produce" ? "spa" : "shopping_basket"}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <span className="font-mono font-medium text-sm" data-testid={`text-price-${product.id}`}>
                      ${product.price}
                    </span>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="w-full"
                    data-testid={`button-add-${product.id}`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className="lg:border-l bg-card border-border overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-medium">Cart</h2>
            {cartCount > 0 && (
              <Badge variant="default" data-testid="badge-cart-count">
                {cartCount}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Items selected for transaction</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-1">Cart is empty</p>
              <p className="text-sm text-muted-foreground">Add products to create a transaction</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((product) => (
                <Card key={product.id} data-testid={`cart-item-${product.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          ${product.price} each
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(product.id, -1)}
                            data-testid={`button-decrease-${product.id}`}
                          >
                            <span className="material-icons text-sm">remove</span>
                          </Button>
                          <span className="font-mono text-sm min-w-[2ch] text-center" data-testid={`text-quantity-${product.id}`}>
                            {cart[product.id]}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(product.id, 1)}
                            data-testid={`button-increase-${product.id}`}
                          >
                            <span className="material-icons text-sm">add</span>
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono font-medium text-sm">
                        ${(Number(product.price) * cart[product.id]).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-mono font-medium" data-testid="text-total">
                $
                {cartItems
                  .reduce((sum, p) => sum + Number(p.price) * cart[p.id], 0)
                  .toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompletePurchase}
              disabled={createTransaction.isPending}
              data-testid="button-complete-purchase"
            >
              {createTransaction.isPending ? (
                <>
                  <span className="material-icons animate-spin mr-2">refresh</span>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
