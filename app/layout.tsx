import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/_globals.scss";
import { Header } from "@/component";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Algorithm Visualizers",
  description: "Algorithm visualizers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
