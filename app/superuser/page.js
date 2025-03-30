"use client";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Superuser() {
  const router = useRouter();
  const [approvalData, setApprovalData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const fetchApprovalData = async () => {
    const { data, error } = await supabase.from("approval_data").select(`
                id,
                created_at,
                user_data (
                    id,
                    company_name,
                    approved
                )
            `);

    if (error) {
      console.error("Error fetching approval data:", error);
      setError(error.message);
    } else {
      setApprovalData(data);
      console.log("Fetched approval data:", data);
    }
  };

  const handleApprove = async (facilityCode) => {
    if (!facilityCode) {
      console.error("Error: Missing userId in request");
      return;
    }

    console.log("Approving distributor with ID:", facilityCode);
    setIsLoading(true);

    try {
      // Step 1: Send approval request to the backend API
      const response = await fetch(
        "http://localhost:5000/api/approve/distributor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ distributorCode: facilityCode }),
        },
      );

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to approve distributor. Please try again.",
        );
      }

      console.log("Distributor approved successfully!");

      // Step 2: Update `approved` column in `user_data` table
      const { error: updateError } = await supabase
        .from("user_data")
        .update({ approved: true }) // Setting approved to TRUE
        .eq("facility_code", facilityCode);

      if (updateError) {
        console.error("Error updating user_data:", updateError);
        setError(updateError.message);
        return;
      }

      console.log("User approved successfully in user_data");

      // Step 3: Delete the row from `approval_data`
      const { error: deleteError } = await supabase
        .from("approval_data")
        .delete()
        .eq("id", facilityCode);

      if (deleteError) {
        console.error("Error deleting from approval_data:", deleteError);
        setError(deleteError.message);
        return;
      }
      console.log("Deleted approval entry from approval_data");

      const { error: deleteError2 } = await supabase
        .from("retail_partners")
        .insert({ distributor_id: facilityCode, retailer_ids: [] });

      if (deleteError2) {
        console.error(
          "Error Inserting data into retail_partners:",
          deleteError2,
        );
        setError(deleteError2.message);
        return;
      } else {
        console.log("Data inserted into retail_partners successfully!");
      }

      // Step 4: Refresh the approval list after all updates are complete
      await fetchApprovalData(); // Await the fetch
    } catch (error) {
      console.error("Approval error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)]">
        <button
          onClick={() => {
            router.push("/login");
          }}
          className="absolute top-4 right-4 font-bold bg-red-500 px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-8 w-full flex flex-col items-center">
          <h2 className="text-xl font-bold text-center">Approval Data</h2>
          <table className="table-auto mt-4 border-collapse border border-white w-3/4 text-center">
            <thead>
              <tr className="border border-white">
                <th className="px-4 py-2 border border-white">ID</th>
                <th className="px-4 py-2 border border-white">Created At</th>
                <th className="px-4 py-2 border border-white">Company Name</th>
                <th className="px-4 py-2 border border-white">Approved</th>
                <th className="px-4 py-2 border border-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvalData.length > 0 ? (
                approvalData.map((item) => (
                  <tr key={item.id} className="border border-white">
                    <td className="border border-white px-4 py-2">{item.id}</td>
                    <td className="border border-white px-4 py-2">
                      {item.created_at}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {item.user_data?.company_name || "N/A"}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {item.user_data?.approved ? "Yes" : "No"}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {!item.user_data?.approved && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-white py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
            <p className="mt-2 text-xl font-bold text-blue-700">Loading...</p>
          </div>
        </div>
      )}
    </main>
  );
}
