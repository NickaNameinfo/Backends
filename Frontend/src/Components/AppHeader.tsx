import {
  Avatar,
  Button,
  Card,
  CardBody,
  Input,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
  User,
} from "@nextui-org/react";
import * as React from "react";
import "./style.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Arrowright,
  IconCall,
  IconHome,
  IconInfo,
  IconMap,
  IconNext,
  IconPrev,
  IconProfile,
  Iconwhatsup,
  SearchIcon,
} from "./Icons";
import { NavHeaderSearchIcon, NavSearchIcon } from "../Icons";
import { InfoCard } from "./Card/InfoCard";
import Login from "../views/pages/login/Login";
import { useGetCategoryQuery } from "../views/pages/Category/Service.mjs";
import { useAppDispatch, useAppSelector } from "./Common/hooks";
import {
  onGlobalCategorySearch,
  onSearchGlobal,
  onUpdateOpenStore,
  onUpdateSidebarExpand,
  updateLoginDetails,
  onUpdateCartModal,
  onUpdateOrderModal,
} from "../Components/Common/globalSlice";
import { eraseCookie, getCookie } from "../JsFiles/CommonFunction.mjs";
import storeImageIcon from "../assets/icons/store.png";
import vendorImageIcon from "../assets/icons/vendor.png";
import productImageIcon from "../assets/icons/products.png";
import mapImageIcon from "../assets/icons/map.png";
import {
  useGetCartByOrderIdQuery,
  useGetOrderByOrderIdQuery,
} from "../views/pages/Store/Service.mjs";
import { OrderCard } from "./Card/OrderCard";
const views = [
  { name: "Store View", key: "" },
  { name: "Product View", key: "ProductView" },
  { name: "Vendor View", key: "VendorView" },
  { name: "Map View", key: "MapView" },
];

