"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGeolocated } from "react-geolocated";
import { isPointWithinRadius } from "geolib";

export default function Home() {
   const router = useRouter();
   const [loggedin, setLoggedin] = useState(false);
   useEffect(() => {
      setLoggedin(localStorage.getItem("access_token") ? true : false);
      console.log(loggedin);
      if (localStorage.getItem("access_token")) {
         router.push("/dashboard");
      }
   }, [loggedin, router]);

   const { coords } = useGeolocated({
      positionOptions: {
         enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
   });

   const getUserLocation = () => {
      console.log(coords)
      if (coords) {
         console.log(coords);
         console.log(coords.latitude);
         console.log(coords.longitude);

         const result = isPointWithinRadius(
            {latitude: coords.latitude, longitude: coords.longitude},
            // {latitude: 13.1359186, longitude: 80.2356058},
            coords.accuracy
         )

         console.log(result);
      }
   };

   return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
         <Navbar {...{ isLoggedIn: loggedin }} />
         <div className="flex flex-col h-[calc(100vh-73px)] justify-center items-center gap-8 ">
            <h1 className="text-center text-3xl font-semibold w-9/12">
               Track Baby Food Integrity
            </h1>
            <div className="grid md:grid-cols-2 gap-8 p-3">
               <div className="flex flex-col bg-white bg-opacity-20 py-4 px-4 rounded-md shadow">
                  <p className="text-xl font-semibold">Secure Tracking</p>
                  <p>Immutable blockchain-based product tracking</p>
               </div>
               <div className="flex flex-col bg-white bg-opacity-20 py-4 px-4 rounded-md shadow">
                  <p className="text-xl font-semibold">
                     High Security Standards
                  </p>
                  <p>Advanced encryption and access control systems</p>
               </div>
               <div className="flex flex-col bg-white bg-opacity-20 py-4 px-4 rounded-md shadow">
                  <p className="text-xl font-semibold">Decentralized System</p>
                  <p>Distributed ledger for enhanced reliability</p>
               </div>
               <div className="flex flex-col bg-white bg-opacity-20 py-4 px-4 rounded-md shadow">
                  <p className="text-xl font-semibold">Easy Integration</p>
                  <p>Seamless integration with existing systems</p>
               </div>
            </div>

            <div className="flex justify-center gap-x-10">
               <Link
                  href="/demo"
                  className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border-2 border-white rounded-md transition-colors"
               >
                  Try it Now!
               </Link>
               <Link
                  href="/signup"
                  className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border-2 border-white rounded-md transition-colors"
               >
                  Sign Up
               </Link>
               <Link
                  href="/"
                  onClick={getUserLocation}
                  className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border-2 border-white rounded-md transition-colors">
               get Location
               </Link>
            </div>
         </div>
      </main>
   );
}
