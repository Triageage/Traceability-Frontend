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
      if (error.code === 'PGRST116') { // No rows returned
        setRetailPartnerIds([]); // Set to empty array if no data
      } else {
        console.error("Error fetching retailer IDs:", error);
      }
    } else if (retailer) {
      setRetailPartnerIds(retailer.retailer_ids || []);
    }
  }, [distributorId]);

  const addRetailerToPartners = async (retailerId) => {
    if (!distributorId || !retailerId) return false;

    try {
      // First try to get existing record
      const { data: existingRecord, error: fetchError } = await supabase
        .from("retail_partners")
        .select("retailer_ids")
        .eq("distributor_id", distributorId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRecord) {
        // Record exists, update it
        const updatedIds = [...new Set([...existingRecord.retailer_ids, retailerId])];
        const { error: updateError } = await supabase
          .from("retail_partners")
          .update({ retailer_ids: updatedIds })
          .eq("distributor_id", distributorId);

        if (updateError) throw updateError;
      } else {
        // No record exists, create new one
        const { error: insertError } = await supabase
          .from("retail_partners")
          .insert([
            {
              distributor_id: distributorId,
              retailer_ids: [retailerId]
            }
          ]);

        if (insertError) throw insertError;
      }

      // Refresh the retailer IDs list
      await fetchRetailPartnerIds();
      return true;
    } catch (error) {
      console.error("Error updating retail partners:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchRetailPartnerIds();
  }, [fetchRetailPartnerIds]);

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
    addRetailerToPartners,
  };
}