export const AppHeader = () => {
  const location = useLocation();
  const currentloginDetails = useAppSelector(
    (state) => state.globalConfig.currentloginDetails
  );
  const currLocation = location?.pathname?.split("/");

  const isSideBarExpand = useAppSelector(
    (state) => state.globalConfig.isSideBarExpand
  );

  const isProductDetailsModalOpen = useAppSelector(
    (state) => state.globalConfig.isProductDetailsModalOpen
  );

  const isOpenCartModal = useAppSelector(
    (state) => state.globalConfig.isOpenCartModal
  );

  const isOPenOrderModal = useAppSelector(
    (state) => state.globalConfig.isOpenOrderModal
  );

  const navigate = useNavigate();
  const [startIndex, setStartIndex] = React.useState(0);
  const [sliderLabel, setSliderLabel] = React.useState([]);
  const [searchValues, setSearchValues] = React.useState(null);
  const [isPopOverOpen, setIsPopOverOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const id = getCookie("id") || localStorage.getItem("id");
  const itemsPerPage = 12;
  const displayedLabels =
    sliderLabel?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handlePrev = () => {
    setStartIndex(Math.max(startIndex - 1, 0));
  };

  const globalCategorySearch = useAppSelector(
    (state) => state.globalConfig.globalCategorySearch
  );

  const { data: category } = useGetCategoryQuery({ refetchOnMountOrArgChange: true });

  const {
    data: cart,
    error: cartError,
    refetch: cartRefetch,
  } = useGetCartByOrderIdQuery(Number(id), { skip: !id, refetchOnMountOrArgChange: true });

  const {
    data: orderList,
    error: orderListError,
    refetch: orderListRefetch,
  } = useGetOrderByOrderIdQuery(Number(id), { skip: !id, refetchOnMountOrArgChange: true });


  const handleNext = () => {
    setStartIndex((prevIndex) =>
      Math.min(prevIndex + 1, sliderLabel?.length - itemsPerPage)
    );
  };

  const onSearchByCategory = (id) => {
    dispatch(onSearchGlobal(null));
    dispatch(onGlobalCategorySearch(id));
    dispatch(onUpdateOpenStore(false));
  };

  const onSearch = () => {
    dispatch(onSearchGlobal(searchValues));
    dispatch(onUpdateOpenStore(false));
  };

  const handleLogOut = () => {
    eraseCookie("token");
    eraseCookie("role");
    eraseCookie("id");
    eraseCookie("vendorId");
    eraseCookie("storeId");
    eraseCookie("plan");
    dispatch(updateLoginDetails(null));
    window.location.reload();
  };

  React.useEffect(() => {
    if (category?.data) {
      const labels = category.data.map((item) => item);
      setSliderLabel(labels);
    } else {
      setSliderLabel([]);
    }
  }, [category?.data]);

  React.useEffect(() => {
    if (isProductDetailsModalOpen?.isOpen || isOpenCartModal || isOPenOrderModal) {
      setIsPopOverOpen(false);
    }
  }, [isProductDetailsModalOpen, isOpenCartModal, isOPenOrderModal]);

  return (
    <>
      {/* Navbar Section */}
      <div className="flex flex-wrap md:flex-nowrap justify-between navBarStyle gap-4 items-center p-3">
        {/* Left Section */}
        <div className="flex w-full items-center md:w-1/3">
          {isSideBarExpand && (
            <Button
              isIconOnly
              color="primary"
              className="hidden bg-white mx-2 md:flex"
              aria-label="Home"
              onClick={() => dispatch(onUpdateSidebarExpand(false))}
            >
              <Arrowright height="16px" width="16px" />
            </Button>
          )}
          <Button
            isIconOnly
            color="primary"
            className="bg-white mx-2 md:hidden"
            aria-label="Home"
            onClick={() => dispatch(onUpdateSidebarExpand(!isSideBarExpand))}
          >
            <Arrowright height="16px" width="16px" />
          </Button>

          <Link to={"/"}>
            <Button
              isIconOnly
              color="primary"
              className="hidden bg-white mx-2 md:flex"
              aria-label="Home"
            >
              <IconHome height="16px" width="16px" />
            </Button>
          </Link>
          <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0 md:flex-nowrap md:gap-2">
            <Input
              className="w-full min-w-0 md:w-[248px] md:mt-0"
              radius="lg"
              size="md"
              isClearable
              placeholder="Search products..."
              aria-label="Search products"
              onChange={(e) => setSearchValues(e.target.value)}
              onClear={() => {
                dispatch(onSearchGlobal(null));
                setSearchValues(null);
              }}
              classNames={{
                label: "bg-[#ffffff3b] text-black/90 dark:text-black/90",
                input: [
                  "bg-[#ffffff3b]",
                  "text-black/90 dark:text-black/100",
                  "placeholder:text-black-100/30 dark:placeholder:text-black/10",
                  "font-normal",
                  "group-data-[has-value=true]:text-black/90",
                ],
                innerWrapper: "text-black/90 dark:text-black/70",
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
                  "border-0",
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
            />
            <Tooltip
              content="This bar searches the product catalog only. Enter a product name or keyword, then tap the search button."
              showArrow
              delay={200}
              classNames={{
                content: "max-w-[260px] text-small",
              }}
            >
              <span className="inline-flex shrink-0">
                <Button
                  isIconOnly
                  variant="flat"
                  radius="lg"
                  size="md"
                  className="bg-[#ffffff3b] text-foreground/80 border-0 min-w-10"
                  aria-label="About product search"
                >
                  <IconInfo width={18} height={18} />
                </Button>
              </span>
            </Tooltip>
            <Button
              className="shrink-0 md:flex bg-[#ffffff3b] items-center"
              onClick={() => onSearch()}
              aria-label="Run product search"
            >
              <SearchIcon color="blue" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="justify-center flex flex-wrap md:flex-nowrap w-full md:w-2/3 md:justify-end items-center gap-3">
          {/* Navigation Buttons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {views?.map((view, index) => (
              <Button
                key={index}
                color="primary"
                className={`mx-1 IconCalls transition  ${currLocation[1] === view.key
                    ? "bg-primary text-white"
                    : "text-slate-400 bg-white"
                  }`}
                onClick={() => navigate(`/${view.key}`)}
              >
                <span className="hidden sm:block">{view.name}</span>
                <span className="block sm:hidden">
                  <img
                    src={
                      view.key === ""
                        ? storeImageIcon
                        : view.key === "ProductView"
                          ? productImageIcon
                          : view.key === "VendorView"
                            ? vendorImageIcon
                            : mapImageIcon
                    }
                    width={28}
                  />
                </span>
                {currLocation[1] === view?.key && (
                  <div className="justify-center">
                    <svg
                      width="6"
                      height="6"
                      viewBox="0 0 6 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="3" cy="3" r="3" fill="white" />
                    </svg>
                  </div>
                )}
              </Button>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              color="warning"
              className="bg-yellow-500 hidden"
              onPress={() => { }}
            >
              <IconInfo />
            </Button>
            <div>
              {!currentloginDetails?.data?.email ? (
                <Login />
              ) : (
                <div className="flex justify-between w-full items-center border-1 p-1 rounded-[calc(theme(borderRadius.large)/1.5)]">
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
        </div>
      </div>

      {/* Slider Section */}
      <div className="slider-wrapper w-full overflow-hidden px-2">
        <div className="flex items-center justify-between px-4 my-2">
          <Button
            isIconOnly
            className={`Iconwhatsup w-7 min-w-7 h-7 ${startIndex === 0 ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            style={{ backgroundColor: "#0000004a" }}
            onClick={handlePrev}
            disabled={startIndex === 0}
          >
            <IconPrev fill="#ffffffcc" width="12px" height="12px" />
          </Button>
          <div className="slider-container custom-scrollbar overflow-x-auto whitespace-nowrap">
            {displayedLabels?.map((item, index) => (
              <Button
                key={index}
                onClick={() => {
                  // If the clicked category is already selected, unselect it.
                  // Otherwise, select the new category.
                  if (globalCategorySearch === item?.id) {
                    onSearchByCategory(null); // Assuming onSearchByCategory can handle null to unselect
                  } else {
                    onSearchByCategory(item?.id);
                  }
                }}
                className="mx-2 font-medium text-sm w-auto h-10 text-black min-w-min"
                style={{
                  backgroundColor:
                    globalCategorySearch === item?.id ? "#f6bc00" : "#ffffff80",
                  borderRadius: "14px",
                }}
                size="sm"
              >
                {item?.name}
              </Button>
            ))}
          </div>
          <Button
            radius="sm"
            isIconOnly
            style={{ backgroundColor: "#0000004a" }}
            onClick={handleNext}
            disabled={startIndex + itemsPerPage >= sliderLabel.length}
            className={`Iconwhatsup w-7 min-w-7 h-7 ${startIndex + itemsPerPage >= sliderLabel?.length
                ? "cursor-not-allowed"
                : "cursor-pointer"
              }`}
          >
            <IconNext fill="#ffffffcc" width="12px" height="12px" />
          </Button>
        </div>
      </div>
      {isOPenOrderModal && <OrderCard />}
    </>
  );
};
