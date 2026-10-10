import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SourceLock Protocole",
  description: "A GenLayer dashboard for source-backed public commitments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
