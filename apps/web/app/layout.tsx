import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self Improvement Labs",
  description: "A personal RPG system for real-life progression."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
