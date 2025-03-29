import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";

export function useRetailerWithDistributor(distributorId, PretailPartnerIds) {

    const [retailPartnerIds, setRetailPartnerIds] = useState();
    const [retailerDetails, setRetailerDetails] = useState();

    useEffect(() => {
        const fetchApprovalData = async () => {
            const { data: retailer, error1 } = await supabase
                .from("retail_partners")
                .select(`
                    retailer_ids
                `)
                .eq("distributor_id", distributorId);
    
            if (error1) {
                console.error("Error fetching approval data:", error1);
                // setError(error1.message);
            } else {
                setRetailPartnerIds(retailer[0].retailer_ids);
                console.log("Fetched approval data:", retailer);
            }
        };

        fetchApprovalData();
    }, [PretailPartnerIds]);

    useEffect(()=>{
        const fetchApprovalData = async () => {

            console.log("retailIds before searching: ", retailPartnerIds);
            const { data: retailerData, error } = await supabase
                .from("user_data")
                .select(`*`)
                .in("facility_code", retailPartnerIds);

                if (error) {
                    console.error("Error fetching approval data:", error);
                    // setError(error.message);
                } else {
                    setRetailerDetails(retailerData);
                    console.log("Fetched approval data2:", retailerData);
                }
        }

        fetchApprovalData();
    }, [retailPartnerIds])

    

    return {retailerDetails, retailPartnerIds};
    
}