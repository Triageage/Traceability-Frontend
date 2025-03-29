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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CustomSpinner from "./custom-spinner";

export function CustomTable({ details, distributorId, setIds }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [data, setData] = useState(details); // Manage state for deletion
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(1); // Use state for pages

  console.log("details from the DB: ", details);

  useEffect(() => {
    setData(details);
    setLoading(false); // Ensure loading is set to false on initial data load or updates
  }, [details]);

  useEffect(() => {
    // Calculate pages whenever data changes
    setPages(Math.ceil(data.length / rowsPerPage));
    // Reset page to 1 when data changes, especially when deleting
    setPage(1);
  }, [data, rowsPerPage]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [page, data, rowsPerPage]); // Add rowsPerPage as a dependency

  console.log("items: ", items);

  const retailerCodes = useMemo(() => {
    return data.map((item) => item.facility_code);
  }, [data]);

  const removeRetailer = useCallback(
    async (id) => {
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
          const { error } = await supabase
            .from("retail_partners")
            .update({ retailer_ids: updatedRetailerCodes })
            .eq("distributor_id", distributorId);

          if (error) {
            console.error("Error deleting retailer:", error);
            // Handle error (e.g., show an error message)
          } else {
            console.log("Update success");
          }
          setIds(updatedRetailerCodes);
        } else {
          console.error("Error deleting retailer:", data.error);
        }
      } finally {
        setLoading(false);
      }
    },
    [distributorId, setIds, retailerCodes],
  ); // Include all dependencies

  const handleDelete = useCallback(
    async (id) => {
      setLoading(true);
      setData((prevData) =>
        prevData.filter((item) => item.facility_code !== id),
      );
      await removeRetailer(id);
    },
    [removeRetailer],
  );

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
