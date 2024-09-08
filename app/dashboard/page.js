"use client";

import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
   const router = useRouter();
   const user_metadata = JSON.parse(localStorage.getItem("user_metadata"));
   const user_id = localStorage.getItem("user_id");
   const access_token = localStorage.getItem("access_token");
   const [location, setLocation] = useState([]);

   useEffect(() => {
      const updateLocation = async () => {
         let { data: user_data, error } = await supabase
            .from("user_data")
            .select("id");
         if (error) throw error;
         setLocation(user_data);
         console.log(user_data, location);
      };
      updateLocation();
   }, []);

   return (
      <div>
         <p>Location: {location}</p>
         {user_id ? (
            <div>
               <div>
                  <p>Dashboard</p>
                  <p>Hello {user_metadata.full_name}!</p>
               </div>
               <div>
                  <p>Name: {user_metadata.full_name}</p>
                  <p>Email: {user_metadata.email}</p>
                  <p>User ID: {user_id}</p>
                  <p>Role: {user_metadata.role}</p>
                  <p>Access Token: {access_token}</p>
               </div>
            </div>
         ) : (
            <div>
               <p>You are not logged in</p>
               <p>Please login to view the dashboard</p>
            </div>
         )}
      </div>
   );
}
