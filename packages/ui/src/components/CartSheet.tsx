"use client";
import { ReactElement } from "react";
import { getCart } from "@repo/store";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import EmptyCartIcon from "../lib/icons/empty-cart-icon";
import { Button } from "./button";
import { showToast } from "@repo/utils/toast";

interface ICartSheetProps {
  children: ReactElement;
}

export default function CartSheet({ children }: ICartSheetProps) {
  const { data: cart, isLoading } = getCart();

  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent
        className="flex flex-col border-0 bg-black p-0"
        style={{ maxWidth: "26rem" }}
      >
        <SheetHeader className="px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-wide text-white">
            My Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-neutral-400">
              Loading...
            </div>
          ) : cart && cart?.products?.length > 0 ? (
            <div className="flex flex-col gap-4 px-6 py-4">
              {cart.products.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
                >
                  <div className="text-sm font-medium text-white">
                    Product ID: {item.productId}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16">
              <div className="flex items-center justify-center opacity-90">
                <EmptyCartIcon />
              </div>
              <p className="text-center text-lg font-bold text-white">
                Your cart is empty.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="px-5 pb-6 pt-4 ">
          <Button
            variant={"default"}
            onClick={() => showToast.success("ADDED TO CART")}
          >
            Proceed to Checkout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
