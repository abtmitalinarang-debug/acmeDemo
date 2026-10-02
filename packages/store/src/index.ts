export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

export { useAppDispatch, useAppSelector } from "./hooks";

export { cartSlice, addItem } from "./slices/cartSlice";
export { default as Providers } from "./Providers";
export { getProducts, getProductById } from "./tanstack/query/product.query";
export { getCart } from "./tanstack/query/cart.query";
