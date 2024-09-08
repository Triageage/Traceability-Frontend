"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function Login() {
   const router = useRouter();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (localStorage.getItem("access_token")) {
         router.push("/dashboard");
      }
   }, []);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      try {
         const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
         });
         if (error) throw error;
         else {
            console.log(data);
            console.log(data.session.access_token);
            console.log(data.user.user_metadata);

            localStorage.setItem("access_token", data.session.access_token);
            localStorage.setItem(
               "user_metadata",
               JSON.stringify(data.user.user_metadata)
            );
            localStorage.setItem("user_id", data.user.id);
            setLoading(false);
            router.push("/dashboard");
         }
      } catch (error) {
         setError(error.message);
      }
   };

   return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)] bg-sky-300">
         <div className="bg-white p-8 rounded shadow w-6/12">
            <h1 className="text-2xl font-bold drop-shadow-sm">Login</h1>
            <p className="text-gray-500 mb-4 text-sm font-light drop-shadow-sm">
               Let's get started
            </p>
            <form onSubmit={handleSubmit}>
               {error && <p className="text-red-500 mb-4">{error}</p>}
               <div className="mb-4">
                  <label
                     className="block text-gray-700 text-sm font-bold mb-2"
                     htmlFor="email"
                  >
                     Email
                  </label>
                  <input
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     id="email"
                     type="email"
                     placeholder="Email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />
               </div>
               <div className="mb-6">
                  <label
                     className="block text-gray-700 text-sm font-bold mb-2"
                     htmlFor="password"
                  >
                     Password
                  </label>
                  <input
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     id="password"
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
               <div className="flex items-center justify-center">
                  <button
                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                     type="submit"
                  >
                     Login
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
