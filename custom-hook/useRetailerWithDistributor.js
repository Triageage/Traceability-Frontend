import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState, useCallback } from "react";

export function useRetailerWithDistributor(distributorId) {
  const [retailPartnerIds, setRetailPartnerIds] = useState([]);
  const [retailerDetails, setRetailerDetails] = useState([]);

  const fetchRetailPartnerIds = useCallback(async () => {
    if (!distributorId) return;

    const { data: retailer, error } = await supabase
      .from("retail_partners")
      .select(`retailer_ids`)
      .eq("distributor_id", distributorId)
      .single(); // Expecting only one record

    if (error) {
      console.error("Error fetching retailer IDs:", error);
    } else if (retailer) {
      setRetailPartnerIds(retailer.retailer_ids || []);
    } else {
      console.warn("No retailer data found for distributor ID:", distributorId);
      setRetailPartnerIds([]); // Set to empty array if no data
    }
  }, [distributorId]);

  useEffect(() => {
    fetchRetailPartnerIds();
  }, [fetchRetailPartnerIds]); // Use useCallback here

  useEffect(() => {
    const fetchRetailerData = async () => {
      if (retailPartnerIds && retailPartnerIds.length > 0) {
        const { data: retailerData, error } = await supabase
          .from("user_data")
          .select(`*`)
          .in("facility_code", retailPartnerIds);

        if (error) {
          console.error("Error fetching retailer data:", error);
        } else {
          setRetailerDetails(retailerData || []); // Ensure it's an array
          console.log("Fetched retailer data:", retailerData);
        }
      } else {
        setRetailerDetails([]); // Set to empty array if no retailer IDs
      }
    };

    fetchRetailerData();
  }, [retailPartnerIds]);

  return {
    retailerDetails,
    retailPartnerIds,
    setRetailPartnerIds: fetchRetailPartnerIds,
  };
}
