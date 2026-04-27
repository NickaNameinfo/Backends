import React from "react";
import { TableList } from "../../Components/Table/TableList";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import {useGetAllUserQuery} from "../../Service.mjs"

const CustomersList = () => {
  const navigate = useNavigate();
  const { data, error, refetch } = useGetAllUserQuery();

  const defaultCloumns = [
    "id",
    "type",
    "firstName",
    "email",
    "phone",
  ];

  const columns = [
    { name: "Customer ID", id: "id", sortable: true },
    { name: "Type", id: "type", sortable: true },
    { name: "firstName", id: "firstName", sortable: true },
    { name: "email", id: "email", sortable: true },
    { name: "phone", id: "phone" },
  ];

  const statusColorMap = {
    active: "success",
    paused: "danger",
    vacation: "warning",
  };

  const renderCell = React.useCallback((user, columnKey) => {

    const cellValue = user[columnKey];
    switch (columnKey) {
      case "type": {
        const role = String(user?.role ?? "").toLowerCase();
        if (role === "0" || role === "admin") return "Admin";
        // Heuristic based on ids present (backend exposes vendorId/storeId)
        if (user?.vendorId) return "Vendor user";
        if (user?.storeId) return "Store user";
        return "Customer";
      }
      case "storename":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.status]}
          size="lg"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
        default:
        return cellValue;
    }
  }, []);

  return (
    <div className="mx-2">
      {data && (
        <TableList
          defaultCloumns={defaultCloumns}
          renderCell={renderCell}
          columns={columns}
          tableItems={data?.["data"]}
          isStatusFilter={false}
        />
      )}
    </div>
  );
};

export default CustomersList;
