import { clientSchema, serverSchema } from "./schema";

const isServer = typeof window === "undefined";

const _clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_STORE_SECRET_KEY: process.env.NEXT_PUBLIC_STORE_SECRET_KEY,
});

if (!_clientEnv.success) {
  console.error("❌ Invalid client environment variables:", _clientEnv.error.flatten().fieldErrors);
  throw new Error("Invalid client environment variables");
}

let _serverEnv = { data: {} as Record<string, string | undefined>, success: true };

if (isServer) {
  _serverEnv = serverSchema.safeParse(process.env) as any;
  if (!_serverEnv.success) {
    console.error("Invalid server environment variables:", (_serverEnv as any).error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }
}

export const env = {
  ..._clientEnv.data,
  ..._serverEnv.data,
};
