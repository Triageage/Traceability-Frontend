import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import {
  Button,
  getKeyValue,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import CustomSpinner from "./custom-spinner";
import { useRetailerWithDistributor } from "@/custom-hook/useRetailerWithDistributor";

function CustomTableComponent({ distributorId }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const { retailerDetails, retailPartnerIds, setRetailPartnerIds } =
    useRetailerWithDistributor(distributorId);

  const data = useMemo(() => retailerDetails, [retailerDetails]);

  const pages = useMemo(
    () => Math.ceil(data.length / rowsPerPage),
    [data.length, rowsPerPage],
  );

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [page, data, rowsPerPage]);

  const retailerCodes = useMemo(() => {
    return data.map((item) => item.facility_code);
  }, [data]);

  const removeRetailer = useCallback(
    async (id) => {
      setLoading(true); // Set loading here

      const updatedRetailerCodes = retailerCodes.filter((code) => code !== id);

      try {
        const response = await fetch(
          "http://localhost:5000/api/remove/retailer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              distributorCode: distributorId,
              retailerCode: id,
            }),
          },
        );

        const data = await response.json();

        if (response.ok) {
          // const { error } = await supabase
          //   .from("retail_partners")
          //   .update({ retailer_ids: updatedRetailerCodes })
          //   .eq("distributor_id", distributorId);

          // if (error) {
          //   console.error("Error deleting retailer:", error);
          // } else {
          //   console.log("Update success");
          // }
          setRetailPartnerIds(updatedRetailerCodes);
        } else {
          console.error("Error deleting retailer:", data.error);
        }
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    },
    [distributorId, setRetailPartnerIds, retailerCodes],
  );

  const handleDelete = useCallback(
    async (id) => {
      await removeRetailer(id);
    },
    [removeRetailer],
  );

  console.log("CustomTable re-rendered!");

  return (
    <>
      <CustomSpinner isLoading={loading}>
        <Table
          aria-label="Example table with client side pagination"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
        >
          <TableHeader>
            <TableColumn key="company_name">Company Name</TableColumn>
            <TableColumn key="facility_code">Facility Code</TableColumn>
            <TableColumn key="delete_action">Action</TableColumn>
          </TableHeader>
          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.facility_code}>
                {(columnKey) =>
                  columnKey === "delete_action" ? (
                    <TableCell>
                      <Button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                        onPress={() => handleDelete(item.facility_code)}
                        isDisabled={loading}
                        isLoading={loading}
                      >
                        {loading ? "deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  ) : (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )
                }
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CustomSpinner>
    </>
  );
}

export const CustomTable = React.memo(CustomTableComponent);
