import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { MoveLeft } from "lucide-react";


export default function QRCodePage() {
  const [name, setName] = useState("");
  const [journey, setJourney] = useState<any[]>([]);
  const [productName, setProductName] = useState("");
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [role, setRole] = useState(""); // Manufacturer, Distributor, Retailer
  const navigate = useNavigate();

  // Fetch user details (company name, location, and role) from the backend
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        let details = localStorage.getItem("data");
        if (details) {
          let res = JSON.parse(details)
          setCompanyName(res.company_name);
          setCompanyLocation(res.company_location);
          setRole(res.role);
          console.log(res.role,role); // Role will be either 'Manufacturer', 'Distributor', or 'Retailer'
        } else {
          setMessage("Error fetching user details: ");
        }
      } catch (error) {
        setMessage("An error occurred while fetching company details.");
      }
    };

    fetchCompanyDetails();
  }, []);

  // Fetch product journey based on the scanned QR code and update blockchain
  async function get_journey(address: string) {
    setName(address);
    setMessage("Loading product journey...");

    try {
      // Fetch product history
      const journeyUrl = `http://localhost:5000/api/product/${address}`;
      const journeyResult = await fetch(journeyUrl);
      const journeyData = await journeyResult.json();
      setJourney(journeyData.productHistory);
      setProductName(journeyData.productHistory[0]?.name || "Unknown Product");

      // After fetching journey, update the blockchain automatically
      await updateBlockchain(address);
    } catch (error) {
      setMessage("An error occurred while fetching product journey.");
    }
  }

  // Function to update blockchain automatically with the fetched user details
  const updateBlockchain = async (productCode: string) => {
    try {
      const updateUrl = "http://localhost:5000/api/update";
      const updateData = {
        productCode, // This is obtained from the QR code scan
        facilityDetails: `[${companyName}:${companyLocation}]`, // Format: [CompanyName:Location]
        producerDetails: role, // Role fetched from the backend
      };

      const response = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const finalResult = await response.json();
      if (response.ok) {
        setMessage("Successfully updated the blockchain.");
        console.log("Blockchain update result:", finalResult);
      } else {
        setMessage("Error updating blockchain: " + finalResult.error);
      }
    } catch (error) {
      setMessage("An error occurred while updating the blockchain.");
    }
  };

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
                    <p className="text-lg font-semibold">
                      Stage {step.index}: {step.stage}
                    </p>
                    <p className="bg-blue-900 py-1 px-3 rounded-full w-fit">
                      {step.performer_details.split(":")[0].slice(1)}
                    </p>
                    <p className="ml-3 font-light">
                      {step.performer_details.split(":")[1].slice(0, -1)}
                    </p>
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

            {/* Success or Error Message */}
            {message && <p>{message}</p>}
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
              onScan={async (result) => await get_journey(result[0].rawValue)}
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