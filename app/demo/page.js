"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { Truck } from "lucide-react";
import { MoveLeft } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Factory } from "lucide-react";
import { Package } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
   const [name, setName] = useState("");
   const [journey, setJourney] = useState([]);
   const [productName, setProductName] = useState("");

   const router = useRouter();

   async function get_journey(address) {
      setName(address);
      const url = `http://localhost:5000/api/product/${address}`;
      const result = await fetch(url);
      const data = await result.json();
      setJourney(data.productHistory);
      setProductName(data.productHistory[1].name);
   }

   return (
      <main className="min-h-lvh h-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
         <div className="p-5">
            {name ? (
               <div>
                  <div className="relative flex justify-center">
                     <MoveLeft
                        className="absolute top-3 left-3 hover:cursor-pointer"
                        onClick={() => {
                           router.back();
                        }}
                     />
                     <div className="flex flex-col mb-8 text-center">
                        <p className="text-2xl font-semibold text-center">
                           {productName}
                        </p>
                        <p className="text-stone-200 font-light">
                           Tracking product journey!
                        </p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-7">
                     {journey.length > 0 ? (
                        journey.map((step, index) => (
                           <div
                              key={index}
                              className="bg-white bg-opacity-15 shadow-md rounded-md p-5"
                           >
                              <div className="flex gap-x-2 mb-3">
                                 {step.index == 1 ? (
                                    <Package />
                                 ) : step.index == 2 ? (
                                    <Factory />
                                 ) : step.index == 3 ? (
                                    <Truck />
                                 ) : (
                                    <ShoppingBag />
                                 )}
                                 <p className="text-lg font-semibold">
                                    Stage {step.index}: {step.stage}
                                 </p>
                              </div>

                              <p className="bg-blue-900 py-1 px-3 rounded-full w-fit">
                                 {step.performer_details.split(":")[0].slice(1)}
                              </p>
                              <p className="ml-3 font-light">
                                 {step.performer_details
                                    .split(":")[1]
                                    .slice(0, -1)}
                              </p>
                              <div className="my-4">
                                 {step.additional_details ? (
                                    <div className="flex flex-col px-3">
                                       <p>Ingredients</p>

                                       <div className="flex gap-x-3 mt-1">
                                          {step.additional_details
                                             .slice(1)
                                             .slice(0, -1)
                                             .split(",")
                                             .map((ingredient, index) => (
                                                <div
                                                   key={index}
                                                   className="flex gap-x-2 pr-3 bg-slate-100 rounded-full text-gray-800 items-center"
                                                >
                                                   <p className="bg-blue-800 border border-blue-600 px-3 rounded-full text-slate-100">
                                                      {ingredient.split(":")[0]}
                                                   </p>
                                                   <p>
                                                      {ingredient.split(":")[1]}
                                                   </p>
                                                </div>
                                             ))}
                                       </div>
                                    </div>
                                 ) : null}
                              </div>
                              <hr className="my-3 border-0 bg-blue-400 h-px" />

                              <div className="flex justify-between px-3">
                                 <p>Timestamp</p>
                                 <p>
                                    {new Date(step.timestamp).toLocaleString()}
                                 </p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <p>Loading journey data...</p> // Placeholder while data is loading
                     )}
                  </div>
               </div>
            ) : (
               <div className="flex flex-col justify-center gap-y-5">
                  <div className="relative flex justify-center">
                     <MoveLeft
                        className="absolute top-1 left-3 hover:cursor-pointer"
                        onClick={() => {
                           router.back();
                        }}
                     />
                     <h1 className="text-2xl font-semibold text-center">
                        Scan QR Code from here to get product journey!
                     </h1>
                  </div>
                  <Scanner
                     onScan={async (result) =>
                        await get_journey(result[0].rawValue)
                     }
                     onError={(error) => console.log(error)}
                     formats={["qr_code"]}
                     components={{ zoom: true, audio: false, finder: false }}
                     styles={{
                        container: {
                           //width: "50%",
                           maxWidth: "100%",
                           margin: "auto",
                           overflow: "hidden",
                           position: "relative",
                        },
                        video: {
                           minWidth: "100lvw",
                        },
                     }}
                  />
               </div>
            )}
         </div>
      </main>
   );
}
