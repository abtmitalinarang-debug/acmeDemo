"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { getProductById } from "@repo/store";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { showToast } from "@repo/utils/toast";
import CartSheet from "@repo/ui/components/CartSheet";

export default function ProductPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = getProductById(id as string);
  const [activeColor, setActiveColor] = useState("Black");
  const [activeSize, setActiveSize] = useState("XS");

  const colors = ["Black", "White", "Blue"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 p-2">
        <div className="relative block aspect-[4/3] flex-grow basis-[400px] animate-pulse overflow-hidden rounded-lg bg-neutral-900">
          <div className="absolute bottom-4 left-4 h-8 w-48 rounded-full bg-neutral-800 ring-1 ring-white/5"></div>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-white">Error fetching product</div>
    );
  }
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 rounded-3xl  bg-black p-4 md:p-8">
          <div className="flex w-full flex-col items-center justify-center gap-6 md:w-1/2">
            <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <Image
                src={product?.image || "/t-shirt-1.avif"}
                alt={product?.title || "productimg"}
                fill
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-neutral-700 bg-black/80 px-4 py-2 backdrop-blur-sm">
                <button className="text-neutral-400 hover:text-white transition-colors">
                  ←
                </button>
                <div className="h-4 w-px bg-neutral-700"></div>
                <button className="text-neutral-400 hover:text-white transition-colors">
                  →
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {[1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    idx === 1
                      ? "border-blue-600"
                      : "border-neutral-800 hover:border-neutral-600"
                  } bg-black transition-colors`}
                >
                  <Image
                    src={product?.image || "/t-shirt-1.avif"}
                    alt={`Thumbnail ${idx}`}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col md:w-1/2 py-8 md:py-12 md:pl-8">
            <div className="mb-6 flex flex-col items-start gap-4">
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                {product?.title || "-"}
              </h1>
              <div className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-[0_0_10px_2px_rgba(37,99,235,0.6)]">
                ${Number(product?.price).toFixed(2)} USD
              </div>
            </div>

            <hr className="my-8 border-neutral-800" />

            <div className="mb-8 flex flex-col gap-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      activeColor === color
                        ? "bg-neutral-800 text-white ring-1 ring-neutral-700"
                        : "bg-black text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      activeSize === size
                        ? "bg-neutral-800 text-white ring-1 ring-neutral-700"
                        : "bg-black text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 text-sm text-neutral-400">
              {product?.description ||
                "60% combed ringspun cotton/40% polyester jersey tee."}
            </div>
            <CartSheet>
              <Button
                onClick={() => showToast.success("ADDED TO CART")}
                variant={"default"}
                className={
                  "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-6 text-lg font-medium transition-colors hover:bg-blue-700"
                }
              >
                <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0"></div>
                <span className="relative z-10 text-2xl font-light">+</span>
                <span className="relative z-10">Add To Cart</span>
              </Button>
            </CartSheet>
          </div>
        </div>
      </div>
    </>
  );
}
