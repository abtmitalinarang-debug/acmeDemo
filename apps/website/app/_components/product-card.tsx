"use client";
import Image from "next/image";
import { getProducts } from "@repo/store";
import { absoluteUrl } from "@repo/utils/navigate";
import RouteLinks from "@repo/utils/route-links";

export default function ProductCard() {
  const { data: products, isLoading, isError } = getProducts();
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 p-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative block aspect-[4/3] flex-grow basis-[400px] animate-pulse overflow-hidden rounded-lg bg-neutral-900"
          >
            <div className="absolute bottom-4 left-4 h-8 w-48 rounded-full bg-neutral-800 ring-1 ring-white/5"></div>
          </div>
        ))}
      </div>
    );
  }
  if (isError) {
    return <div>Error fetching products</div>;
  }
  return (
    <div className="flex flex-wrap gap-4 p-2">
      {products?.map((prod) => {
        return (
          <a
            key={prod.id}
            href={absoluteUrl(
              RouteLinks.product.replace(":id", prod.id.toString()),
            )}
            className="group relative block aspect-[4/3] flex-grow basis-[400px] overflow-hidden rounded-lg bg-black transition-shadow duration-300 hover:shadow-[0_0_0_1.5px_#2563eb,_0_0_24px_2px_rgba(37,99,235,0.35)]"
          >
            <Image
              src={prod.image}
              alt={prod.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className="absolute bottom-4 left-4 flex items-center gap-0 overflow-hidden rounded-full bg-black/80 backdrop-blur-sm ring-1 ring-white/10">
              <span className="px-4 py-1.5 text-sm font-semibold text-white">
                {prod.title}
              </span>
              <span className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-[0_0_10px_2px_rgba(37,99,235,0.6)]">
                {prod.price}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
