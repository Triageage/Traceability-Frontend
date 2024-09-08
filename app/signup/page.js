"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

function SignUp() {
   const RoleSelection = {
      AGGREGATOR: "Aggregator",
      INITIATER: "Initiater",
      PRODUCER: "Producer",
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)] bg-sky-300">
         <div className="bg-white p-8 rounded shadow w-6/12">
            <h1 className="text-2xl font-bold">Register Now!</h1>
            <p className="text-gray-500 mb-4 text-sm font-light">
               Get started with your new account
            </p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <div className="flex flex-col">
                  <label htmlFor="text">Name:</label>
                  <input
                     type="text"
                     id="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
               </div>
               <div className="flex flex-col">
                  <label htmlFor="email">Email:</label>
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
                  <label htmlFor="password">Password:</label>
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
                  <label htmlFor="dropdown">Role:</label>
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
                     <option value={RoleSelection.INITIATER}>
                        {RoleSelection.INITIATER}
                     </option>
                     <option value={RoleSelection.PRODUCER}>
                        {RoleSelection.PRODUCER}
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
               >
                  {loading ? "Signing up..." : "Sign Up"}
               </button>
            </form>
         </div>
      </div>
   );
}

export default SignUp;
