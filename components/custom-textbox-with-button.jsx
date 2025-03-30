import { useRetailerWithDistributor } from "@/custom-hook/useRetailerWithDistributor";
import { supabase } from "@/utils/supabaseClient";
import { Button, Input } from "@heroui/react";
import { useState } from "react";

export default function CustomTextBoxWithButton({ distributorId, label }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Access retailerDetails and retailPartnerIds from the hook
  const { retailerDetails, retailPartnerIds, setRetailPartnerIds } =
    useRetailerWithDistributor(distributorId);
  async function onPress() {
    setLoading(true);
    console.log("distributorId:", distributorId, " retailerId:", value);
    try {
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

      if (response.ok) {
        // Assuming the backend returns the *updated* list of retailer_ids

        await setRetailPartnerIds(distributorId); // Update the parent's state
        setValue(""); // Clear the input
      } else {
        console.error("API add retailer failed:", data.error);
        // Handle API error (e.g., show an error message)
      }
    } catch (error) {
      console.error("Error adding retailer:", error);
      // Handle network or other errors
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-7 items-center">
      <Input
        label={label}
        type="text"
        variant="bordered"
        onValueChange={setValue}
        value={value}
        className="col-span-7"
      />
      <div className="col-span-2"></div>
      <Button
        color="success"
        className="col-span-3"
        isLoading={loading}
        onPress={onPress}
        isDisabled={loading}
      >
        {loading ? "Adding..." : "Add"}
      </Button>
    </div>
  );
}
