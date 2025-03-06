"use client";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Superuser() {
    const router = useRouter();
    const [approvalData, setApprovalData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApprovalData();
    }, []);

    const fetchApprovalData = async () => {
        const { data, error } = await supabase
            .from("approval_data")
            .select(`
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

    const handleApprove = async (userId, approvalId) => {
        if (!userId) {
            console.error("Error: Missing userId in request");
            return;
        }

        console.log("Approving distributor with ID:", userId);

        try {
            // Step 1: Send approval request to the backend API
            const response = await fetch("http://localhost:5000/api/approve/distributor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ distributorCode: userId }),
            });

            const data = await response.json();
            console.log("Response from backend:", data);

            if (!response.ok) {
                throw new Error(data.error || "Failed to approve distributor. Please try again.");
            }

            console.log("Distributor approved successfully!");

            // Step 2: Update `approved` column in `user_data` table
            const { error: updateError } = await supabase
                .from("user_data")
                .update({ approved: true }) // Setting approved to TRUE
                .eq("id", userId);

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
                .eq("id", approvalId);

            if (deleteError) {
                console.error("Error deleting from approval_data:", deleteError);
                setError(deleteError.message);
                return;
            }

            console.log("Deleted approval entry from approval_data");

            // Step 4: Refresh the approval list after all updates are complete
            fetchApprovalData();
        } catch (error) {
            console.error("Approval error:", error);
            setError(error.message);
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
                                        <td className="border border-white px-4 py-2">{item.created_at}</td>
                                        <td className="border border-white px-4 py-2">{item.user_data?.company_name || "N/A"}</td>
                                        <td className="border border-white px-4 py-2">{item.user_data?.approved ? "Yes" : "No"}</td>
                                        <td className="border border-white px-4 py-2">
                                            {!item.user_data?.approved && (
                                                <button
                                                    onClick={() => handleApprove(item.user_data.id, item.id)}
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
        </main>
    );
}
