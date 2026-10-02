"use client";
import { api, API_ENDPOINTS } from "@repo/api";
import { useQuery } from "@tanstack/react-query";
import { IProduct } from "@repo/core";

const ProductKeys = {
  products: ["products"],
  productById: (id: string) => [`product-${id}`],
};
export const getProducts = () => {
  return useQuery({
    queryKey: ProductKeys.products,
    queryFn: () => api.get<IProduct[]>(API_ENDPOINTS.PRODUCTS),
  });
};
export const getProductById = (id: string) => {
  return useQuery({
    queryKey: ProductKeys.productById(id),
    queryFn: () => api.get<IProduct>(`${API_ENDPOINTS.PRODUCTS}/${id}`),
    enabled: !!id,
  });
};
