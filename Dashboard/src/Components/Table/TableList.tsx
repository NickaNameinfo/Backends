import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
} from "@nextui-org/react";
import {
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  VerticalDotsIcon,
} from "../Icons";
import { capitalize } from "./data2";
import { NavHeaderSearchIcon } from "../Common/Icons/icon";

interface TableProps {
  tableItems: any;
  columns: any;
  defaultCloumns: any;
  renderCell: any;
  isStatusFilter: boolean;
  refreshOrder?: boolean;
  selectionMode?: "single" | "multiple" | "none";
  selectedKeys?: any;
  onSelectionChange?: (keys: any) => void;
  showColumnsFilter?: boolean;
  excludeStatuses?: string[];
  addButtonLabel?: string;
  onAddClick?: () => void;
}

export const TableList = (props: TableProps) => {
  const [filterValue, setFilterValue] = React.useState("");
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<any>(new Set([]));
  
  const selectedKeys = props.selectedKeys || internalSelectedKeys;
  const setSelectedKeys = props.onSelectionChange || setInternalSelectedKeys;

  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(props.defaultCloumns)
  );
  const [statusFilter, setStatusFilter] = React.useState<any>(new Set(["all"]));
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const statusOptions = React.useMemo(() => {
    // Get unique status values from table items
    const uniqueStatuses = new Set<string>();
    if (props?.tableItems && Array.isArray(props.tableItems)) {
      props.tableItems.forEach((item: any) => {
        const status = item?.status || item?.product?.status;
        if (status !== undefined && status !== null) {
          // Handle numeric status
          if (status === "1" || status === 1) {
            uniqueStatuses.add("active");
          } else if (status === "0" || status === 0) {
            uniqueStatuses.add("inactive");
          } else {
            // Handle string status (processing, shipping, delivered, cancelled, etc.)
            uniqueStatuses.add(String(status).toLowerCase());
          }
        }
      });
    }
    
    // Build options array
    const options = [{ name: "All", id: "all" }];
    
    // Get excluded statuses (default to empty array)
    const excludeStatuses = props?.excludeStatuses || [];
    
    // Add common statuses if they exist in data and are not excluded
    // Always include "active" and "inactive" if not excluded (for filtering purposes)
    const commonStatuses = [
      { name: "Active", id: "active" },
      { name: "Inactive", id: "inactive" },
      { name: "Processing", id: "processing" },
      { name: "Shipping", id: "shipping" },
      { name: "Delivered", id: "delivered" },
      { name: "Cancelled", id: "cancelled" },
    ];
    
    commonStatuses.forEach(status => {
      // Always include "active" and "inactive" if not excluded, even if not in data
      // Other statuses only if they exist in data
      const shouldInclude = (status.id === "active" || status.id === "inactive") 
        ? !excludeStatuses.includes(status.id)
        : uniqueStatuses.has(status.id) && !excludeStatuses.includes(status.id);
      
      if (shouldInclude) {
        options.push(status);
      }
    });
    
    // Add any other unique statuses found (excluding specified ones)
    uniqueStatuses.forEach(status => {
      if (!["all", "active", "inactive", "processing", "shipping", "delivered", "cancelled"].includes(status) && 
          !excludeStatuses.includes(status)) {
        options.push({ 
          name: status.charAt(0).toUpperCase() + status.slice(1), 
          id: status 
        });
      }
    });
    
    return options;
  }, [props?.tableItems, props?.excludeStatuses]);

  const headerColumns = React.useMemo(() => {
    // if (visibleColumns === "all") return columns;
    return props.columns?.filter((column: { id: unknown }) =>
      Array.from(visibleColumns).includes(column.id)
    );
  }, [visibleColumns]);
  const filteredItems = React.useMemo(() => {
    let filteredUsers = props?.tableItems ? [...props?.tableItems] : [];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user: any) => {
        // Search across multiple fields
        const searchLower = filterValue.toLowerCase();
        const searchableFields = [
          user?.["name"],
          user?.["customerName"],
          user?.["id"]?.toString(),
          user?.["product"]?.["name"],
          user?.["productName"],
          user?.["products"]?.[0]?.name,
          user?.["sortDesc"],
          user?.["status"],
          user?.["createdType"],
          user?.["qty"]?.toString(),
          user?.["grandtotal"]?.toString(),
          user?.["deliverydate"],
          user?.["custId"]?.toString(),
          user?.["storeId"]?.toString(),
          user?.["productIds"]?.toString(),
          user?.["paymentmethod"]?.toString(),
          user?.["deliveryAddress"],
          user?.["size"],
          user?.["storename"],
          user?.["storeaddress"],
          user?.["ownername"],
          user?.["phone"],
          user?.["email"],
          user?.["subscription"]?.subscriptionPlan,
          user?.["subscription"]?.subscriptionType,
          user?.["subscription"]?.status,
          user?.["subscriptionPlan"],
          user?.["subscriptionType"],
          user?.["subscriptionStatus"],
          user?.["subId"],
          user?.["paymentId"],
          user?.["freeCount"],
          user?.["createdAt"],
        ].filter(Boolean).map((field) => String(field).toLowerCase());
        
        return searchableFields.some((field) => field.includes(searchLower));
      });
    }
    const statusFilterArray = Array.from(statusFilter);
    if (
      !statusFilterArray.includes("all") &&
      statusFilterArray.length > 0
    ) {
      filteredUsers = filteredUsers.filter((user: any) => {
        // Get status from user or product, handling undefined/null
        let userStatus = user?.status;
        if (userStatus === undefined || userStatus === null) {
          userStatus = user?.product?.status;
        }
        
        // Handle null/undefined/empty status
        if (userStatus === null || userStatus === undefined || userStatus === "") {
          return false;
        }
        
        // Convert to string for consistent comparison, but preserve numeric checks
        const statusStr = String(userStatus).trim();
        const statusNum = !isNaN(Number(statusStr)) ? Number(statusStr) : null;
        
        // Handle numeric status (1 = active, 0 = inactive)
        if (statusNum !== null) {
          if (statusNum === 1) {
            return statusFilterArray.includes("active");
          }
          if (statusNum === 0) {
            return statusFilterArray.includes("inactive");
          }
        }
        
        // Handle string status (processing, shipping, delivered, cancelled, etc.)
        const statusValue = statusStr.toLowerCase();
        // Check if the status matches any selected filter
        return statusFilterArray.some((filterStatus) => {
          const filterLower = String(filterStatus).toLowerCase();
          return statusValue === filterLower || statusValue.includes(filterLower);
        });
      });
    }

    return filteredUsers;
  }, [props?.tableItems, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value: any) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2 ml-4">
          <Button
            isDisabled={pages === 1}
            size="md"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="md"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-0">
        <div className="flex justify-between gap-3 items-center mt-2">
          {props.isStatusFilter && (
            <div className="flex gap-3">
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    size="md"
                    endContent={<ChevronDownIcon className="text-small" />}
                    variant="flat"
                  >
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.id} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              {props.showColumnsFilter !== false && (
                <Dropdown>
                  <DropdownTrigger className="hidden sm:flex">
                    <Button
                      endContent={<ChevronDownIcon className="text-small" />}
                      variant="flat"
                      size="md"
                    >
                      Columns
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Table Columns"
                    closeOnSelect={false}
                    selectedKeys={visibleColumns}
                    selectionMode="multiple"
                    onSelectionChange={setVisibleColumns}
                  >
                    {props.columns.map((column: any) => (
                      <DropdownItem key={column.id || column.uid} className="capitalize">
                        {capitalize(column.name)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          )}
          {props.onAddClick && (
            <Button
              color="primary"
              size="md"
              endContent={<PlusIcon />}
              onPress={props.onAddClick}
            >
              {props.addButtonLabel || "Add"}
            </Button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center">
            <span className="flex me-5">
              <p className="font-semibold text-default-700 "> Total</p>
              <p className=" text-default-700 font-semibold ms-1">
                {filteredItems.length}
              </p>
            </span>
            <div className="">
              <Input
                autoFocus={false}
                isClearable
                // className="w-[280px]"
                className="w-[280px]"
                radius="lg"
                size="md"
                type="Search"
                // autoFocus
                // color="default"
                variant="flat"
                placeholder="Search..."
                classNames={{
                  label: " bg-[#ffffff3b] text-black/90 dark:text-black/90",
                  input: [
                    "bg-[#ffffff3b]",
                    "text-black/90 dark:text-black/100",
                    "placeholder:text-black-100/30 dark:placeholder:text-black/10",
                    "font-normal",
                    "group-data-[has-value=true]:text-black/90",
                  ],
                  // innerWrapper: " text-black/90 dark:text-black/70",
                  inputWrapper: [
                    "bg-[#ffffff3b]",
                    "dark:bg-[#ffffff3b]",
                    "backdrop-blur-xl",
                    "backdrop-saturate-50",
                    "hover:bg-[#ffffff3b]",
                    "hover:border-gray-600/10",
                    "focus-within:!bg-[#ffffff3b]",
                    "dark:hover:bg-[#ffffff3b]",
                    "dark:focus-within:!bg-[#ffffff3b]",
                    "!cursor-text",
                    "shadow-none",
                    "border-1",
                    "data-[hover=true]:bg-[#ffffff3b]",
                    "data-[hover=true]:bg-[#ffffff3b]",
                    "dark:data-[hover=true]:bg-[#ffffff3b]",
                  ],
                }}
                startContent={
                  <p className="me-1.5">
                    <NavHeaderSearchIcon />
                  </p>
                }
                value={filterValue}
                onClear={() => onClear()}
                onValueChange={onSearchChange}
              />
            </div>
          </div>
          <label className="flex items-center text-default-400 text-small">
            {bottomContent}
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    filteredItems.length,
    onSearchChange,
    hasSearchFilter,
    props.onAddClick,
    props.addButtonLabel,
  ]);

  return !props.refreshOrder ? (
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      // isStriped
      // bottomContent={bottomContent}
      // bottomContentPlacement="inside"
      classNames={{
        wrapper: "min-h-[382px] min-w-full min-w-unit-6",
      }}
      selectedKeys={selectedKeys}
      selectionMode={props.selectionMode}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns} className="m-0 p-0">
        {(column: any) => (
          <TableColumn
            key={column?.["id"]}
            align={column?.["id"] === "actions" ? "center" : "start"}
            allowsSorting={column?.["sortable"]}
          >
            {column?.["name"]}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={"No users found"}
        items={sortedItems}
        className="m-0 p-0"
      >
        {(item: any) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{props.renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  ) : (
    <p>Loading...</p>
  );
};
