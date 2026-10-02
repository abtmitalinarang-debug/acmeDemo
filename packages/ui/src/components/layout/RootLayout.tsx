import { ReactNode } from "react";
import AppLayout from "./AppLayout";
import { Providers } from "@repo/store";
import localFont from "next/font/local";

interface IRootLayoutProps {
  children: ReactNode;
}

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({ children }: IRootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
