import * as React from "react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  User,
  cn,
  Listbox,
  ListboxItem,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import {
  Arrowleft,
  Arrowright,
  FormeIcon,
  IconHome,
  IconInfo,
  IconMap,
  IconMapRound,
} from "./Icons";
import { _nav } from "../_nav";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./Common/hooks";
import Login from "../views/pages/login/Login";
import { eraseCookie, getCookie } from "../JsFiles/CommonFunction.mjs";
import {
  onGlobalCategorySearch,
  onGlobalPaymentSearch,
  onSearchGlobal,
  onUpdateCartModal,
  onUpdateOrderModal,
  onUpdateOpenStore,
  updateLoginDetails,
  onUpdateSidebarExpand,
} from "../Components/Common/globalSlice";
import { useGetCategoryQuery } from "../views/pages/Category/Service.mjs";
import {
  useGetCartByOrderIdQuery,
  useGetOrderByOrderIdQuery,
} from "../views/pages/Store/Service.mjs";
import { OrderCard } from "./Card/OrderCard";
import { BuyCard } from "./Card/BuyCard";
import { IconForgotSVG } from "../Icons";

export const AppSidebar = () => {
  const [selectedCategory, setSelectedCategory] = React.useState([]);
  const currentloginDetails = useAppSelector(
    (state) => state.globalConfig.currentloginDetails
  );
  const isOpenCartModal = useAppSelector(
    (state) => state.globalConfig.isOpenCartModal
  );
  const isOPenOrderModal = useAppSelector(
    (state) => state.globalConfig.isOpenOrderModal
  );
  const isProductDetailsModalOpen = useAppSelector(
    (state) => state.globalConfig.isProductDetailsModalOpen
  );
  const isSideBarExpand = useAppSelector(
    (state) => state.globalConfig.isSideBarExpand
  );
  const { data, refetch } = useGetCategoryQuery();
  const [onSeletedItem, setOnSelectedItem] = React.useState(null);
  const [oderIsOpen, setOrderIsOpen] = React.useState(false);
  const [isPopOverOpen, setIsPopOverOpen] = React.useState(false);
  const id = getCookie("id") || localStorage.getItem("id");
  const dispatch = useAppDispatch();

  const {
    data: cart,
    error: cartError,
    refetch: cartRefetch,
  } = useGetCartByOrderIdQuery(Number(id), {skip: !id, refetchOnMountOrArgChange: true});

  const {
    data: orderList,
    error: orderListError,
    refetch: orderListRefetch,
  } = useGetOrderByOrderIdQuery(Number(id), {skip:!id, refetchOnMountOrArgChange: true});

  const itemClasses = {
    base: "py-0 w-full",
    title: "text-white text-sm font-normal",
    trigger:
      "px-2 py-0 data-[hover=true]:bg-default-10 rounded-lg h-10 flex items-center",
    indicator: "text-medium",
    content: "text-small px-2",
  };

  React.useEffect(() => {
    onSearchByCategory(
      selectedCategory?.length > 0 ? selectedCategory?.join(",") : null
    );
  }, [selectedCategory]);

  React.useEffect(() => {
    if (isProductDetailsModalOpen?.isOpen || isOpenCartModal || isOPenOrderModal) {
      setIsPopOverOpen(false);
    }
  }, [isProductDetailsModalOpen, isOpenCartModal, isOPenOrderModal]);

  const handleLogOut = () => {
    eraseCookie("token");
    eraseCookie("role");
    eraseCookie("id");
    eraseCookie("vendorId");
    eraseCookie("storeId");
    eraseCookie("plan");
    dispatch(updateLoginDetails(null));
    location.reload();
  };

  const onSearchByCategory = (id) => {
    dispatch(onSearchGlobal(null));
    dispatch(onGlobalCategorySearch(id));
    dispatch(onGlobalPaymentSearch(null));
  };

  const handleFilters = (result) => {
    const isPaymentFilter = typeof result?.key === "number"; // 1=PreBooking, 2=Online, 3=COD
    if (onSeletedItem === result.key) {
      dispatch(onGlobalPaymentSearch(null));
      dispatch(onUpdateOpenStore(false));
      setOnSelectedItem(null);
      dispatch(onSearchGlobal(null));
      dispatch(onGlobalCategorySearch(null));
      if (isPaymentFilter) {
        setSelectedCategory([]);
      }
    } else {
      dispatch(onGlobalPaymentSearch(result?.key));
      setOnSelectedItem(result.key);
      if (isPaymentFilter) {
        // Payment filter should win over other filters
        dispatch(onSearchGlobal(null));
        dispatch(onGlobalCategorySearch(null));
        dispatch(onUpdateOpenStore(false));
        setSelectedCategory([]);
      }
    }
    if (result?.key === "Hospitals") {
      onSearchByCategory(20);
      dispatch(onUpdateOpenStore(false));
    } else if (result?.key === "Hotels") {
      onSearchByCategory(21);
      dispatch(onUpdateOpenStore(false));
    } else if (result?.key === "Open Shop") {
      dispatch(onSearchGlobal(null));
      dispatch(onGlobalCategorySearch(null));
      dispatch(onGlobalPaymentSearch(null));
      dispatch(onUpdateOpenStore(true));
    }
  };

  return (
    <>
      <div
        className={`navBarStyle 
          transition-all duration-300 fixed top-0 h-full shadow-md z-20
           overflow-y-auto
          ${
            isSideBarExpand
              ? "left-0 md:-left-full"
              : "-left-full md:left-0 md:relative min-w-[230px]"
          }       
        `}
      >
        <Link
          to="/"
          className="flex items-center justify-between px-4 border-b-2 border-b-white text-gray-900 dark:text-white group logoCls"
        >
          <div className="rounded-sm">
            <Image
              alt="Woman listing to music"
              className={` rounded-xl object-fit max-h-[42px] min-w-[80px]`}
              src="https://nicknameinfotech.com/img/new-logo.png"
              // src="../assets/logo.jpg"
            />
          </div>
          <span
            onClick={() => {
              dispatch(onUpdateSidebarExpand(!isSideBarExpand));
            }}
          >
            {isSideBarExpand ? <Arrowleft /> : <Arrowright />}
          </span>
        </Link>
        <aside id="default-sidebar" className="h-[87vh]" aria-label="Sidebar">
          <div className="h-full px-3 pb-2 pt-0 overflow-y-auto custom-scrollbar">
            <div
              className="scroll-content h-fit left-0 top-0 transition-transform z-40"
              style={{
                paddingBottom: "21%",
              }}
            >
              {_nav?.map((result) =>
                result?.menuType === "single" ? (
                  <div
                    key={result.key}
                    style={
                      !result?.isSoon
                        ? {
                            backgroundColor: `${
                              result?.key === onSeletedItem
                                ? "#49a84cd4"
                                : "white"
                            } `,
                          }
                        : {}
                    }
                    className={"rounded-lg cursor-pointer"}
                    onClick={() => {
                      handleFilters(result);
                    }}
                  >
                    <div
                      className={`my-3 p-2 text-sm flex items-center text-gray-900 rounded-lg ${
                        result?.isSoon ? "bg-[#d3d3d385]" : "dark:text-white"
                      } `}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div
                          className={
                            result?.isSoon || result?.key === onSeletedItem
                              ? "flex w-full justify-between"
                              : "flex"
                          }
                        >
                          {result?.info && (
                            <Tooltip content={result?.info} showArrow><span><IconInfo fill="#FF0000" width={15} className={"mr-2"}/></span></Tooltip>
                          )}
                          <p className="text-black text-sm font-normal">
                            {result?.name}
                          </p>
                          {result?.isSoon ? (
                            <p className="text-green-700 text-[0.6rem] font-mono me-2">
                              coming soon
                            </p>
                          ) : result?.key === onSeletedItem ? (
                            <p className="text-green-700 text-[0.6rem] font-mono me-2">
                              Selected
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={result.key} className="rounded-lg mb-3">
                    <Accordion
                      itemClasses={itemClasses}
                      className="text-foreground rounded-lg"
                      style={{
                        backgroundColor: "#4c86f9",
                        // opacity: 4,
                      }}
                    >
                      <AccordionItem
                        key={result.key}
                        aria-label={result?.name}
                        title={result?.name}
                        className="p-0 m-0 text-white"
                      >
                        <ul>
                          {data?.data?.map((data) => {
                            return (
                              <li key={data?.id} className="pb-2 m-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center">
                                    <p
                                      className="me-2 text-white mt-0.5"
                                      style={{
                                        height: "4px",
                                        width: "4px",
                                        borderRadius: "8px",
                                        backgroundColor: "#f6bc00",
                                      }}
                                    ></p>
                                    <p className="ms-2 text-white font-normal text-sm">
                                      {data?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <Checkbox
                                      classNames={{
                                        label: [
                                          "text-small",
                                          "text-yellow-300",
                                          "font-light",
                                          "hover:bg-cyan-500",
                                          "data-[hover=true]:bg-cyan-500",
                                        ],
                                        wrapper: [
                                          "before:border-0",
                                          "before:bg-cyan-500",
                                          "data-[hover=true]:bg-cyan-500",
                                        ],
                                      }}
                                      value={data?.id}
                                      className="m-0 p-0"
                                      onChange={(e) => {
                                        setSelectedCategory((prev) => {
                                          // Check if the category is already selected
                                          if (prev.includes(data?.id)) {
                                            // If it is, remove it from the array
                                            return prev.filter(
                                              (id) => id !== data?.id
                                            );
                                          } else {
                                            // If not, add it to the array
                                            return [...prev, data?.id];
                                          }
                                        });
                                      }}
                                      size="sm"
                                      color="success"
                                      radius="none"
                                    />
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )
              )}
            </div>
            <div
              style={{
                textAlign: currentloginDetails?.data?.email ? "left" : "right",
              }}
              className={`absolute bottom-0 rounded-lg w-11/12 ${
                currentloginDetails?.data?.email ? "bg-white" : ""
              } p-1`}
            >
              {!currentloginDetails?.data?.email ? (
                <Login />
              ) : (
                <div className="flex justify-between w-full items-center">
                  <p className="text-black text-sm font-normal w-full">
                    <Popover
                      showArrow
                      placement="bottom"
                      className="w-full"
                      isOpen={isPopOverOpen}
                      onOpenChange={(open) => {
                        if (!isProductDetailsModalOpen?.isOpen) {
                          setIsPopOverOpen(true);
                        }
                      }}
                      onClose={() => setIsPopOverOpen(false)}
                    >
                      <PopoverTrigger>
                        <User
                          as="button"
                          name={currentloginDetails?.data?.firstName}
                          description="Your Details"
                          className="transition-transform"
                          // avatarProps={{
                          //   src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                          // }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Card
                          shadow="none"
                          className="min-w-[230px] border-none bg-transparent p-0"
                        >
                          <CardBody className="p-0 w-full">
                            <Listbox
                              aria-label="User Menu"
                              onAction={(key) => {
                                if (key === "logOut") {
                                  handleLogOut();
                                }
                              }}
                              itemClasses={{
                                base: "first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
                              }}
                            >
                              <ListboxItem
                                key="issues"
                                endContent={orderList?.data?.length}
                                startContent={<IconHome />}
                                onClick={() =>
                                  dispatch(onUpdateOrderModal(true))
                                }
                              >
                                Orders
                              </ListboxItem>
                              <ListboxItem
                                key="pull_requests"
                                endContent={cart?.data?.length}
                                startContent={<IconHome />}
                                onClick={() =>
                                  dispatch(onUpdateCartModal({
                                    isOpen: true,
                                    item: null,
                                    qty: 0,
                                    type: "Product",
                                  }))
                                }
                              >
                                Cart
                              </ListboxItem>
                              <ListboxItem
                                key="discussions"
                                // endContent={90}
                                startContent={<IconHome />}
                              >
                                Profile
                              </ListboxItem>
                              <ListboxItem
                                key="logOut"
                                startContent={<IconHome />}
                              >
                                Log Out
                              </ListboxItem>
                            </Listbox>
                          </CardBody>
                        </Card>
                      </PopoverContent>
                    </Popover>
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      {isOPenOrderModal && <OrderCard />}
      {isOpenCartModal && <BuyCard />}
    </>
  );
};
