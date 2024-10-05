import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Truck, MoveLeft, ShoppingBag, Factory, Package } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [journey, setJourney] = useState<any[]>([]);
  const [productName, setProductName] = useState("");
  const [companyName, setCompanyName] = useState("MyCompany");
  const [location, setLocation] = useState("MyLocation");
  const [role, setRole] = useState(""); // Automatically set

  const navigate = useNavigate();

  // Function to fetch company details and set role automatically
  async function fetchCompanyDetails() {
    try {
      const companyDetailsUrl = "http://localhost:5000/get_company_details.php";
      const result = await fetch(companyDetailsUrl);
      const data = await result.json();

      if (data.success) {
        setCompanyName(data.companyName);
        setLocation(data.companyLocation);
        setRole(data.role); // Automatically set the role here
      } else {
        console.error("Error fetching company details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  }

  // Fetch product journey based on the scanned QR code and update blockchain
  async function get_journey(address: string) {
    setName(address);

    try {
      // Fetch product history
      const journeyUrl = http://localhost:5000/api/product/${address};
      const journeyResult = await fetch(journeyUrl);
      const journeyData = await journeyResult.json();

      if (journeyData.productHistory && journeyData.productHistory.length > 0) {
        setJourney(journeyData.productHistory);
        setProductName(journeyData.productHistory[1]?.name || "Unknown Product");
      } else {
        setJourney([]);
        setProductName("Unknown Product");
      }

      // Data to be sent to blockchain update API
      const updateUrl = "http://localhost:5000/api/update";
      const updateData = {
        productCode: address,
        facilityDetails: ${companyName}:${location}, // e.g., facility name and location
        producerDetails: role, // Automatically fetched role
      };

      // Make the POST request to update the blockchain
      const response = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const finalResult = await response.json();
      if (response.ok) {
        console.log("Blockchain update result:", finalResult);
      } else {
        console.error("Error updating blockchain:", finalResult.error);
      }
    } catch (error) {
      console.error("Error fetching journey data:", error);
    }
  }

  // Fetch company details on component mount
  useEffect(() => {
    fetchCompanyDetails(); // Fetch company details automatically
  }, []);

  return (
    <main className="min-h-lvh h-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
      <div className="p-5">
        {name ? (
          <div>
            <div className="relative flex justify-center">
              <MoveLeft
                className="absolute top-3 left-3 hover:cursor-pointer"
                onClick={() => navigate(-1)} // React equivalent of router.back()
              />
              <div className="flex flex-col mb-8 text-center">
                <p className="text-2xl font-semibold text-center">{productName}</p>
                <p className="text-stone-200 font-light">Tracking product journey!</p>
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
                      {step.index === 1 ? (
                        <Package />
                      ) : step.index === 2 ? (
                        <Factory />
                      ) : step.index === 3 ? (
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
                      {step.performer_details.split(":")[1].slice(0, -1)}
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
                              .map((ingredient: any, idx: any) => (
                                <div
                                  key={idx}
                                  className="flex gap-x-2 pr-3 bg-slate-100 rounded-full text-gray-800 items-center"
                                >
                                  <p className="bg-blue-800 border border-blue-600 px-3 rounded-full text-slate-100">
                                    {ingredient.split(":")[0]}
                                  </p>
                                  <p>{ingredient.split(":")[1]}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <hr className="my-3 border-0 bg-blue-400 h-px" />
                    <div className="flex justify-between px-3">
                      <p>Timestamp</p>
                      <p>{new Date(step.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading journey data...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-y-5">
            <div className="relative flex justify-center">
              <MoveLeft
                className="absolute top-1 left-3 hover:cursor-pointer"
                onClick={() => navigate(-1)} // Navigate back
              />
              <h1 className="text-2xl font-semibold text-center">
                Scan QR Code from here to get product journey!
              </h1>
            </div>
            <Scanner
              onScan={async (result) => {
                if (result && result[0]) {
                  await get_journey(result[0].rawValue);
                } else {
                  console.error("Scan result invalid");
                }
              }}
              onError={(error) => console.log(error)}
              formats={["qr_code"]}
              components={{ zoom: true, audio: false, finder: false }}
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
        )}
      </div>
    </main>
  );
}