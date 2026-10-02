import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3001/"),
  NEXT_PUBLIC_API_URL: z.string().url().default("https://fakestoreapi.com"),
  NEXT_PUBLIC_STORE_SECRET_KEY: z.string().default("dfsgesrtgesrgddx"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
