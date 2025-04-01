"use client";

import Navbar from "@/components/navbar";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, ArrowLeft, Copy } from "lucide-react";
import { useGeolocated } from "react-geolocated";
import { getDistance, getPreciseDistance } from "geolib";
import { CustomModal } from "@/components/custom-modal";
import { CustomTable } from "@/components/custom-table";
import { useRetailerWithDistributor } from "@/custom-hook/useRetailerWithDistributor";
import CustomTextBoxWithButton from "@/components/custom-textbox-with-button";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useMemo } from "react";
//import QRCode from "qrcode.react";
import { QRCodeSVG } from "qrcode.react";

export default function Dashboard() {
  const router = useRouter();
  const user_metadata = JSON.parse(localStorage.getItem("user_metadata"));
  const user_id = localStorage.getItem("user_id");
  const [fullUserData, setFullUserData] = useState({});
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
  const [requestApproval, setRequestApproval] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [coordinatesMatch, setCoordinatesMatch] = useState(false);
  const [productCodeButtonText, setProductCodeButtonText] = useState("Copy Product Code");
  const [qrCodeButtonText, setQrCodeButtonText] = useState("Copy QR Code");
  let expirydate = useRef("");
  const [retailerModal, setRetailerModal] = useState(false);
  const [retailerDetails, setRetailerDetails] = useState();

  // let distributor = "8d5e546e-dc8f-49c3-9da1-d88d97334d65";
  //
  const facilityCode = useMemo(
    () => fullUserData.facility_code,
    [fullUserData.facility_code],
  );

  const handleToggleRetailerModal = () => {
    setRetailerModal((prev) => !prev); // Correctly toggle the state
  };

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    });

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
        // **Moved the approval_data fetch inside this block**
        setLocation(user_data[0].location || "");
        setCompanyName(user_data[0].company_name || "");
        if (!user_data[0].location || !user_data[0].company_name) {
          setShowModal(true);
        }
        setFullUserData(user_data[0]);

        // Now fetch approval_data using the facility_code *after* user_data is available
        const { data: approval_data, error: approval_error } = await supabase
          .from("approval_data")
          .select("*")
          .eq("id", user_data[0].facility_code); // Access facility_code from user_data[0]

        if (approval_error) {
          setError(approval_error.message);
          return;
        }

        if (approval_data.length === 1) {
          setRequestApproval(true);
        }
      } else {
        setShowModal(true);
      }
    };

    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  useEffect(() => {
    const fetchLocationFromDB = async () => {
      let { data: user_data, error } = await supabase
        .from("user_data")
        .select("location, coordinates")
        .eq("id", user_id);

      if (error) {
        setError(error.message);
        return;
      }

      if (user_data && user_data.length > 0) {
        if (user_data[0].location) {
          setLocation(user_data[0].location);
        }

        // Check if coordinates exist and match current location
        if (user_data[0].coordinates && coords) {
          const storedCoords = user_data[0].coordinates;
          const currentCoords = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          };

          // Compare coordinates with some tolerance for accuracy
          const latMatch =
            Math.abs(storedCoords.latitude - currentCoords.latitude) < 0.0001;
          const lonMatch =
            Math.abs(storedCoords.longitude - currentCoords.longitude) < 0.0001;
          const accMatch =
            Math.abs(storedCoords.accuracy - currentCoords.accuracy) < 10;

          setCoordinatesMatch(latMatch && lonMatch && accMatch);
        }
      } else if (coords && !location) {
        const { latitude, longitude, accuracy } = coords;
        const fetchAddress = async () => {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          console.log(data);
          if (data && data.address) {
            // Create an array of address components and filter out empty values
            const addressComponents = [
              data.address.road,
              data.address.suburb,
              data.address.neighbourhood,
              data.address.city,
              data.address.town,
              data.address.village,
              data.address.state,
              data.address.country,
            ].filter((component) => component && component.trim() !== "");

            // Join the components with commas and spaces
            const address = addressComponents.join(", ");
            setLocation(address);

            // Store the coordinates in the database
            const { error: updateError } = await supabase
              .from("user_data")
              .update({
                coordinates: {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  accuracy: coords.accuracy,
                },
              })
              .eq("id", user_id);

            if (updateError) {
              setError(updateError.message);
            } else {
              setCoordinatesMatch(true);
            }
          } else {
            setError("Unable to fetch address");
          }
        };
        fetchAddress();
      }
    };

    if (user_id) {
      fetchLocationFromDB();
    }
  }, [coords, location, user_id]);

  // if (user_metadata.role === "Distributor") {
  //   let { retailerDetails: retDet, retailPartnerIds: retIds } =
  //     useRetailerWithDistributor(fullUserData.facility_code, retailPartnerIds);
  // }
  // useEffect(()=>{
  //     console.log("Initial setup");
  //     setRetailPartnerIds(retIds);
  //     setRetailerDetails(retDet);
  // }, []);

  // useEffect(() => {
  //   console.log("pre data store: ", retDet, retIds);
  //   setRetailerDetails(retDet);
  //   setRetailPartnerIds(retIds);

  //   console.log("inside useeffect: ", retailPartnerIds, retailerDetails);
  // }, [retailPartnerIds, retailerDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let coordinates = null;
    if (coords) {
      coordinates = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      };
    }

    const { data, error } = await supabase
      .from("user_data")
      .upsert({ id: user_id, location, company_name: companyName, coordinates })
      .select();

    if (error) {
      setError(error.message);
    } else {
      setShowModal(false);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", location: "" }]);
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
    setLoading(true);

    let data = {
      productName: productName,
      ingredientDetails: JSON.stringify({
        ingredients: ingredients,
        companyName: companyName,
        location: location,
      }),
    };

    const url = "http://localhost:5000/api/create";

    console.log("Data: ", JSON.stringify(data));

    let response, final;
    let count = 0;

    while (count < 3) {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      final = await response.json();

      if (response.status === 200) {
        break;
      } else {
        console.log("Failed, Retrying...");
        count++;
      }
    }

    console.log("Result:", final);

    setProductCode(final.productCode);

    setLoading(false);
    setDone(true);
  };

  const handleScan = async (result) => {
    if (result && companyName && location) {
      // console.log("Scanned code:", result[0].rawValue);
      // setScannedCode(result[0].rawValue);
      console.log("scanned code: ", result);
      const code = result;
      const url = "http://localhost:5000/api/update";

      let data = {};

      if (user_metadata.role === "Manufacturer" && expirydate.current) {
        data.expiryDate = expirydate.current.valueOf().toString();
      }

      if (user_metadata.role === "Distributor") {
        data.distributorCode = facilityCode;
      }

      if (user_metadata.role === "Retailer") {
        data.retailerCode = facilityCode;
      }

      data.producerDetails = user_metadata.role;
      data.productCode = result;
      data.facilityDetails = JSON.stringify({
        companyName: companyName,
        location: location,
      });

      console.log(JSON.stringify(data));

      setLoading(true);
      let count = 0;

      while (count < 3) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const final = await response.json();

        if (response.status === 200) {
          break;
        } else {
          console.log("Failed, Retrying...");
          count++;
        }
      }

      setLoading(false);
      setDone(true);

      console.log("done");
    }
  };

  const handleApprovalRequest = async (e) => {
    e.preventDefault();

    const { _, error } = await supabase
      .from("approval_data")
      .insert([{ id: facilityCode }])
      .select();

    if (error) {
      setError(error.message);
    } else {
      setRequestApproval(true);
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
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold text-center break-words text-green-700">
                Product Code: {productCode}
              </p>
              <div id="qr-code-container" className="bg-white p-2 rounded-lg mt-4 w-[220px] h-[220px] flex items-center justify-center">
                <QRCodeSVG
                  value={productCode.toString()}
                  size={200}
                  level="H"
                  margin={10}
                />
              </div>
              <p className="text-sm text-green-700 mt-2">Scan this QR code to update product details</p>
              <div className="flex gap-2 justify-center mt-2">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(productCode);
                      setError("Product code copied to clipboard!");
                      setProductCodeButtonText("Copied!");
                      setTimeout(() => {
                        setError(null);
                        setProductCodeButtonText("Copy Product Code");
                      }, 2000);
                    } catch (error) {
                      console.error('Failed to copy product code:', error);
                      setError("Failed to copy product code. Please try again.");
                    }
                  }}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  <Copy size={16} />
                  {productCodeButtonText}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const qrElement = document.getElementById('qr-code-container').querySelector('svg');
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      
                      // Set canvas size with padding
                      const padding = 10;
                      canvas.width = 200 + (padding * 2);
                      canvas.height = 200 + (padding * 2);
                      
                      // Convert SVG to image
                      const svgData = new XMLSerializer().serializeToString(qrElement);
                      const img = new Image();
                      
                      img.onload = async () => {
                        // Draw white background
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw QR code with padding
                        ctx.drawImage(img, padding, padding);
                        
                        // Convert to blob and copy to clipboard
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        const clipboardItem = new ClipboardItem({
                          'image/png': blob
                        });
                        await navigator.clipboard.write([clipboardItem]);
                        
                        setError("QR code copied to clipboard!");
                        setQrCodeButtonText("Copied!");
                        setTimeout(() => {
                          setError(null);
                          setQrCodeButtonText("Copy QR Code");
                        }, 2000);
                      };
                      
                      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    } catch (error) {
                      console.error('Failed to copy QR code:', error);
                      setError("Failed to copy QR code. Please try again.");
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  <Copy size={16} />
                  {qrCodeButtonText}
                </button>
              </div>
            </div>
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
              <p className="text-xl font-bold text-blue-700">Loading...</p>
            </div>
          </div>
        )}
        {user_id ? (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {fullUserData.approved &&
                user_metadata.role === "Distributor" && (
                  <button
                    onClick={handleToggleRetailerModal}
                    className="bg-cyan-500 text-white px-4 py-2 rounded font-semibold"
                  >
                    Add Retailer
                  </button>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                <p className="text-xl font-semibold">Name</p>
                <p className="text-md font-medium">{user_metadata.full_name}</p>
              </div>
              <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                <p className="text-xl font-semibold">Role</p>
                <p className="text-md font-medium">{user_metadata.role}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                <p className="text-xl font-semibold">Company Name</p>
                <p className="text-md font-medium flex gap-3 items-center justify-between">
                  <span>{companyName}</span>{" "}
                  {user_metadata.role === "Distributor" && (
                    <div>
                      {fullUserData.approved ? (
                        <span className="bg-green-500 text-white px-1 rounded text-[10px]">
                          Approved!
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-1 rounded text-[10px]">
                          Not Approved!
                        </span>
                      )}
                    </div>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                <p className="text-xl font-semibold">Location</p>
                <p className="text-md font-medium">{location}</p>
              </div>
            </div>
            {user_metadata.role === "Retailer" && (
              <div className="flex flex-col gap-1 bg-white bg-opacity-20 p-4 rounded-md shadow">
                <div className="flex flex-col items-center">
                  <p className="text-xl font-semibold">Retailer Code</p>
                  <p className="text-md font-medium text-center mt-2">{facilityCode}</p>
                  {facilityCode && (
                    <div id="retailer-qr-container" className="bg-white p-2 rounded-lg mt-4 w-[220px] h-[220px] flex items-center justify-center">
                      <QRCodeSVG
                        value={facilityCode.toString()}
                        size={200}
                        level="H"
                        margin={10}
                      />
                    </div>
                  )}
                  <p className="text-base font-medium text-white mt-3 text-center">Scan this QR code to share your retailer code</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(facilityCode);
                          setProductCodeButtonText("Copied!");
                          setTimeout(() => {
                            setProductCodeButtonText("Copy Retailer Code");
                          }, 2000);
                        } catch (error) {
                          console.error('Failed to copy retailer code:', error);
                          setError("Failed to copy retailer code. Please try again.");
                        }
                      }}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      <Copy size={16} />
                      {productCodeButtonText}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const qrElement = document.getElementById('retailer-qr-container').querySelector('svg');
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          
                          // Set canvas size with padding
                          const padding = 10;
                          canvas.width = 220;
                          canvas.height = 220;
                          
                          // Convert SVG to image
                          const svgData = new XMLSerializer().serializeToString(qrElement);
                          const img = new Image();
                          
                          img.onload = async () => {
                            // Draw white background
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // Draw QR code with padding
                            ctx.drawImage(img, padding, padding);
                            
                            // Convert to blob and copy to clipboard
                            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                            const clipboardItem = new ClipboardItem({
                              'image/png': blob
                            });
                            await navigator.clipboard.write([clipboardItem]);
                            
                            setQrCodeButtonText("Copied!");
                            setTimeout(() => {
                              setQrCodeButtonText("Copy QR Code");
                            }, 2000);
                          };
                          
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        } catch (error) {
                          console.error('Failed to copy QR code:', error);
                          setError("Failed to copy QR code. Please try again.");
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      <Copy size={16} />
                      {qrCodeButtonText}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  <form onSubmit={handleAggregatorSubmit} className="space-y-4">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex space-x-4 items-center">
                        <input
                          type="text"
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "name",
                              e.target.value,
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
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2 text-black rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
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
              <div>
                {user_metadata.role === "Manufacturer" && (
                  <div className="bg-white bg-opacity-15 p-4 rounded-md shadow flex gap-4 items-center justify-between">
                    <h2 className="text-lg font-semibold mb-2">
                      Enter Expiry Date
                    </h2>
                    <input
                      type="date"
                      placeholder="expiry date"
                      onChange={(e) => {
                        expirydate.current = new Date(e.target.value);
                      }}
                      className="px-3 py-2 text-black rounded w-48"
                    />
                  </div>
                )}

                {user_metadata.role === "Distributor" &&
                !fullUserData.approved &&
                !requestApproval ? (
                  <div>
                    <div className="bg-white bg-opacity-15 p-4 rounded-md shadow flex gap-4 items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Not Approved yet! Click the button to request for
                        approval
                      </h2>
                      <button
                        className="bg-green-500 px-4 py-2 rounded font-semibold"
                        onClick={handleApprovalRequest}
                      >
                        Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {user_metadata.role === "Distributor" &&
                      !fullUserData.approved &&
                      requestApproval && (
                        <div>
                          <div className="bg-white bg-opacity-15 p-4 rounded-md shadow flex gap-4 items-center justify-between">
                            <h2 className="text-lg font-semibold">
                              You have already sent a request. Please wait for
                              approval!
                            </h2>
                          </div>
                        </div>
                      )}
                  </div>
                )}
                <div className="mt-8 z-10">
                  <h2 className="text-xl font-bold mb-4">QR Code Scanner</h2>
                  {!showModal ? (
                    <div className="flex flex-col items-center gap-4">
                      {!coordinatesMatch ? (
                        <div className="text-center">
                          <p className="text-red-500 mb-4">
                            Your current location does not match the registered
                            location. Please ensure you are at the correct
                            facility.
                          </p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>Current Location:</p>
                            <p>
                              Latitude:{" "}
                              {coords
                                ? coords.latitude.toFixed(6)
                                : "Not available"}
                            </p>
                            <p>
                              Longitude:{" "}
                              {coords
                                ? coords.longitude.toFixed(6)
                                : "Not available"}
                            </p>
                            <p>
                              Accuracy:{" "}
                              {coords
                                ? coords.accuracy.toFixed(2) + " meters"
                                : "Not available"}
                            </p>
                          </div>
                        </div>
                      ) : !showScanner ? (
                        <>
                          <button
                            onClick={() => {
                              if (user_metadata.role === "Manufacturer") {
                                if (expirydate.current !== "")
                                  setShowScanner(true);
                                else alert("Please enter expiry date");
                              } else {
                                setShowScanner(true);
                              }
                            }}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                          >
                            Start Scanning
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 w-3/4">
                          <button
                            onClick={() => setShowScanner(false)}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <X size={20} />
                            Stop Scanning
                          </button>
                          {/* <Scanner
                            onScan={handleScan}
                            onError={(error) => console.log(error)}
                            formats={["qr_code"]}
                            components={{
                              zoom: false,
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
                          /> */}
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
                  ) : (
                    <div></div>
                  )}
                </div>
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

        {user_metadata.role === "Distributor" && (
          <CustomModal
            openModal={retailerModal}
            onClose={handleToggleRetailerModal}
            subComponent={
              <div className="flex flex-col gap-y-7">
                <CustomTable distributorId={facilityCode} />
                <p className="text-lg font-semibold">Add new retailer</p>
                <CustomTextBoxWithButton
                  distributorId={facilityCode}
                  label={"Facility Code"}
                />
              </div>
            }
            heading={"Retail Partners"}
          />
        )}
      </div>
    </main>
  );
}
