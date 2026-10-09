import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SourceLock",
  description: "A dashboard for source-backed public commitments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
