"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function Navbar({ isLoggedIn = false }) {
   // const [login, setLogin] = useState(false);
   const Router = useRouter();
   // const [access_token, setAccessToken] = useState("");

   // const updateLoginStatus = () => {
   //    setLogin(localStorage.getItem("access_token") ? true : false);
   //    setAccessToken(localStorage.getItem("access_token"));
   // };

   // useEffect(() => {
   //    updateLoginStatus();
   //    // Add an event listener to detect localStorage changes
   //    window.addEventListener("storage", updateLoginStatus);
   // }, []);

   return (
      <nav>
         <div className="flex justify-between items-center px-3 py-3 bg-transparent">
            <div className="flex items-center gap-2">
               <Shield />
               <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                  BlockChain Tracking
               </h1>
            </div>
            {isLoggedIn ? (
               <button
                  onClick={() => {
                     localStorage.removeItem("access_token");
                     localStorage.removeItem("user_metadata");
                     localStorage.removeItem("user_id");
                     console.log("Logged out");
                     Router.push("/");
                     Router.refresh();
                  }}
                  className="font-bold bg-red-500 px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
               >
                  Logout
               </button>
            ) : (
               <button
                  onClick={() => Router.push("/login")}
                  className="border-2 border-white rounded-md font-bold px-4 py-2 hover:bg-blue-900 transition-colors"
               >
                  Login
               </button>
            )}
            {/* {!access_token ? (
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
            )} */}
         </div>
      </nav>
   );
}
