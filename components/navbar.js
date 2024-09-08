"use client";

import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar({ isLoggedIn = false }) {
   const [login, setLogin] = useState(false);
   const Router = useRouter();
   const [access_token, setAccessToken] = useState("");

   const updateLoginStatus = () => {
      setLogin(localStorage.getItem("access_token") ? true : false);
      setAccessToken(localStorage.getItem("access_token"));
   };

   useEffect(() => {
      updateLoginStatus();
      // Add an event listener to detect localStorage changes
      window.addEventListener("storage", updateLoginStatus);
   }, []);

   return (
      <nav>
         <div className="flex justify-between items-center px-3 py-3 bg-gradient-to-tr from-blue-500 to-emerald-300">
            <Link href="/">
               <Image src={logo} alt="logo" width={50} height={50} />
            </Link>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">
               BlockChain Tracking
            </h1>
            {!access_token ? (
               <Link href="/login">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                     Dashboard
                  </button>
               </Link>
            ) : (
               <Link href="/">
                  <button
                     className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                     onClick={() => {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("user_metadata");
                        localStorage.removeItem("user_id");
                        updateLoginStatus();
                        Router.push("/login");
                     }}
                  >
                     Logout
                  </button>
               </Link>
            )}
         </div>
      </nav>
   );
}
