"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeft } from "lucide-react"; // Import Lucide React Icon

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
   }, [router]);

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
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white relative">
         {/* Back Arrow Button */}
         <button
            onClick={() => router.push("/")} // Navigate to home (page.js)
            className="absolute top-4 left-4 flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
         >
            <ArrowLeft size={24} /> {/* Lucide React Back Arrow Icon */}
            <span className="font-semibold">Back</span>
         </button>

         <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)]">
            <div className="bg-white bg-opacity-15 p-8 rounded-md shadow w-8/12">
               <h1 className="text-2xl font-bold drop-shadow-sm">Login</h1>
               <p className="text-gray-200 mb-4 text-sm font-light drop-shadow-sm">
                  Let&apos;s get started
               </p>
               <form onSubmit={handleSubmit}>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="mb-4">
                     <label
                        className="block text-stone-200 text-sm font-bold mb-2"
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
                        className="block text-stone-200 text-sm font-bold mb-2"
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
                        className="shadow-md font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                        type="submit"
                     >
                        Login
                     </button>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                     <button
                        className="shadow-md font-semibold bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                        type="button"
                        onClick={() => router.push("/superuser")}
                     >
                        Super User
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </main>
   );
}
