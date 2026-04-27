import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Image,
  Tabs,
  Tab,
  Textarea,
  Tooltip,
  CardFooter,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import React from "react";
import {
  IconHeart,
  IconLocation,
  IconMapRound,
  IconNext,
  IconPrev,
  IconShare,
  IconTick,
  ModalCloseIcon,
} from "../Icons";
import { infoData } from "../../configData";
import { useAppDispatch, useAppSelector } from "../Common/hooks";
import { Link, useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import { RowsPhotoAlbum } from "react-photo-album";
import {
  useGetCartByProductIdQuery,
  useAddCartMutation,
  useUpdateCartMutation,
  useGetStoresByIdQuery,
  useGetStoresQuery,
  useAddOrderMutation,
  useAddProductFeedbackMutation,
  useGetProductFeedbackByIdQuery,
} from "../../views/pages/Store/Service.mjs";
import {
  onRefreshCart,
  onUpdateCartModal,
  onUpdateProductDetailsModal,
} from "../Common/globalSlice";
import StoreCard from "../Card/StoreCard";
import { toast } from "react-toastify";
import { getCookie } from "../../JsFiles/CommonFunction.mjs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import StarRating from "../Input/Ratings";
import { BuyCard } from "../Card/BuyCard";

interface ProductDetailProps {
  isOpen: any;
  item: any;
}

export const ProductDetail = (props: ProductDetailProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customization, setCustomization] = React.useState(null);
  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [selectedWeight, setSelectedWeight] = React.useState<string>("");
  const [currentPrice, setCurrentPrice] = React.useState<number>(0);
  const [currentStock, setCurrentStock] = React.useState<number>(0);
  const [currentDiscount, setCurrentDiscount] = React.useState<number>(0);
  const [originalPrice, setOriginalPrice] = React.useState<number>(0);
  const [sizeUnitSizeMap, setSizeUnitSizeMap] = React.useState<Record<string, { unitSize: string; qty: string; price: string; discount: string; discount: string; total: string; grandTotal: string }> | null>(null);
  const [feedback, setFeedback] = React.useState<string>("");
  const [rating, setRating] = React.useState<number>(0);
  const onRefresh = useAppSelector((state) => state.globalConfig.onRefreshCart);
  const notify = (value) => toast(value);
  const MySwal = withReactContent(Swal);
  const userId = getCookie("id") || localStorage.getItem("id");
  const {
    data: storeDetails,
    error,
    refetch,
  } = useGetStoresByIdQuery(Number(props?.item?.supplierId), { skip: !Number(props?.item?.supplierId) });
  let productId = {
    id: userId,
    productId: props?.item?.product?.id
      ? props?.item?.product?.id
      : props?.item?.id,
  };
  const {
    data: cart,
    error: cartError,
    refetch: cartRefetch,
  } = useGetCartByProductIdQuery(productId, { skip: !productId });

  const isOpenCartModal = useAppSelector(
    (state) => state.globalConfig.isOpenCartModal
  );

  const [addCart] = useAddCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const [addProductFeedback] = useAddProductFeedbackMutation();
  const dispatch = useAppDispatch();
  const [index, setIndex] = React.useState(-1);
  const [productImageIndex, setProductImageIndex] = React.useState(-1);

  // Get product photos for gallery
  const product = props?.item?.product || props?.item;
  const productPhotos = React.useMemo(() => {
    const photos: Array<{ src: string; width: number; height: number }> = [];

    // Add main photo first
    const mainPhoto = product?.photo || props?.item?.photo;
    if (mainPhoto) {
      photos.push({
        src: mainPhoto,
        width: 3840,
        height: 3840,
      });
    }

    // Add sub photos (productphotos)
    if (product?.productphotos && Array.isArray(product.productphotos)) {
      product.productphotos.forEach((photo: any) => {
        const imgUrl = photo?.imgUrl || photo?.url || photo;
        if (imgUrl && typeof imgUrl === 'string') {
          photos.push({
            src: imgUrl,
            width: 3840,
            height: 3840,
          });
        }
      });
    }

    return photos;
  }, [product, props?.item]);

  // Get product ID for feedback
  const productIdForFeedback = props?.item?.product?.id || props?.item?.id;

  // Get feedback by product ID (optional - to show existing feedbacks)
  const {
    data: productFeedbackData,
    refetch: refetchFeedback,
  } = useGetProductFeedbackByIdQuery(productIdForFeedback, {
    skip: !productIdForFeedback
  });

  // Parse sizeUnitSizeMap and set initial price
  React.useEffect(() => {
    const product = props?.item?.product || props?.item;
    if (product?.sizeUnitSizeMap) {
      try {
        const parsed = typeof product.sizeUnitSizeMap === 'string'
          ? JSON.parse(product.sizeUnitSizeMap)
          : product.sizeUnitSizeMap;
        setSizeUnitSizeMap(parsed);

        // Check if product is already in cart and has a size
        const cartSize = cart?.data?.size;
        let sizeToSelect = cartSize;

        // If no size in cart, use first size as default
        if (!sizeToSelect || !parsed[sizeToSelect]) {
          sizeToSelect = Object.keys(parsed)[0];
        }

        if (sizeToSelect && parsed[sizeToSelect]) {
          setSelectedSize(sizeToSelect);
          const sizeData = parsed[sizeToSelect];
          // Prioritize total/grandTotal (discounted price) over price
          const sizePrice = Number(sizeData.total) || Number(sizeData.grandTotal) || Number(sizeData.price) || 0;
          if (sizePrice > 0) {
            setCurrentPrice(sizePrice);
          } else {
            // Fallback: prioritize product price over item price (item.price can be 0)
            const initialPrice = product?.total || product?.price || props?.item?.price || 0;
            setCurrentPrice(Number(initialPrice));
          }
        } else {
          // Set initial price if no sizes available
          // Fallback: prioritize product price over item price (item.price can be 0)
          const initialPrice = product?.total || product?.price || props?.item?.price || 0;
          setCurrentPrice(Number(initialPrice));
        }
      } catch (e) {
        console.warn('Failed to parse sizeUnitSizeMap:', e);
        setSizeUnitSizeMap(null);
        // Fallback: prioritize product price over item price (item.price can be 0)
        const initialPrice = product?.total || product?.price || props?.item?.price || 0;
        const initialOriginalPrice = product?.price || product?.total || props?.item?.price || 0;
        setCurrentPrice(Number(initialPrice));
        setOriginalPrice(Number(initialOriginalPrice));
        setCurrentDiscount(Number(product?.discount) || 0);
        setCurrentStock(Number(product?.unitSize) || 0);
      }
    } else {
      // Set initial price if no sizeUnitSizeMap
      // Fallback: prioritize product price over item price (item.price can be 0)
      const initialPrice = product?.total || product?.price || props?.item?.price || 0;
      const initialOriginalPrice = product?.price || product?.total || props?.item?.price || 0;
      setCurrentPrice(Number(initialPrice));
      setOriginalPrice(Number(initialOriginalPrice));
      setCurrentDiscount(Number(product?.discount) || 0);
      setCurrentStock(Number(product?.unitSize) || 0);
    }
  }, [props?.item, cart?.data?.size]);

  // Update price, discount, and stock when size changes
  React.useEffect(() => {
    if (selectedSize && sizeUnitSizeMap && sizeUnitSizeMap[selectedSize]) {
      const sizeData = sizeUnitSizeMap[selectedSize];
      const product = props?.item?.product || props?.item;

      // Prioritize total/grandTotal (discounted price) over price
      const sizePrice = Number(sizeData.total) || Number(sizeData.grandTotal) || Number(sizeData.price) || 0;
      const sizeOriginalPrice = Number(sizeData.price) || Number(product?.price) || Number(product?.total) || 0;
      const sizeDiscount = Number(sizeData.discount) || Number(sizeData.discount) || 0;
      const sizeStock = Number(sizeData.unitSize) || 0;

      if (sizePrice > 0) {
        setCurrentPrice(sizePrice);
        setOriginalPrice(sizeOriginalPrice);
        setCurrentDiscount(sizeDiscount);
        setCurrentStock(sizeStock);
      }
    } else if (!selectedSize) {
      // Reset to original price when size is cleared
      const product = props?.item?.product || props?.item;
      // Fallback: prioritize product price over item price (item.price can be 0)
      const originalPrice = product?.total || product?.price || props?.item?.price || 0;
      const originalOriginalPrice = product?.price || product?.total || props?.item?.price || 0;
      setCurrentPrice(Number(originalPrice));
      setOriginalPrice(Number(originalOriginalPrice));
      setCurrentDiscount(Number(product?.discount) || 0);
      setCurrentStock(Number(product?.unitSize) || 0);
    }
  }, [selectedSize, sizeUnitSizeMap, props?.item]);

  // React.useEffect(() => {
  //   onRefresh && dispatch(onRefreshCart(false));
  //   refetch();
  //   storesRefetch();
  // }, [onRefresh]);

  const handleAddCart = async (type) => {
    // Use current price (which may be updated based on size selection)
    // Fallback: prioritize product price over item price (item.price can be 0)
    const product = props?.item?.product || props?.item;
    const priceToUse = currentPrice > 0 ? currentPrice : (Number(product?.total) || Number(product?.price) || Number(props?.item?.price) || 0);

    const storeIdToUse =
      props?.item?.supplierId ??
      props?.item?.storeId ??
      props?.item?.store_id ??
      props?.item?.product?.createdId ??
      props?.item?.product?.supplierId ??
      "";

    let tempCartValue = {
      productId: props?.item?.product?.id
        ? props?.item?.product?.id
        : props?.item?.id,
      name: props?.item?.product?.name
        ? props?.item?.product?.name
        : props?.item?.name,
      orderId: userId,
      price: priceToUse,
      total: Number(cart?.data?.qty || 1) * priceToUse,
      qty: cart?.data?.qty
        ? type === "add"
          ? Number(cart?.data?.qty) + 1
          : Number(cart?.data?.qty) - 1
        : 1,
      unitSize: props?.item?.product?.unitSize,
      photo: props?.item?.product?.photo
        ? props?.item?.product?.photo
        : props?.item?.photo,
      // Critical: storeId is used for Shiprocket pickup pincode
      storeId: storeIdToUse,
      size: selectedSize || "",
      weight: selectedWeight || "",
    };
    if (cart?.data) {
      try {
        const result = await updateCart(tempCartValue);
        if (result?.data?.success) {
          cartRefetch();
        }
      } catch (error) {
        MySwal.fire({
          title: <p>Please login and continue the shoping</p>,
        });
      }
    } else {
      try {
        const result = await addCart(tempCartValue);
        if (result?.data?.success) {
          cartRefetch();
        } else {
          throw error;
        }
      } catch (error) {
        MySwal.fire({
          title: <p>Please login and continue the shoping</p>,
        });
      }
    }
  };

  const handleShare = () => {
    const url = window.location.href; // Get the current URL
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notify("URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy the URL: ", err);
      });
  };

  const slides = [
    {
      src: "https://nicknameinfotech.com/img/new-logo.png",
      width: 3840,
      height: 3840,
    },
    {
      src: "https://yet-another-react-lightbox.com/images/image02.jpeg",
      width: 3840,
      height: 3840,
    },
    {
      src: "https://yet-another-react-lightbox.com/images/image03.jpeg",
      width: 3840,
      height: 3840,
    },
  ];

  const handleAddOrder = async () => {
    if (cart?.data?.qty || Number(props?.item?.product?.isBooking)) {
      dispatch(onUpdateCartModal({
        isOpen: true,
        item: props?.item,
        qty: cart?.data?.qty,
        type: Number(props?.item?.product?.isBooking) ? "Service" : "Product",
      }))
    } else {
      MySwal.fire({
        title: <p>Please select quantity</p>,
      });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!userId) {
      toast.error("Please login to submit feedback!");
      return;
    }

    if (!feedback || feedback.trim() === "") {
      toast.error("Please enter your feedback");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const product = props?.item?.product || props?.item;
      const feedbackData = {
        customerId: userId,
        productId: productIdForFeedback,
        vendorId: product?.createdType === "Vendor" ? product?.createdId : null,
        storeId: product?.createdType === "Store" ? product?.createdId : (props?.item?.supplierId || null),
        feedBack: feedback.trim(),
        rating: rating,
        customizedMessage: feedback.trim(),
      };

      const result = await addProductFeedback(feedbackData).unwrap();

      if (result?.success) {
        toast.success("Feedback submitted successfully!");
        setFeedback("");
        setRating(0);
        refetchFeedback();
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error?.data?.msg || "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <>
      <Modal
        size={"5xl"}
        isOpen={props?.isOpen}
        onClose={() => {
          if (props?.isOpen && cart?.data?.qty && cart?.data?.qty !== 0) {
            dispatch(
              onUpdateProductDetailsModal({
                isOpen: false,
                item: null,
              })
            );
          }
        }}
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalCloseIcon
                onClick={() => {
                  dispatch(
                    onUpdateProductDetailsModal({
                      isOpen: false,
                      item: null,
                    })
                  );
                }}
                className="modalIconClose"
              />
              <ModalBody className="p-5">
                <div className="grid xm:grid-cols-2 mm:grid-cols-2  sm:grid-cols-2 ml:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-4">
                  <div className="">
                    <Card className="p-4 bg-default/40 mm:w-full ml:w-full">
                      <CardBody className="overflow-visible p-0 relative">
                        <Image
                          alt="Card background"
                          src={`${props?.item?.product?.photo ?? props?.item?.photo}`}
                          width="100%"
                          radius="lg"
                          className="w-full object-contain md:h-[222px] xm:h-[150px] mm:h-[150px]  ml:h-[150px] cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            if (productPhotos.length > 0) {
                              setProductImageIndex(0);
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                    {/* Product Photos Thumbnail Gallery */}
                    {productPhotos.length > 1 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-2 justify-center items-center">
                        {productPhotos.slice(0, 5).map((photo, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden hover:border-blue-500 transition-colors flex items-center justify-center"
                            style={{
                              borderColor: productImageIndex === idx ? '#3b82f6' : '#e5e7eb',
                            }}
                            onClick={() => setProductImageIndex(idx)}
                          >
                            <Image
                              alt={`Product photo ${idx + 1}`}
                              src={photo.src}
                              width={30}
                              height={30}
                              className="object-cover"
                              radius="sm"
                            />
                          </div>
                        ))}
                        {productPhotos.length > 5 && (
                          <div className="flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500">
                            +{productPhotos.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="sm:px-2 xl:col-span-1 lg:col-span-1 md:order-3 xm:order-3 mm:order-3 ml:order-3 md:col-span-2 xm:col-span-2 mm:col-span-2 ml:col-span-2 ">
                    <div className="">
                      <h2 className="text-xl truncate font-bold">
                        {props?.item?.product?.name
                          ? props?.item?.product?.name
                          : props?.item?.name}
                      </h2>
                      {/* Discount Badge */}
                      {currentDiscount > 0 && (
                        <div className="my-2">
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-300">
                            {currentDiscount.toFixed(0)}% OFF
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <p className="text-black text-lg font-normal">
                            Rs: {currentPrice > 0 ? currentPrice.toFixed(0) : (() => {
                              const product = props?.item?.product || props?.item;
                              return product?.total || product?.price || props?.item?.price || 0;
                            })()}
                          </p>
                          {/* Show original price with strikethrough if there's a discount */}
                          {currentDiscount > 0 && originalPrice > currentPrice && (
                            <p className="text-gray-400 text-sm line-through">
                              Rs: {originalPrice.toFixed(0)}
                            </p>
                          )}
                        </div>
                        <div className="text-sm">
                          <small
                            style={{
                              color: "#999",
                              paddingLeft: "10px",
                            }}
                          >
                            {currentStock > 0 ? currentStock : (selectedSize && sizeUnitSizeMap && sizeUnitSizeMap[selectedSize]
                              ? sizeUnitSizeMap[selectedSize].unitSize
                              : (props?.item?.product?.unitSize ? props?.item?.product?.unitSize : props?.item?.product?.qty) || 0)}
                          </small>{" "}
                          Stocks
                        </div>
                      </div>
                      {/* Size Selection - Box Style */}
                      {sizeUnitSizeMap && Object.keys(sizeUnitSizeMap).length > 0 && (
                        <div className="mt-3">
                          <div className="mb-2">
                            <span className="text-gray-600 text-sm">Size: </span>
                            <span className="font-semibold text-black text-sm">
                              {selectedSize ? selectedSize.toUpperCase() : "Select"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(sizeUnitSizeMap).map((size) => {
                              const sizeData = sizeUnitSizeMap[size];
                              const isSelected = selectedSize === size;
                              const unitSize = sizeData.unitSize || "";

                              return (
                                <button
                                  key={size}
                                  onClick={() => {
                                    setSelectedSize(size);
                                    // Update price, discount, and stock when size is selected
                                    const sizePrice = Number(sizeData.total) || Number(sizeData.grandTotal) || Number(sizeData.price) || 0;
                                    const sizeOriginalPrice = Number(sizeData.price) || 0;
                                    const sizeDiscount = Number(sizeData.discount) || Number(sizeData.discount) || 0;
                                    const sizeStock = Number(sizeData.unitSize) || 0;

                                    if (sizePrice > 0) {
                                      setCurrentPrice(sizePrice);
                                      setOriginalPrice(sizeOriginalPrice);
                                      setCurrentDiscount(sizeDiscount);
                                      setCurrentStock(sizeStock);
                                    }
                                  }}
                                  className={`
                                    px-4 py-2 rounded border-2 transition-all text-sm
                                    ${isSelected
                                      ? 'border-blue-600 bg-blue-50 text-black font-medium'
                                      : 'border-dashed border-gray-300 bg-white text-black hover:border-gray-400'
                                    }
                                    min-w-[80px] text-center
                                  `}
                                >
                                  {unitSize ? `${size.toUpperCase()}: ${unitSize}` : size.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {(Number(props?.item?.product?.isEnableEcommerce) === 1 ||
                        Number(props?.item?.isEnableEcommerce) === 1) && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="">
                              <div className="flex justify-between items-center rounded-xl bg-gray-100 lg:h-unit-xl">
                                <Button
                                  className="bg-gray-100 p-0 m-0 text-base font-semibold xm:h-unit-8 xm:px-4 lg:px-3"
                                  radius="full"
                                  isIconOnly
                                  size="md"
                                  onClick={() => handleAddCart("remove")}
                                >
                                  -
                                </Button>
                                <p className="bg-gray-100 text-sm font-semibold p-0 m-0">
                                  {cart?.data?.qty ? cart?.data?.qty : 0}
                                </p>
                                <Button
                                  className="bg-gray-100 p-0 m-0 text-base font-semibold xm:h-unit-8 xm:px-4 lg:px-3"
                                  radius="full"
                                  isIconOnly
                                  size={"md"}
                                  onClick={() => handleAddCart("add")}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <div className="">
                              <Button
                                className="xm:h-unit-8 xm:px-4 lg:px-3 lg:h-unit-xl"
                                color="primary"
                                variant="ghost"
                                radius="lg"
                                size={"md"}
                                onClick={() => {
                                  if (userId) {
                                    dispatch(onUpdateCartModal({
                                      isOpen: true,
                                      item: props?.item,
                                      qty: cart?.data?.qty ? cart?.data?.qty : 0,
                                      type: "Product",
                                    }));
                                  } else {
                                    toast.error("Please login to add to cart!");
                                  }
                                }}
                              >
                                View Cart
                              </Button>
                            </div>
                          </div>
                        )}
                      <div className="grid grid-cols-12 justify-between items-center mt-4">
                        <div className="col-span-8">
                          <div className="flex items-center justify-between pb-2.5">
                            <p className="text-sm font-normal">Per Order</p>
                            <IconTick
                              fill={
                                props?.item?.product?.paymentMode?.includes(
                                  "1"
                                ) || props?.item?.paymentMode?.includes("1")
                                  ? "#49A84C"
                                  : "red"
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between pb-2.5">
                            <p className="text-sm font-normal">
                              Online Payment
                            </p>
                            <IconTick
                              fill={
                                props?.item?.product?.paymentMode?.includes(
                                  "2"
                                ) || props?.item?.paymentMode?.includes("2")
                                  ? "#49A84C"
                                  : "red"
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-normal">
                              Cash On Delivery
                            </p>
                            <IconTick
                              fill={
                                props?.item?.product?.paymentMode?.includes(
                                  "2"
                                ) || props?.item?.paymentMode?.includes("2")
                                  ? "#49A84C"
                                  : "red"
                              }
                            />
                          </div>
                        </div>
                        <div className="col-span-4 ms-4 flex flex-col justify-between h-full">
                          <div className="flex items-center justify-end ">
                            <div className="flex gap-5 items-center">
                              <Link to={storeDetails?.location} target="_blank">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  aria-label="Like"
                                  color="primary"
                                  variant="bordered"
                                >
                                  <IconLocation fill="#4C86F9" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                color="success"
                                variant="bordered"
                                isIconOnly
                                onClick={() => handleShare()}
                              >
                                <IconShare fill="#49A84C" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-end mb-1.5">
                            <div className="flex gap-5 items-center">
                              <Link to={storeDetails?.website} target="_blank">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  aria-label="Like"
                                  color="danger"
                                  variant="bordered"
                                >
                                  <IconMapRound fill="#FF0000" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                color="danger"
                                variant="bordered"
                                isIconOnly
                              >
                                <IconHeart fill="#FF0000" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex xl:order-3 lg:order-3">
                    <div className="relative mm:w-10/12 ml:w-10/12 ">
                      <span className="bg-red z-50 right-0 absolute text-white text-xs font-medium px-2.5 py-1 rounded-se-xl rounded-es-xl dark:bg-gray-700 dark:text-gray-300">
                        Ad
                      </span>
                      <Image
                        isZoomed
                        className="w-full object-contain md:h-[222px] xm:h-[150px] mm:h-[145px] ml:h-[145px]"
                        height={300}
                        alt="Here no Image"
                        src="https://nicknameinfotech.com/img/new-logo.png"
                      />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-2">
                  <div className="">
                    <div className="description me-2">
                      <div className="flex w-full flex-col">
                        <Tabs
                          aria-label="Options"
                          color="default"
                          variant="solid"
                        // className="flex-col"
                        >
                          <Tab
                            key="photos"
                            title={
                              <div className="flex items-center space-x-2 ">
                                {/* <GalleryIcon /> */}
                                <span>Description</span>
                              </div>
                            }
                          >
                            <Card className="min-h-[170px]">
                              <CardBody>
                                {props?.item?.product?.sortDesc
                                  ? props?.item?.product?.sortDesc
                                  : props?.item?.sortDesc}
                              </CardBody>

                            </Card>
                            {Number(props?.item?.product?.isBooking) ?
                              <div className="flex justify-end mt-2">
                                <Button
                                  variant="ghost"
                                  color={"success"}
                                  className={"mr-3"}
                                  onClick={() => {
                                    if (userId) {
                                      handleAddOrder()
                                    } else {
                                      toast.error("Please login to place order!");
                                    }
                                  }}
                                >Book Service</Button>
                              </div> : null
                            }
                          </Tab>
                          {/* <Tab
                            key="music"
                            title={
                              <div className="flex items-center space-x-2">
                                <span>Product Images</span>
                              </div>
                            }
                          >
                            <Card className="min-h-[170px]">
                              <CardBody>
                                {" "}
                                <RowsPhotoAlbum
                                  photos={slides}
                                  targetRowHeight={150}
                                  onClick={({ index: current }) =>
                                    setIndex(current)
                                  }
                                />
                              </CardBody>
                            </Card>
                          </Tab> */}
                        </Tabs>
                      </div>
                    </div>
                  </div>
                  <div className="min-h-[170px]">
                    <Tabs
                      aria-label="Options"
                      color="default"
                      variant="solid"
                    // className="flex-col"
                    >

                      {Number(props?.item?.product?.isEnableEcommerce) && <Tab
                        key="normalOrder"
                        title={
                          <div className="flex items-center space-x-2">
                            {/* <GalleryIcon /> */}
                            <span>Normal Order</span>
                          </div>
                        }
                      >
                        <Card className="min-h-[170px]">
                          <CardBody>
                            <h2 className="font-bold my-2">Give delivery details</h2>
                            <Textarea
                              classNames={{
                                base: "max-w-[100%]",
                                input: "resize-y min-h-[120px]",
                              }}
                              placeholder="Enter your details"
                              onChange={(e) => setCustomization(e.target.value)}
                              errorMessage={
                                !customization
                                  ? "Please enter your customization details"
                                  : null
                              }
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                variant="ghost"
                                color={!cart?.data?.qty ? "default" : "success"}
                                disabled={!cart?.data?.qty}
                                className={!cart?.data?.qty ? "cursor-not-allowed mr-3" : "mr-3"}
                                onClick={() => {
                                  if (userId) {
                                    handleAddOrder()
                                  } else {
                                    toast.error("Please login to place order!");
                                  }
                                }}
                              >Place Order</Button>
                            </div>
                          </CardBody>
                        </Card>
                      </Tab>
                      }

                      {Number(props?.item?.product?.isEnableCustomize) && <Tab
                        key="Customize"
                        title={
                          <div className="flex items-center space-x-2">
                            {/* <GalleryIcon /> */}
                            <span>Customize Order</span>
                          </div>
                        }
                      >
                        <Card className="min-h-[170px]">
                          <CardBody>
                            <h2 className="font-bold my-2">Please enter your customization details</h2>
                            <Textarea
                              classNames={{
                                base: "max-w-[100%]",
                                input: "resize-y min-h-[120px]",
                              }}
                              placeholder="Enter your details"
                              onChange={(e) => setCustomization(e.target.value)}
                              errorMessage={
                                !customization
                                  ? "Please enter your customization details"
                                  : null
                              }
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                variant="ghost"
                                color={!cart?.data?.qty ? "default" : "success"}
                                disabled={true}
                                className={!cart?.data?.qty ? "cursor-not-allowed mr-3" : "mr-3"}
                                onClick={() => {
                                  if (userId) {
                                    handleAddOrder();
                                  } else {
                                    toast.error("Please login to place order!");
                                  }
                                }}
                              >Place Order</Button>
                            </div>
                          </CardBody>
                        </Card>
                      </Tab>}

                      <Tab
                        key="Feedback"
                        title={
                          <div className="flex items-center space-x-2">
                            {/* <GalleryIcon /> */}
                            <span>Feedback</span>
                          </div>
                        }
                      >
                        <Card className="min-h-[170px]">
                          <CardBody>
                            <h2 className="font-bold my-2">Write your feedback</h2>
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-2">Rating:</p>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <button
                                    key={starValue}
                                    type="button"
                                    onClick={() => setRating(starValue)}
                                    className="focus:outline-none"
                                  >
                                    <svg
                                      className={`w-8 h-8 ${starValue <= rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                        }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                              {rating > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Selected: {rating} star{rating !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                            <Textarea
                              classNames={{
                                base: "max-w-[100%]",
                                input: "resize-y min-h-[120px]",
                              }}
                              placeholder="Enter your feedback"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              errorMessage={
                                !feedback || feedback.trim() === ""
                                  ? "Please enter your feedback"
                                  : null
                              }
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                variant="ghost"
                                color={!feedback || rating === 0 ? "default" : "success"}
                                disabled={!feedback || feedback.trim() === "" || rating === 0}
                                className={(!feedback || rating === 0) ? "cursor-not-allowed mr-3" : "mr-3"}
                                onClick={handleSubmitFeedback}
                              >Submit Feedback</Button>
                            </div>
                          </CardBody>
                        </Card>
                      </Tab>
                    </Tabs>

                  </div>
                </div>
              </ModalBody>

              <Lightbox
                index={index}
                slides={slides}
                open={index >= 0}
                close={() => setIndex(-1)}
              />
              <Lightbox
                index={productImageIndex}
                slides={productPhotos}
                open={productImageIndex >= 0}
                close={() => setProductImageIndex(-1)}
              />
            </>
          )}
        </ModalContent>
      </Modal>

      {/* {isOpenCartModal && <BuyCard />} */}
    </>
  );
};
