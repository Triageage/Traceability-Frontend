"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

export default function SignUp() {
   const [name, setName] = useState("");
   const [journey, setJourney] = useState([]);
   const [productName, setProductName] = useState("");

   async function get_journey(address) {
      setName(address);
      const url = `http://localhost:5000/api/product/${address}`;
      const result = await fetch(url);
      const data = await result.json();
      setJourney(data.productHistory);
      setProductName(data.productHistory[0].name);
   }

   return (
      <main className="p-5 h-[calc(100vh-73px)] bg-sky-300">
         {name ? (
            <div>
               <p className="text-xl font-semibold mb-1">Journey Details: </p>
               <p className="text-lg font-semibold mb-3">
                  Product Name: {productName}
               </p>

               {journey.length > 0 ? (
                  journey.map((step, index) => (
                     <div
                        key={index}
                        className="bg-white border rounded-md p-5 mb-5 shadow"
                     >
                        <p className="text-lg font-semibold">
                           Stage {step.index}: {step.action}
                        </p>
                        {step.details ? <p>Details: {step.details}</p> : null}
                        <p>Location: {step.location}</p>
                        <p>
                           Timestamp:{" "}
                           {new Date(step.timestamp).toLocaleString()}
                        </p>
                     </div>
                  ))
               ) : (
                  <p>Loading journey data...</p> // Placeholder while data is loading
               )}
            </div>
         ) : (
            <div className="flex justify-center">
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
      </main>
   );
}
