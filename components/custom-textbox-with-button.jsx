import { supabase } from "@/utils/supabaseClient";
import { Button, Input } from "@heroui/react";
import { useState } from "react";

export default function CustomTextBoxWithButton({
  partnerIds,
  distributorId,
  setRetailPartnerIds,
  label,
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function onPress() {
    setLoading(true);

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
        partnerIds.push(value);

        const { data: supData, error: supError } = await supabase
          .from("retail_partners")
          .update({ retailer_ids: partnerIds })
          .eq("distributor_id", distributorId)
          .select();
        if (!supError) {
          console.log(
            "inserted successfully!, data: ",
            supData[0].retailer_ids,
          );
          setRetailPartnerIds(supData[0].retailer_ids);
          setValue("");
        } else {
          console.log("failed");
        }
      } else {
        console.log("failed to add retailer: ", data.error);
      }
    } catch (error) {
      console.log("Error adding retailer: ", error);
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
