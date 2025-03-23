"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeft } from "lucide-react";

function SignUp() {
   const RoleSelection = {
      AGGREGATOR: "Aggregator",
      MANUFACTURER: "Manufacturer",
      DISTRIBUTOR: "Distributor",
      RETAILER: "Retailer",
      IDLE: "Idle",
   };
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [name, setName] = useState("");
   const [role, setRole] = useState(RoleSelection.IDLE);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const router = useRouter();

   const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      try {
         const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: {
                  full_name: name,
                  role: role,
                  email_confirm: true,
               },
            },
         });

         if (error) throw error;

         // Redirect to a success page or the login page
         router.push("/login");
      } catch (error) {
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
         <div className="flex flex-col items-center justify-center h-screen">
            <button
               onClick={() => router.push("/")}
               className="absolute top-4 left-4 text-white"
            >
               <ArrowLeft size={24} />
            </button>
            <div className="bg-white bg-opacity-15 p-8 rounded-md shadow w-7/12">
               <h1 className="text-2xl font-bold text-white">Register Now!</h1>
               <p className="text-stone-200 mb-4 text-sm font-light">
                  Get started with your new account
               </p>
               {error && <p style={{ color: "red" }}>{error}</p>}
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col">
                     <label htmlFor="text" className="text-white">
                        Name:
                     </label>
                     <input
                        type="text"
                        id="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className=" rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                     />
                  </div>
                  <div className="flex flex-col">
                     <label htmlFor="email" className="text-white">
                        Email:
                     </label>
                     <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                     />
                  </div>
                  <div className="flex flex-col">
                     <label htmlFor="password" className="text-white">
                        Password:
                     </label>
                     <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                     />
                  </div>
                  <div className="flex flex-col">
                     <label htmlFor="dropdown" className="text-white">
                        Role:
                     </label>
                     <select
                        id="dropdown"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border bg-white border-gray-300 rounded px-3 py-3 focus:outline-none focus:border-blue-500"
                     >
                        <option value={RoleSelection.IDLE}>
                           {RoleSelection.IDLE}
                        </option>
                        <option value={RoleSelection.AGGREGATOR}>
                           {RoleSelection.AGGREGATOR}
                        </option>
                        <option value={RoleSelection.MANUFACTURER}>
                           {RoleSelection.MANUFACTURER}
                        </option>
                        <option value={RoleSelection.DISTRIBUTOR}>
                           {RoleSelection.DISTRIBUTOR}
                        </option>
                        <option value={RoleSelection.RETAILER}>
                           {RoleSelection.RETAILER}
                        </option>
                     </select>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
                  >
                     {loading ? "Signing up..." : "Sign Up"}
                  </button>
               </form>
            </div>
         </div>
      </main>
   );
}

export default SignUp;
