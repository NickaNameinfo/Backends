import React from "react";
import { TableList } from "../../Components/Table/TableList";
import {
  useGetStoreQuery,
  useDeleteStoreMutation,
  useUpdateStoreMutation,
} from "./Service.mjs";
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

const StoreList = () => {
  const navigate = useNavigate();

  const [DeleteData] = useDeleteStoreMutation();
  const [UpdateStore, { isLoading: isUpdatingStore }] = useUpdateStoreMutation();
  const { data, error, refetch } = useGetStoreQuery(undefined, { refetchOnMountOrArgChange: true });

  const defaultCloumns = [
    "storename",
    "deliveryPartner",
    "shiprocketPickupLocation",
    "storeaddress",
    "ownername",
    "phone",
    "email",
    "actions",
    "status",
  ];

  const columns = [
    { name: "S.No", id: "id", sortable: true },
    { name: "storename", id: "storename", sortable: true },
    { name: "Delivery partner", id: "deliveryPartner", sortable: true },
    { name: "Shiprocket pickup", id: "shiprocketPickupLocation", sortable: true },
    { name: "storeaddress", id: "storeaddress", sortable: true },
    { name: "email", id: "email", sortable: true },
    { name: "phone", id: "phone" },
    { name: "Actions", id: "actions" },
    { name: "Status", id: "status" },
  ];

  const statusColorMap = {
    active: "success",
    paused: "danger",
    vacation: "warning",
  };

  const onDelete = React.useCallback(
    async (deleteID: any) => {
      if (!deleteID) return;
      try {
        const result = await DeleteData(deleteID).unwrap();
        if (result?.success) {
          refetch();
        }
      } catch (e) {
        // Keep silent for now; caller UI doesn't display errors.
        // eslint-disable-next-line no-console
        console.error("[StoreList] Delete failed", e);
      }
    },
    [DeleteData, refetch]
  );

  const renderCell = React.useCallback(
    (user, columnKey) => {
      const cellValue = user[columnKey];
      switch (columnKey) {
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
        case "deliveryPartner": {
          const partner = String(user?.deliveryPartner || "").toLowerCase();
          const isShiprocket = partner === "shiprocket";
          return (
            <div className="flex items-center justify-between gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={isShiprocket ? "secondary" : "default"}
                className="capitalize"
              >
                {isShiprocket ? "Shiprocket" : "None"}
              </Chip>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat" isDisabled={isUpdatingStore}>
                    Map
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Delivery partner mapping">
                  <DropdownItem
                    onPress={async () => {
                      try {
                        await UpdateStore({ id: user?.id, deliveryPartner: "shiprocket" }).unwrap();
                        refetch();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error("[StoreList] deliveryPartner update failed", e);
                      }
                    }}
                  >
                    Shiprocket
                  </DropdownItem>
                  <DropdownItem
                    onPress={async () => {
                      try {
                        await UpdateStore({ id: user?.id, deliveryPartner: null }).unwrap();
                        refetch();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error("[StoreList] deliveryPartner update failed", e);
                      }
                    }}
                  >
                    None (local)
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }
        case "shiprocketPickupLocation": {
          const partner = String(user?.deliveryPartner || "").toLowerCase();
          const pickup = String(user?.shiprocketPickupLocation || "");
          if (partner !== "shiprocket") {
            return <span className="text-default-400 text-xs">—</span>;
          }
          return (
            <div className="flex items-center justify-between gap-2">
              <Chip size="sm" variant="flat" color={pickup ? "secondary" : "warning"}>
                {pickup ? pickup : "Set pickup"}
              </Chip>
              <Button
                size="sm"
                variant="flat"
                isDisabled={isUpdatingStore}
                onPress={async () => {
                  const v = window.prompt(
                    "Enter Shiprocket pickup location name (as configured in Shiprocket). Example: Primary",
                    pickup || "Primary"
                  );
                  if (v == null) return;
                  try {
                    await UpdateStore({ id: user?.id, shiprocketPickupLocation: String(v).trim() || null }).unwrap();
                    refetch();
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("[StoreList] pickup location update failed", e);
                  }
                }}
              >
                Edit
              </Button>
            </div>
          );
        }
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
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat">
                    Action
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Store actions">
                  {/* <DropdownItem>View</DropdownItem> */}
                  <DropdownItem
                    onPress={() => {
                      navigate(`/Stores/Edit/${user?.id}`);
                    }}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onPress={() => {
                      onDelete(user?.id);
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [UpdateStore, isUpdatingStore, navigate, onDelete, refetch]
  );

  return (
    <div className="mx-2">
      {data && (
        <TableList
          defaultCloumns={defaultCloumns}
          renderCell={renderCell}
          columns={columns}
          // Main list shows both active and inactive. Trash is controlled by `isTrashed`.
          tableItems={(data?.["data"] || []).filter((s: any) => !Boolean(s?.isTrashed))}
          isStatusFilter={true}
          showColumnsFilter={false}
          // addButtonLabel="Add Store"
          // onAddClick={() => navigate("/Stores/Add")}
        />
      )}
    </div>
  );
};

export default StoreList;
