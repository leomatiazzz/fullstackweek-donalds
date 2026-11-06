import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext } from "../contexts/cart";
import CartProductItem from "./cart-product-item";
import FinishOrderDialog from "./finish-order-dialog";

const CartSheet = () => {
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState(false);
  const { isOpen, toggleCart, products, total } = useContext(CartContext);
  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left font-bold">Sua Sacola</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col py-5">
          <ScrollArea className="flex-auto pr-3">
            <div className="space-y-4">
              {products.map((product) => (
                <CartProductItem key={product.id} product={product} />
              ))}
            </div>
          </ScrollArea>
          <div className="pt-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-base font-bold">{formatCurrency(total)}</p>
                </div>
              </CardContent>
            </Card>
            <Button
              className="w-full rounded-full font-medium"
              onClick={() => setFinishOrderDialogIsOpen(true)}
            >
              Finalizar pedido
            </Button>
          </div>
          <FinishOrderDialog
            open={finishOrderDialogIsOpen}
            onOpenChange={setFinishOrderDialogIsOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
