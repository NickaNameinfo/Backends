import React from "react";
import { TableList } from "../../Components/Table/TableList";
import {
  Button,
  Chip,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
  User,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteOrderMutation,
  useGetAllOrderListQuery,
  useGetAllOrderListByStoreQuery,
  useShiprocketCreateOrderFromOrderMutation,
  useUpdatOrderMutation,
} from "../../Service.mjs";
import { getCookie } from "../../JsFiles/CommonFunction.mjs";
import { Controller, useForm } from "react-hook-form";
import { parseDate, getLocalTimeZone } from "@internationalized/date";

const CustomersOrderList = () => {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  let tempFormData = watch();
  const nativegate = useNavigate();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const vendorId = getCookie("vendorId");
  const storeId = getCookie("storeId");
  const currentRole = getCookie("role");
  const ids = vendorId ? vendorId : storeId;
  const isAdmin = Number(currentRole) === 0;
  const {
    data: storeOrder,
    error: storeOrderError,
    refetch: storeOrderRefetch,
  } = useGetAllOrderListByStoreQuery(ids, { skip: isAdmin || !ids });
  const { data, error, refetch } = useGetAllOrderListQuery(undefined, {
    skip: !isAdmin,
    refetchOnMountOrArgChange: true,
  });
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdatOrderMutation();
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation();
  const [shiprocketCreateFromOrder, { isLoading: isShiprocketCreating }] =
    useShiprocketCreateOrderFromOrderMutation();

  const [selectedId, setSelectedId] = React.useState(null);
  const [refreshOrder, setRefreshOrder] = React.useState(false);

  const [orderStatus, serteOrderStatus] = React.useState([
    "processing",
    "shipping",
    "delivered",
    "cancelled",
  ]);
  const defaultCloumns = [
    "custId",
    "storeId",
    "paymentmethod",
    "deliverydate",
    "deliveryAddress",
    "grandtotal",
    "deliveryPartner",
    "shiprocketAwb",
    "status",
    "productIds",
    "qty",
    "actions",
    "size",
  ];


  const paymentOption = {
    1: "Online payment",
    2: "Pre Order",
    3: "Cash on Delivery",
    4: "Delivery in future"
  }

  const columns = [
    { name: "S.No", id: "id", sortable: true },
    ...(Number(currentRole) === 0 ? [{ name: "custId", id: "custId", sortable: true },
    { name: "storeId", id: "storeId" }] : []),
    { name: "paymentmethod", id: "paymentmethod", sortable: true },
    { name: "deliverydate", id: "deliverydate" },
    { name: "deliveryAddress", id: "deliveryAddress" },
    { name: "grandtotal", id: "grandtotal" },
    { name: "delivery", id: "deliveryPartner" },
    { name: "status", id: "status" },
    { name: "productIds", id: "productIds" },
    { name: "qty", id: "qty" },
    { name: "size", id: "size" },
    { name: "Actions", id: "actions" },
  ];

  const statusColorMap = {
    delivered: "success",
    cancelled: "danger",
    processing: "warning",
  };

  const handleDeleteOrder = React.useCallback(
    async (orderRow: any) => {
      if (orderRow?.id == null) return;
      if (!window.confirm(`Delete order #${orderRow.id}? This cannot be undone.`)) return;
      try {
        await deleteOrder(orderRow.id).unwrap();
        if (isAdmin) await refetch();
        else await storeOrderRefetch();
      } catch {
        alert("Could not delete order.");
      }
    },
    [deleteOrder, isAdmin, refetch, storeOrderRefetch]
  );

  const handleShiprocketCreate = React.useCallback(
    async (orderRow: any) => {
      if (orderRow?.id == null) return;
      try {
        const already = String(orderRow?.deliveryPartner || "").toLowerCase() === "shiprocket";
        const isMappedStore = already;
        const force = isAdmin && !isMappedStore;
        const isCanceled =
          String(orderRow?.shiprocketStatus || "").toUpperCase() === "CANCELED" ||
          Number(orderRow?.shiprocketStatusCode) === 5;
        const reorder = already && isCanceled;
        if (!already && !isAdmin) {
          alert("This store is not mapped to Shiprocket.");
          return;
        }
        if (force) {
          const ok = window.confirm(
            "This store is not mapped to Shiprocket.\nDo you want to force create Shiprocket shipment for this order?"
          );
          if (!ok) return;
        }
        const result = await shiprocketCreateFromOrder({ orderId: orderRow.id, force, reorder }).unwrap();
        const ship = result?.data;
        const meta = result?.meta;
        alert(
          `Shiprocket created for order #${meta?.orderId ?? orderRow.id}\n` +
            `Delivery date: ${meta?.deliveryDate ?? "—"}\n` +
            `Total: ${meta?.grandTotal ?? orderRow?.grandtotal ?? "—"}\n` +
            `Shiprocket order_id: ${ship?.order_id ?? ship?.orderId ?? "—"}\n` +
            `shipment_id: ${ship?.shipment_id ?? ship?.shipmentId ?? "—"}`
        );
        // Refresh list so status/button updates immediately
        if (isAdmin) await refetch();
        else await storeOrderRefetch();
      } catch (e: any) {
        const msg =
          e?.data?.message ||
          e?.error ||
          e?.message ||
          "Could not create Shiprocket order.";
        alert(msg);
      }
    },
    [isAdmin, refetch, shiprocketCreateFromOrder, storeOrderRefetch]
  );

  const renderCell = React.useCallback((user, columnKey) => {
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
      case "paymentmethod":
        return (
          <p>{paymentOption[user.paymentmethod]}</p>
        );
      case "deliveryAddress":
        // deliveryAddress may be a JSON string (we store selectedAddress object for website orders)
        const fullAddressString = user.deliveryAddress || "";
        let addressObj: any = null;
        try {
          addressObj = typeof fullAddressString === "string" ? JSON.parse(fullAddressString) : null;
        } catch {
          addressObj = null;
        }
        const extractShippingFromRaw = (raw: string) => {
          const m = raw.match(/"shipping"\s*:\s*"([^"]+)"/);
          return m?.[1] || "";
        };
        const shippingText =
          addressObj?.shipping ||
          addressObj?.address ||
          (typeof fullAddressString === "string" ? extractShippingFromRaw(fullAddressString) : "") ||
          "";
        const line2Parts = [
          addressObj?.area,
          addressObj?.district || addressObj?.discrict,
          addressObj?.city,
          addressObj?.states,
        ]
          .map((x: any) => String(x || "").trim())
          .filter(Boolean);
        const pin = String(addressObj?.pincode || "").trim();

        return (
          <div className="max-w-xs text-sm">
            {addressObj ? (
              <>
                <div className="font-semibold text-slate-800">
                  {String(addressObj?.fullname || "—")}
                  {addressObj?.phone ? (
                    <span className="ml-2 text-xs text-default-500">{String(addressObj.phone)}</span>
                  ) : null}
                </div>
                <div className="break-words text-default-700">
                  {shippingText || "—"}
                </div>
                {(line2Parts.length || pin) ? (
                  <div className="text-xs text-default-500">
                    {line2Parts.join(", ")}
                    {pin ? ` • ${pin}` : ""}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="break-words text-default-700">
                {shippingText || fullAddressString || "—"}
              </div>
            )}
          </div>
        );
      case "deliverydate": {
        const v = user?.deliverydate || user?.cutomerDeliveryDate;
        if (!v) return "—";
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-CA");
      }
      case "deliveryPartner": {
        const partner = String(user?.deliveryPartner || "").toLowerCase();
        if (partner === "shiprocket") {
          const srStatus = String(user?.shiprocketStatus || "").toUpperCase();
          const srCode = user?.shiprocketStatusCode != null ? Number(user.shiprocketStatusCode) : null;
          return (
            <div className="text-sm">
              <Chip size="sm" variant="flat" color="secondary" className="capitalize">
                Shiprocket
              </Chip>
              <div className="text-xs text-default-500 mt-1">
                {user?.shiprocketAwb ? `AWB: ${user.shiprocketAwb}` : "AWB pending"}
              </div>
              {(srStatus || srCode != null) && (
                <div className="text-xs mt-1">
                  <span className={srStatus === "CANCELED" ? "text-danger" : "text-default-500"}>
                    {srStatus || "—"}{srCode != null ? ` (${srCode})` : ""}
                  </span>
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="text-sm">
            <Chip size="sm" variant="flat" color="default">
              Store
            </Chip>
            <div className="text-xs text-default-500 mt-1">
              Delivery update will get from store
            </div>
          </div>
        );
      }
      case "productIds":
        return (
          <Chip
            key={user.productIds}
            size="sm"
            color="primary"
            variant="flat"
            className="cursor-pointer"
            onClick={() => nativegate(`/AddProducts/${user.productIds}`)}
          >
            {user.productIds}
          </Chip>
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
      case "actions":
        return (
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="flat"
              color="primary"
              size="sm"
              isDisabled={isDeletingOrder || isShiprocketCreating || isUpdatingOrder}
              isLoading={isUpdatingOrder && selectedId === user?.id}
              onPress={() => {
                setValue("status", user?.status);
                setValue(
                  "deliverydate",
                  user?.deliverydate ? parseDate(user?.deliverydate) : undefined
                );
                setSelectedId(user?.id);
                onOpen();
              }}
            >
              Update Order
            </Button>
            {String(user?.deliveryPartner || "").toLowerCase() === "shiprocket" ? (
              <Button
                variant="flat"
                color="secondary"
                size="sm"
                isDisabled={isDeletingOrder || isShiprocketCreating || isUpdatingOrder}
                isLoading={isShiprocketCreating}
                onPress={() => handleShiprocketCreate(user)}
              >
                {String(user?.shiprocketStatus || "").toUpperCase() === "CANCELED" ||
                Number(user?.shiprocketStatusCode) === 5
                  ? "Reorder Shiprocket"
                  : "Shiprocket"}
              </Button>
            ) : isAdmin ? (
              <Button
                variant="flat"
                color="secondary"
                size="sm"
                isDisabled={isDeletingOrder || isShiprocketCreating || isUpdatingOrder}
                isLoading={isShiprocketCreating}
                onPress={() => handleShiprocketCreate(user)}
              >
                Add to Shiprocket
              </Button>
            ) : null}
            <Button
              variant="flat"
              color="danger"
              size="sm"
              isDisabled={isDeletingOrder || isShiprocketCreating || isUpdatingOrder}
              isLoading={isDeletingOrder}
              onPress={() => handleDeleteOrder(user)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  }, [
    handleDeleteOrder,
    handleShiprocketCreate,
    isDeletingOrder,
    isShiprocketCreating,
    nativegate,
    onOpen,
    setValue,
    statusColorMap,
  ]);

  const onSubmit = async (data: any) => {
    setRefreshOrder(true);
    const { year, month, day } = data.deliverydate;
    // Create a Date object (Note: JavaScript months are 0-indexed)
    const date = new Date(year, month - 1, day);
    // Format the date (Optional, for readability)
    const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    let tempApiParams = {
      ...data,
      deliverydate: formattedDate,
      id: selectedId,
    };
    try {
      const result = await updateOrder(tempApiParams).unwrap();
      if (result?.success) {
        if (isAdmin) await refetch();
        else await storeOrderRefetch();
      }
    } finally {
      setRefreshOrder(false);
    }
  };

  return (
    <div className="mx-2">
      {!refreshOrder ? (
        <TableList
          defaultCloumns={defaultCloumns}
          renderCell={renderCell}
          columns={columns}
          tableItems={
            Number(currentRole) === 0
              ? data?.["data"]
              : storeOrder?.["data"]
          }
          isStatusFilter={true}
          refreshOrder={refreshOrder}
        />
      ) : (
        "Loading..."
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="md"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                Update Order {selectedId}
              </ModalHeader>
              <ModalBody>
                <Controller
                  name="deliverydate" // Changed to reflect a text input
                  control={control}
                  rules={{ required: "Please enter value" }}
                  render={({ field }) => (
                    <DatePicker
                      isRequired={true}
                      label="Delivery Date"
                      variant="bordered"
                      {...field}
                      className="mb-2"
                    />
                  )}
                />
                <Controller
                  name="status" // Changed to reflect a text input
                  control={control}
                  rules={{ required: "Please select value" }}
                  render={({ field }) => (
                    <Select
                      classNames={{
                        label: "group-data-[filled=true]:-translate-y-3",
                        trigger: [
                          "bg-transparent",
                          "border-1",
                          "text-default-500",
                          "transition-opacity",
                          "data-[hover=true]:bg-transparent",
                          "data-[hover=true]:bg-transparent",
                          "dark:data-[hover=true]:bg-transparent",
                          "data-[selectable=true]:focus:bg-transparent",
                        ],
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: [
                            "rounded-md",
                            "text-default-500",
                            "transition-opacity",
                            "data-[hover=true]:text-foreground",
                            "data-[hover=true]:bg-default-100",
                            "dark:data-[hover=true]:bg-default-50",
                            "data-[selectable=true]:focus:bg-default-50",
                            "data-[pressed=true]:opacity-90",
                            "data-[focus-visible=true]:ring-default-500",
                            "shadow-none",
                            // "border-1",
                          ],
                        },
                      }}
                      label="Status"
                      variant="bordered"
                      size="sm"
                      selectedKeys={[String(tempFormData?.status)]}
                      {...field}
                      isRequired={true}
                      isInvalid={errors?.["status"] ? true : false}
                      errorMessage={errors?.["status"]?.message}
                    >
                      {orderStatus?.map((item) => {
                        return (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        );
                      })}
                    </Select>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="ghost"
                  color="default"
                  size="sm"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  type="submit"
                  onPress={onClose}
                  onClick={() => { }}
                >
                  Update
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CustomersOrderList;
