import React from "react";
import { TableList } from "../../Components/Table/TableList";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import {
  useDestroyStorePermanentMutation,
  useGetTrashedStoresQuery,
  useRestoreStoreMutation,
} from "./Service.mjs";

const StoreTrashList = () => {
  const { data, refetch } = useGetTrashedStoresQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [restoreStore] = useRestoreStoreMutation();
  const [destroyPermanent] = useDestroyStorePermanentMutation();

  const defaultCloumns = ["storename", "storeaddress", "ownername", "phone", "email", "actions"];

  const columns = [
    { name: "S.No", id: "id", sortable: true },
    { name: "storename", id: "storename", sortable: true },
    { name: "storeaddress", id: "storeaddress", sortable: true },
    { name: "email", id: "email", sortable: true },
    { name: "phone", id: "phone" },
    { name: "Actions", id: "actions" },
  ];

  const onRestore = React.useCallback(
    async (id: any) => {
      if (!id) return;
      try {
        const res = await restoreStore(id).unwrap();
        if (res?.success) refetch();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[StoreTrashList] Restore failed", e);
      }
    },
    [restoreStore, refetch]
  );

  const onDestroyPermanent = React.useCallback(
    async (id: any) => {
      if (!id) return;
      try {
        const res = await destroyPermanent(id).unwrap();
        if (res?.success) refetch();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[StoreTrashList] Permanent delete failed", e);
      }
    },
    [destroyPermanent, refetch]
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
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat">
                    Action
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Trash actions">
                  <DropdownItem
                    onPress={() => {
                      onRestore(user?.id);
                    }}
                  >
                    Restore
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onPress={() => {
                      onDestroyPermanent(user?.id);
                    }}
                  >
                    Delete permanently
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onRestore, onDestroyPermanent]
  );

  return (
    <div className="mx-2">
      {data && (
        <TableList
          defaultCloumns={defaultCloumns}
          renderCell={renderCell}
          columns={columns}
          tableItems={(data?.["data"] || []).filter((s: any) => Boolean(s?.isTrashed))}
          isStatusFilter={false}
          showColumnsFilter={false}
        />
      )}
    </div>
  );
};

export default StoreTrashList;

