"use client";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient"; // Adjust the import path as needed

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
        console.log("Approving user with ID:", userId);

        // Step 1: Update the `approved` column in `user_data`
        const { error: updateError } = await supabase
            .from("user_data")
            .update({ approved: true })
            .eq("id", userId);

        if (updateError) {
            console.error("Error updating user_data:", updateError);
            setError(updateError.message);
            return;
        }

        console.log("User approved successfully in user_data");

        // Step 2: Delete the row from `approval_data`
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

        // Step 3: Re-fetch updated data from Supabase
        fetchApprovalData();
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
                    {/* Centered Heading */}
                    <h2 className="text-xl font-bold text-center mb-4">Approval Data</h2>

                    {/* Table with always visible borders */}
                    <table className="border border-white border-collapse w-full max-w-4xl">
                        <thead>
                            <tr className="bg-blue-800">
                                <th className="border border-white px-4 py-2">ID</th>
                                <th className="border border-white px-4 py-2">Created At</th>
                                <th className="border border-white px-4 py-2">Company Name</th>
                                <th className="border border-white px-4 py-2">Approved</th>
                                <th className="border border-white px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvalData.length > 0 ? (
                                approvalData.map((item) => (
                                    <tr key={item.id} className="bg-blue-700">
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
                                // Empty row when no data is available
                                <tr className="bg-blue-700">
                                    <td className="border border-white px-4 py-2 text-center" colSpan="5">
                                        No pending approvals
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
