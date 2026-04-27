import {
  Modal,
  ModalBody,
  ModalContent,
  Divider,
  User,
  Button,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { ModalCloseIcon } from "../Icons";
import { infoData } from "../../configData";
import {
  useGetOrderByOrderIdQuery,
  useLazyShiprocketTrackAwbQuery,
} from "../../views/pages/Store/Service.mjs";
import { getCookie } from "../../JsFiles/CommonFunction.mjs";
import { useAppDispatch, useAppSelector } from "../Common/hooks";
import {
  onUpdateOrderModal,
  onUpdateProductDetailsModal,
} from "../Common/globalSlice";

const columns = [
  { name: "Product", uid: "productImage" },
  { name: "Product Name", uid: "productName" },
  { name: "Quantity", uid: "qty" },
  { name: "Price", uid: "grandtotal" },
  { name: "Delivery", uid: "deliveryPartner" },
  { name: "status", uid: "status" },
  { name: "Delivery Date", uid: "deliverydate" },
  { name: "Action", uid: "actions" },
];

export const OrderCard = (props: any) => {
  const userId = getCookie("id") || localStorage.getItem("id");
  const dispatch = useAppDispatch();
  const [trackAwb, { isFetching: isTracking }] = useLazyShiprocketTrackAwbQuery();
  const {
    data: orderList,
    error: orderListError,
    refetch: orderListRefetch,
  } = useGetOrderByOrderIdQuery(Number(userId), { skip: !userId});

  const isOPenOrderModal = useAppSelector(
    (state) => state.globalConfig.isOpenOrderModal
  );

  React.useEffect(() => {
    orderListRefetch();
  }, []);

  const renderCell = React.useCallback((data, columnKey) => {
    switch (columnKey) {
      case "productImage":
        return (
          <User
            className="p-0 m-0"
            avatarProps={{
              radius: "lg",
              src: `${data?.products?.[0]?.photo}`,
            }}
            name={null}
          ></User>
        );
      case "productName":
        return <p>{data?.products?.[0]?.name}</p>;
      case "actions":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              color="warning"
              onClick={() => {
                dispatch(
                  onUpdateProductDetailsModal({
                    isOpen: true,
                    item: data?.products?.[0],
                  })
                );
              }}
            >
              view
            </Button>
            {String(data?.deliveryPartner || "").toLowerCase() === "shiprocket" && data?.shiprocketAwb && (
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                isDisabled={isTracking}
                onClick={async () => {
                  try {
                    const out = await trackAwb(String(data.shiprocketAwb)).unwrap();
                    const sr = out?.data ?? out;
                    const track =
                      sr?.tracking_data?.track_status ||
                      sr?.tracking_data?.shipment_track?.[0]?.current_status ||
                      "";
                    const eta =
                      sr?.tracking_data?.shipment_track?.[0]?.edd ||
                      sr?.tracking_data?.shipment_track?.[0]?.etd ||
                      sr?.tracking_data?.shipment_track?.[0]?.expected_delivery_date ||
                      sr?.tracking_data?.shipment_track?.[0]?.expected_delivery ||
                      "";
                    const url =
                      sr?.tracking_data?.track_url ||
                      sr?.tracking_data?.shipment_track?.[0]?.tracking_url ||
                      data?.shiprocketTrackingUrl ||
                      "";
                    alert(
                      `AWB: ${data.shiprocketAwb}\n${track ? `Status: ${track}\n` : ""}${eta ? `ETA: ${eta}\n` : ""}${url ? `Track: ${url}` : ""}`.trim()
                    );
                  } catch {
                    alert("Tracking not available right now");
                  }
                }}
              >
                Track
              </Button>
            )}
          </div>
        );
      case "deliveryPartner": {
        const partner = String(data?.deliveryPartner || "").toLowerCase();
        if (partner === "shiprocket") {
          return (
            <div>
              <p className="m-0 p-0 font-semibold text-slate-800">Shiprocket</p>
              <p className="m-0 p-0 text-xs text-slate-500">
                {data?.shiprocketAwb ? `AWB: ${data.shiprocketAwb}` : "AWB pending"}
              </p>
            </div>
          );
        }
        return (
          <div>
            <p className="m-0 p-0 font-semibold text-slate-800">Store</p>
            <p className="m-0 p-0 text-xs text-slate-500">
              Delivery update will get from store
            </p>
          </div>
        );
      }
      case "deliverydate": {
        const v = data?.deliverydate || data?.cutomerDeliveryDate || "";
        const d = v ? new Date(v) : null;
        const isValid = d && !Number.isNaN(d.getTime());
        if (isValid) return <p className="m-0 p-0">{d.toLocaleDateString()}</p>;
        if (String(data?.deliveryPartner || "").toLowerCase() === "shiprocket") {
          return (
            <p className="m-0 p-0 text-xs text-slate-500">
              {data?.shiprocketAwb ? "Use Track for ETA" : "AWB pending"}
            </p>
          );
        }
        return <p className="m-0 p-0">—</p>;
      }
      default:
        return <p className="m-0 p-0">{data?.[columnKey]}</p>;
    }
  }, []);
  return (
    <>
      <Modal
        isOpen={isOPenOrderModal}
        onClose={() => {
          if (isOPenOrderModal) {
            dispatch(onUpdateOrderModal(false));
          }
        }}
        size={"5xl"}
        shadow="md"
        placement="center"
        backdrop="blur"
        scrollBehavior="inside"
        hideCloseButton
      >
        <ModalContent className="pb-3">
          <>
            <ModalCloseIcon
              onClick={() => {
                dispatch(onUpdateOrderModal(false));
              }}
              className="modalIconClose"
            />
            <ModalBody className="p-0 m-0 mt-1 pt-2">
              <div className="grid">
                <div className="">
                  <Table
                    isHeaderSticky
                    classNames={{
                      base: "xm:max-h-[250px] mm:max-h-[250px] ml:max-h-[250px] md:max-h-[340px] lg:max-h-[340px] xl:max-h-[340px] 2xl:max-h-[340px] 3xl:max-h-[340px] overflow-hidden",
                      table: "w-full",
                    }}
                  >
                    <TableHeader
                      columns={columns}
                      className="sticky top-0 bg-white z-10"
                    >
                      {(column) => (
                        <TableColumn
                          className="m-0"
                          key={column.uid}
                          align={column.uid === "actions" ? "center" : "start"}
                        >
                          {column.name}
                        </TableColumn>
                      )}
                    </TableHeader>

                    <TableBody
                      items={orderList?.data}
                      className="max-h-[340px] overflow-y-auto p-0 m-0"
                    >
                      {(item: any) => (
                        <TableRow key={item?.["id"]} className="p-0 m-0">
                          {(columnKey) => (
                            <TableCell className="p-1 m-0">
                              {renderCell(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {orderList?.data?.length <= 0 && (
                    <p className="text-center my-3">
                      No item in your order list
                    </p>
                  )}
                  {/* <div className="items-center flex justify-center ">
                    <Button
                      size="sm"
                      color="primary"
                      variant="bordered"
                      className={`ms-3 ${
                        orderList?.data?.length <= 0 ? "cursor-not-allowed" : ""
                      }`}
                      onClick={() => navigate(-1)}
                      disabled={orderList?.data?.length <= 0}
                    >
                      Buy More Items
                    </Button>
                  </div> */}
                </div>
                {/* <div>
                  <div className="flex justify-between py-1 mx-3 font-medium text-sm m-1">
                    <div>Store and Product Details</div>
                  </div>
                  <div className=" BuycarBg mx-3">
                    <div className="flex justify-between py-1 mx-3 font-medium text-sm m-1">
                      <div>Store Name</div>
                      <div>Nicknameinfotech</div>
                    </div>
                    <div className="flex justify-between py-1 mx-3 font-medium text-sm m-1">
                      <div>Delivery Charge</div>
                      <div> Free</div>
                    </div>
                    <Divider orientation="horizontal" className="my-3.5" />
                    <div className="flex justify-between py-1 mx-3 text-base font-medium  m-1">
                      <div>Total Amount</div>
                      <div>
                        {" "}
                        Rs.{" "}
                        {orderList?.data
                          ?.reduce((sum, item) => sum + item.total, 0)
                          .toString()
                          .replace(/(\d+)(\d{3})$/, "$1,$2")}
                      </div>
                    </div>
                    <Divider orientation="horizontal" className="my-2" />
                    <div className="paymetoptionBg mx-3 mt-2 rounded-lg">
                      <div className="font-medium paymetoption text-base mx-3 pb-2 pt-2">
                        Delivery Details
                      </div>
                      <RadioGroup className="w-full">
                        <div className="flex  justify-between items-center mx-3 w-full">
                          <div className="w-2/4 m-1 items-center">
                            <Radio
                              value="Google-Pay"
                              size="sm"
                              className="items-center"
                            >
                              Google Pay
                            </Radio>
                          </div>
                          <div className="w-2/4 m-1 items-center">
                            <Radio
                              value="Phone-Pay"
                              size="sm"
                              className="items-center"
                            >
                              Phone Pay
                            </Radio>
                          </div>
                        </div>
                        <div className="flex  justify-between items-center mx-3 w-full">
                          <div className="w-2/4 m-1 items-center">
                            <Radio
                              value=" Debit-Card"
                              size="sm"
                              className="items-center"
                            >
                              Debit Card
                            </Radio>
                          </div>
                          <div className="w-2/4 m-1 items-center">
                            <Radio
                              value="Credit-Card"
                              size="sm"
                              className="items-center"
                            >
                              Credit Card
                            </Radio>
                          </div>
                        </div>
                        <div className="justify-between mx-3 flex w-full items-center">
                          <div className="w-2/4 m-1 items-center">
                            <Radio
                              value="Cash-on-Delivery"
                              size="sm"
                              className="items-center"
                            >
                              Cash on Delivery
                            </Radio>
                          </div>
                        </div>
                      </RadioGroup>
                      <div className="flex items-center justify-center mt-4 mb-1">
                        <Button
                          size="sm"
                          color="primary"
                          variant="bordered"
                          onClick={() => navigate(-1)}
                        >
                          Back To Shop
                        </Button>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};
