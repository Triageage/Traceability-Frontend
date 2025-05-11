"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { Truck } from "lucide-react";
import { MoveLeft } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Factory } from "lucide-react";
import { Package } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function SignUp() {
  const [journey, setJourney] = useState([]);
  const [productName, setProductName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [currentStage, setCurrentStage] = useState(-1);
  let productCode = null;
  let retailerCode = null;
  const [isLoading, setIsLoading] = useState(false);

  if (currentStage === -1) setCurrentStage(0);

  const router = useRouter();

  async function get_journey(productCode, retailerCode) {
    console.log("get_journey: ", productCode, retailerCode);
    const url = "http://localhost:5000/api/product";
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productCode: productCode,
        retailerCode: retailerCode,
      }),
    });
    const data = await result.json();
    console.log("returned data: ", data);
    setProductName(data.productHistory.productName);
    setJourney(data.productHistory.productDetails);
    setProductName(data.productHistory.productName);
    setExpiry(data.productHistory.productExpiry);
  }

  async function handleScan(result) {
    console.log(
      "current stage: ",
      currentStage,
      "productCode: ",
      productCode,
      "retailerCode: ",
      retailerCode,
      "result: ",
      result,
    );
    if (!productCode) {
      console.log("Scanning product code!");
      productCode = result;
      setIsLoading(true);
      setCurrentStage(1);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } else if (currentStage === 1 || productCode) {
      console.log("Scanning retailer!");
      retailerCode = result;

      await get_journey(productCode, retailerCode);
    }
  }

  return (
    <main className="min-h-lvh h-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
      <div className="p-5">
        {productName ? (
          <div>
            <div className="relative flex justify-center">
              <MoveLeft
                className="absolute top-3 left-3 hover:cursor-pointer"
                onClick={() => {
                  router.back();
                }}
              />
              <div className="flex flex-col mb-8 text-center">
                <p className="text-lg text-stone-200 font-semibold">
                  Tracking product journey!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap lg:flex-nowrap gap-4 mb-5">
              <div className="flex flex-col gap-1 bg-white bg-opacity-15 shadow-md rounded-md p-5 justify-center w-full lg:w-1/4">
                <p>Product Name</p>
                <p className="text-2xl font-bold">{productName}</p>
              </div>
              <div className="flex flex-col gap-1 bg-white bg-opacity-15 shadow-md rounded-md p-5 justify-center w-full lg:w-1/4">
                <p>Expiry Date</p>
                <p className="text-2xl font-bold">
                  {new Date(expiry / 1000).toLocaleString().slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center bg-white bg-opacity-15 shadow-md rounded-md p-5 w-full lg:w-2/4">
                <p className="text-xl font-bold m-0 p-0">
                  Make sure to check Product Name, expiry date and Retailer
                  Authenticity
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
                    <div className="mb-3">
                      {index == 0 ? (
                        <div className="flex gap-x-3">
                          <Package />{" "}
                          <p className="text-lg font-semibold">
                            Ingredient Aggregation
                          </p>
                        </div>
                      ) : index == 1 ? (
                        <div className="flex gap-x-3">
                          <Factory />{" "}
                          <p className="text-lg font-semibold">
                            Manufacturing
                          </p>{" "}
                        </div>
                      ) : index == 2 ? (
                        <div className="flex gap-x-3">
                          <Truck />
                          <p className="text-lg font-semibold">Distributor</p>
                        </div>
                      ) : (
                        <div className="flex gap-x-3">
                          <ShoppingBag />
                          <p className="text-lg font-semibold">Retailer</p>
                        </div>
                      )}
                    </div>

                    <p className="bg-blue-900 py-1 px-3 rounded-full w-fit">
                      {JSON.parse(step[1]).companyName}
                    </p>
                    <p className="ml-3 font-light">
                      {JSON.parse(step[1]).location}
                    </p>
                    <div className="my-4">
                      {JSON.parse(step[1]).ingredients ? (
                        <div className="flex flex-col px-3">
                          <p>Ingredients</p>

                          <div className="flex gap-x-3 mt-1">
                            {JSON.parse(step[1]).ingredients.map(
                              (detail, index) => (
                                <div
                                  key={index}
                                  className="flex gap-x-2 pr-3 bg-slate-100 rounded-full text-gray-800 items-center"
                                >
                                  <p className="bg-blue-800 border border-blue-600 px-3 rounded-full text-slate-100">
                                    {detail.name}
                                  </p>
                                  <p>{detail.location}</p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <hr className="my-3 border-0 bg-blue-400 h-px" />

                    <div className="flex justify-between px-3">
                      <p>Timestamp</p>
                      <p>{new Date(step[2]).toLocaleString()}</p>
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
                {currentStage === 0
                  ? "Scan the Product Code (1/2)"
                  : "Scan the Retailer Code (2/2)"}
              </h1>
            </div>
            <BarcodeScannerComponent
              width={"80%"}
              height={"50%"}
              delay={3000}
              onUpdate={(err, result) => {
                if (result) handleScan(result.text);
                // else setData("Not Found");
              }}
            />
          </div>
        )}
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-400 fill-blue-600"
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
            <p className="mt-2 text-xl font-bold text-blue-700">
              Now scan the Retailer Code
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
