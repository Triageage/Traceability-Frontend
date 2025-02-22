"use client";

import Navbar from "@/components/navbar";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function Dashboard() {
   const router = useRouter();
   const user_metadata = JSON.parse(localStorage.getItem("user_metadata"));
   const user_id = localStorage.getItem("user_id");
   const [location, setLocation] = useState("");
   const [productName, setProductName] = useState("");
   const [companyName, setCompanyName] = useState("");
   const [showModal, setShowModal] = useState(false);
   const [error, setError] = useState(null);
   const [ingredients, setIngredients] = useState([{ name: "", location: "" }]);
   const [scannedCode, setScannedCode] = useState("");
   const [loading, setLoading] = useState(false);
   const [done, setDone] = useState(false);
   const [productCode, setProductCode] = useState("");

   useEffect(() => {
      const fetchUserData = async () => {
         let { data: user_data, error } = await supabase
            .from("user_data")
            .select("*")
            .eq("id", user_id);

         if (error) {
            setError(error.message);
            return;
         }

         if (user_data && user_data.length > 0) {
            setLocation(user_data[0].location || "");
            setCompanyName(user_data[0].company_name || "");
            if (!user_data[0].location || !user_data[0].company_name) {
               setShowModal(true);
            }
         } else {
            setShowModal(true);
         }
      };

      if (user_id) {
         fetchUserData();
      }
   }, [user_id]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      const { data, error } = await supabase
         .from("user_data")
         .upsert({ id: user_id, location, company_name: companyName })
         .select();

      if (error) {
         setError(error.message);
      } else {
         setShowModal(false);
      }
   };

   const handleAddIngredient = () => {
      setIngredients([...ingredients, { name: "", quantity: "" }]);
   };

   const handleRemoveIngredient = (index) => {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
   };

   const handleIngredientChange = (index, field, value) => {
      const newIngredients = [...ingredients];
      if (field === "name" || field === "location") {
         newIngredients[index][field] = value;
      }
      setIngredients(newIngredients);
   };

   const handleAggregatorSubmit = async (e) => {
      e.preventDefault();
      // Here you would send the ingredients data to your backend
      setLoading(true);
      let ing = "";
      console.log("Submitting ingredients:", ingredients);
      // Implement the API call to create a new product

      ingredients.forEach((ingredient) => {
         ing = ing + `${ingredient.name}:${ingredient.location},`;
      });

      ing = ing.slice(0, -1);
      ing = "[" + ing + "]";

      console.log(ing);

      const url = "http://localhost:5000/api/create";
      const data = {
         name: productName,
         ingredientData: ing,
         producerDetails: `[${companyName}:${location}]`,
      };

      const response = await fetch(url, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(data),
      });
      const final = await response.json();
      console.log("Result:", final);

      setProductCode(final.productCode);

      setLoading(false);
      setDone(true);
   };

   const handleScan = async (result) => {
      if (result) {
         // Here you would send the scanned code to your backend
         console.log("Scanned code:", result[0].rawValue);
         setScannedCode(result[0].rawValue);
         const url = "http://localhost:5000/api/update";
         const data = {
            productCode: result[0].rawValue,
            facilityDetails: `[${companyName}:${location}]`,
            producerDetails: user_metadata.role,
         };
         setLoading(true);
         const response = await fetch(url, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
         });
         const final = await response.json();
         console.log("Result:", final);

         setLoading(false);
         setDone(true);

         console.log("done");
      }
   };

   return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
         <Navbar isLoggedIn={!!user_metadata} />
         <div className="p-5">
            {done && (
               <div className="bg-green-200 p-3 mb-5 w-full rounded-md">
                  <p className="text-lg font-semibold text-center text-green-700">
                     Product Added to the BlockChain Successfully...
                  </p>
               </div>
            )}

            {productCode && (
               <div className="bg-green-200 p-3 mb-5 w-full rounded-md">
                  <p className="text-lg font-semibold text-center break-words text-green-700">
                     Product Code: {productCode}
                  </p>
               </div>
            )}

            {loading && (
               <div className=" fixed inset-0 z-20 bg-white backdrop-blur-sm bg-opacity-20 flex justify-center items-center h-screen">
                  <div className="flex justify-center items-center gap-x-3 w-2/4 h-1/6 bg-slate-100 rounded-md shadow-sm">
                     <div role="status">
                        <svg
                           aria-hidden="true"
                           className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-400 fill-blue-600"
                           viewBox="0 0 100 101"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                           />
                           <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                           />
                        </svg>
                        <span className="sr-only">Loading...</span>
                     </div>
                     <p className="text-xl font-bold text-blue-700">
                        Loading...
                     </p>
                  </div>
               </div>
            )}
            {user_id ? (
               <div className="flex flex-col gap-5">
                  <h1 className="text-2xl font-bold">Dashboard</h1>

                  <div className="grid sm:grid-cols-2 gap-5">
                     <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                        <p className="text-xl font-semibold">Name</p>
                        <p className="text-md font-medium">
                           {user_metadata.full_name}
                        </p>
                     </div>
                     <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                        <p className="text-xl font-semibold">Role</p>
                        <p className="text-md font-medium">
                           {user_metadata.role}
                        </p>
                     </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                     <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                        <p className="text-xl font-semibold">Company Name</p>
                        <p className="text-md font-medium">{companyName}</p>
                     </div>
                     <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                        <p className="text-xl font-semibold">Location</p>
                        <p className="text-md font-medium">{location}</p>
                     </div>
                  </div>
                  {error && <p className="text-red-500">Error: {error}</p>}

                  {user_metadata.role === "Aggregator" ? (
                     <div className="bg-white bg-opacity-15 p-4 rounded-md shadow">
                        <h2 className="text-lg font-semibold mb-2">
                           Enter the Product Name
                        </h2>
                        <input
                           type="text"
                           placeholder="Product Name"
                           value={productName}
                           onChange={(e) => setProductName(e.target.value)}
                           className="flex-1 px-3 py-2 text-black rounded"
                        />

                        <div className="mt-4">
                           <h2 className="text-lg font-semibold mb-2">
                              Enter Ingredient Data
                           </h2>
                           <form
                              onSubmit={handleAggregatorSubmit}
                              className="space-y-4"
                           >
                              {ingredients.map((ingredient, index) => (
                                 <div
                                    key={index}
                                    className="flex space-x-4 items-center"
                                 >
                                    <input
                                       type="text"
                                       placeholder="Ingredient name"
                                       value={ingredient.name}
                                       onChange={(e) =>
                                          handleIngredientChange(
                                             index,
                                             "name",
                                             e.target.value
                                          )
                                       }
                                       className="flex-1 px-3 py-2 text-black rounded"
                                    />
                                    <input
                                       type="text"
                                       placeholder="Location"
                                       value={ingredient.location}
                                       onChange={(e) =>
                                          handleIngredientChange(
                                             index,
                                             "location",
                                             e.target.value
                                          )
                                       }
                                       className="flex-1 px-3 py-2 text-black rounded"
                                    />
                                    <button
                                       type="button"
                                       onClick={() =>
                                          handleRemoveIngredient(index)
                                       }
                                       className="bg-red-500 px-4 py-2 rounded"
                                    >
                                       -
                                    </button>
                                 </div>
                              ))}
                              <div className="flex space-x-4">
                                 <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="bg-blue-500 px-4 py-2 rounded"
                                 >
                                    +
                                 </button>
                                 <button
                                    type="submit"
                                    className="bg-green-500 px-4 py-2 rounded"
                                 >
                                    Submit
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>
                  ) : (
                     <div className="mt-8 z-10">
                        <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
                        {!showModal ? (
                           <div className="flex justify-center">
                              <Scanner
                                 onScan={handleScan}
                                 onError={(error) => console.log(error)}
                                 formats={["qr_code"]}
                                 components={{
                                    zoom: true,
                                    audio: false,
                                    finder: false,
                                 }}
                                 styles={{
                                    container: {
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
                        ) : (
                           <div></div>
                        )}
                     </div>
                  )}
               </div>
            ) : (
               <div>
                  <p>You are not logged in</p>
                  <p>Please login to view the dashboard</p>
               </div>
            )}

            {showModal && (
               <div className="fixed z-10 inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                  <div className="z-20 bg-white p-8 rounded-lg text-black w-4/6">
                     <h2 className="text-xl font-bold mb-4">
                        Additional Information Required
                     </h2>
                     <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                           <label htmlFor="companyName" className="block mb-2">
                              Company Name:
                           </label>
                           <input
                              type="text"
                              id="companyName"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              required
                              className="w-full px-3 py-2 border rounded"
                           />
                        </div>
                        <div className="mb-4">
                           <label htmlFor="location" className="block mb-2">
                              Location:
                           </label>
                           <input
                              type="text"
                              id="location"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              required
                              className="w-full px-3 py-2 border rounded"
                           />
                        </div>
                        <button
                           type="submit"
                           className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                           Submit
                        </button>
                     </form>
                  </div>
               </div>
            )}
         </div>
      </main>
   );
}
