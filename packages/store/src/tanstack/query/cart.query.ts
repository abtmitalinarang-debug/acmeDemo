import { api, API_ENDPOINTS } from "@repo/api";
import { ICart } from "@repo/core";
import { useQuery } from "@tanstack/react-query";

const CartKeys = {
  cart: (id: string) => `cart-${id}`,
};
export const getCart = (id = 1) => {
  return useQuery({
    queryKey: [CartKeys.cart],
    queryFn: () => api.get<ICart>(`${API_ENDPOINTS.CART}/${id}`),
  });
};
