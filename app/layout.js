import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
   title: "Product Tracker",
   description:
      "BlockChain Based Product Tracking System for Baby Food Products",
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <Navbar />
            {children}
         </body>
      </html>
   );
}
