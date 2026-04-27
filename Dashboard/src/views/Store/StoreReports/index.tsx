import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Button,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useGetStoreVisitReportsQuery } from "../Service.mjs";

const PERIOD_OPTIONS = [
  { key: "all", label: "All time" },
  { key: "day", label: "Last 24 hours" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" },
];

const StoreReports = () => {
  const [period, setPeriod] = React.useState("all");
  const [storeNameSearch, setStoreNameSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const queryParams = React.useMemo(() => {
    const params: { period?: string; storeName?: string } = {};
    if (period && period !== "all") params.period = period;
    if (storeNameSearch.trim()) params.storeName = storeNameSearch.trim();
    return params;
  }, [period, storeNameSearch]);

  const { data, isLoading, error, refetch } = useGetStoreVisitReportsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const siteVisitCount = data?.data?.siteVisitCount ?? 0;
  const storeVisits = data?.data?.storeVisits ?? [];

  const handleSearch = () => setStoreNameSearch(searchInput);
  const handleClearSearch = () => {
    setSearchInput("");
    setStoreNameSearch("");
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardBody>
            <p className="text-danger">Failed to load store visit reports. Please try again.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Store Reports</h1>
          <p className="text-sm text-gray-600">
            Visitor counts with optional time range and store name filter
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            <Select
              label="Time period"
              placeholder="Select period"
              selectedKeys={period ? [period] : []}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as string;
                setPeriod(v ?? "all");
              }}
              className="max-w-[200px]"
              size="sm"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="Store name"
              placeholder="Search by store name..."
              value={searchInput}
              onValueChange={setSearchInput}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-[240px]"
              size="sm"
              isClearable
              onClear={handleClearSearch}
            />
            <Button size="sm" color="primary" onPress={handleSearch}>
              Search
            </Button>
            {(storeNameSearch || period !== "all") && (
              <Button size="sm" variant="flat" onPress={() => { setPeriod("all"); handleClearSearch(); }}>
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total site visits:</span>
            <Chip color="primary" variant="flat" size="lg">
              {siteVisitCount.toLocaleString()}
            </Chip>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Visits per store</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : storeVisits.length === 0 ? (
              <p className="text-gray-500 text-sm">No store visits found for the selected filters.</p>
            ) : (
              <Table aria-label="Store visit counts">
                <TableHeader>
                  <TableColumn>Store name</TableColumn>
                  <TableColumn className="text-right">Visit count</TableColumn>
                </TableHeader>
                <TableBody>
                  {storeVisits.map((row) => (
                    <TableRow key={row.storeId}>
                      <TableCell>{row.storeName}</TableCell>
                      <TableCell className="text-right">
                        <Chip variant="flat" size="sm">
                          {row.visitCount.toLocaleString()}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StoreReports;
