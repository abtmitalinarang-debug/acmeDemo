import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import RootLayout from "@repo/ui/components/layout/RootLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "cart",
  description: "Portal application powered by Next.js in Acme Monorepo",
};

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <RootLayout>{children}</RootLayout>;
}
