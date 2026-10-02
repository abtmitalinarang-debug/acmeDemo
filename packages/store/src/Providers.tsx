"use client";

import { cartSlice } from "@repo/store";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import storage from "redux-persist/lib/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { encryptTransform } from 'redux-persist-transform-encrypt';

import { env } from "@repo/env";

const encryptionKey = env.NEXT_PUBLIC_STORE_SECRET_KEY;

const encryptedTransform = encryptTransform({
  secretKey: encryptionKey,
  onError(error: Error) {
    console.error("[store] Decryption error — state reset:", error.message);
  },
});

const ICartPersistConfig = {
  key: "cart",
  version: 1,
  storage,
  transforms: [encryptedTransform],
};

const persistedCartReducer = persistReducer(
  ICartPersistConfig,
  cartSlice.reducer,
);

const persistedStore = configureStore({
  reducer: {
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(persistedStore);

interface IProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: IProvidersProps) {
  const queryClient = new QueryClient();
  return (
    <Provider store={persistedStore}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
