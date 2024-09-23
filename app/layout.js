import { Inter } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/system";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
   title: "Product Tracker",
   description:
      "BlockChain Based Product Tracking System for Baby Food Products",
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className={inter.className}>{children}</body>
      </html>
   );
}
