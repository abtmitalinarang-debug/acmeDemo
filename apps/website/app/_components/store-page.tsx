import React from "react";
import ProductCard from "./product-card";
import Link from "next/link";

const collections = [
  "All",
  "Bags",
  "Drinkware",
  "Electronics",
  "Footwear",
  "Headwear",
  "Hoodies",
  "Jackets",
  "Kids",
  "Pets",
  "Shirts",
  "Stickers"
];

const sortOptions = [
  "Relevance",
  "Trending",
  "Latest arrivals",
  "Price: Low to high",
  "Price: High to low"
];

export default function StorePage({ currentCategory = "All" }: { currentCategory?: string }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-4 md:flex-row text-sm text-neutral-400 mt-8">
      <div className="order-first w-full flex-none md:max-w-[125px]">
        <nav>
          <h3 className="mb-4 hidden text-xs font-semibold text-neutral-500 md:block">Collections</h3>
          <ul className="flex flex-col gap-3">
            {collections.map((collection) => (
              <li key={collection}>
                <Link
                  href={collection === "All" ? "/all" : `/${collection.toLowerCase()}`}
                  className={`hover:text-white ${
                    collection.toLowerCase() === currentCategory.toLowerCase() ? "text-white underline underline-offset-4" : ""
                  }`}
                >
                  {collection}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="order-last min-h-screen w-full md:order-none">
        <ProductCard />
      </div>

      <div className="order-none flex-none md:order-last md:w-[125px]">
        <nav>
          <h3 className="mb-4 hidden text-xs font-semibold text-neutral-500 md:block">Sort by</h3>
          <ul className="flex flex-col gap-3">
            {sortOptions.map((option) => (
              <li key={option}>
                <Link
                  href="#"
                  className={`hover:text-white ${
                    option === "Relevance" ? "text-white underline underline-offset-4" : ""
                  }`}
                >
                  {option}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
