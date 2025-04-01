import { useRetailerWithDistributor } from "@/custom-hook/useRetailerWithDistributor";
import { supabase } from "@/utils/supabaseClient";
import { Button, Input } from "@heroui/react";
import { useState, useEffect } from "react";

export default function CustomTextBoxWithButton({ distributorId, label }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState("");

  // Access retailerDetails and retailPartnerIds from the hook
  const { retailerDetails, retailPartnerIds, addRetailerToPartners } =
    useRetailerWithDistributor(distributorId);

  // Check if distributor is approved
  useEffect(() => {
    async function checkApproval() {
      try {
        const { data, error } = await supabase
          .from("user_data")
          .select("approved")
          .eq("facility_code", distributorId)
          .single();

        if (error) throw error;
        setIsApproved(data.approved);
      } catch (err) {
        console.error("Error checking distributor approval:", err);
        setError("Could not verify distributor approval status");
      }
    }

    if (distributorId) {
      checkApproval();
    }
  }, [distributorId]);

  async function onPress() {
    if (!isApproved) {
      setError("Distributor must be approved before adding retailers");
      return;
    }

    if (!value.trim()) {
      setError("Please enter a retailer code");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // First update the blockchain
      const response = await fetch("http://localhost:5000/api/add/retailer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distributorCode: distributorId,
          retailerCode: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add retailer to blockchain");
      }

      // Then update Supabase
      const success = await addRetailerToPartners(value);
      if (!success) {
        throw new Error("Failed to update retailer mapping in database");
      }

      setValue(""); // Clear the input on success
    } catch (error) {
      setError(error.message);
      console.error("Error adding retailer:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-12 gap-7 items-center">
        <Input
          label={label}
          type="text"
          variant="bordered"
          onValueChange={setValue}
          value={value}
          className="col-span-7"
          isDisabled={!isApproved || loading}
        />
        <div className="col-span-2"></div>
        <Button
          color="success"
          className="col-span-3"
          isLoading={loading}
          onPress={onPress}
          isDisabled={!isApproved || loading || !value.trim()}
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {!isApproved && (
        <p className="text-yellow-500 text-sm mt-1">
          Distributor must be approved before adding retailers
        </p>
      )}
    </div>
  );
}
