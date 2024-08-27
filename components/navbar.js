import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
   return (
      <nav>
         <div className="flex justify-between items-center px-3 py-3 bg-gradient-to-tr from-blue-500 to-emerald-300 rounded-b-md">
            <Link href="/">
               <Image src={logo} alt="logo" width={50} height={50} />
            </Link>
            <h1 className="text-2xl font-bold">BlockChain Tracking</h1>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
               Login
            </button>
         </div>
      </nav>
   );
}
