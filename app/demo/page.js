"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

export default function SignUp() {
   const [name, setName] = useState("");
   const [journey, setJourney] = useState([]);

   async function get_journey(address) {
      setName(address);
      const url = `http://localhost:5000/api/product/${address}`;
      const result = await fetch(url);
      const data = await result.json();
      setJourney(data.productHistory);
   }

   return (
      <main className="p-5">
         {name ? (
            <div>
               <p>{name}</p>
               <p>Journey Details: </p>
               {journey.length > 0 ? (
                  journey.map((step, index) => (
                     <div key={index} className="pt-5">
                        <p>
                           Step {step.index}: {step.action}
                        </p>
                        <p>Name: {step.name}</p>
                        <p>Details: {step.details}</p>
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
            <Scanner
               onScan={async (result) => await get_journey(result[0].rawValue)}
            />
         )}
      </main>
   );
}
