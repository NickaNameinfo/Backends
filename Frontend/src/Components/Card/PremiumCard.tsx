import * as React from "react";
import "../style.scss";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import {
  IconHeart,
  IconShopBag,
  IconShoptrolley,
  IconTick,
  IconsEye,
} from "../Icons";
import { useParams } from "react-router-dom";
import {
  useGetCartByProductIdQuery,
  useAddCartMutation,
  useUpdateCartMutation,
} from "../../views/pages/Store/Service.mjs";
import { useAppDispatch, useAppSelector } from "../Common/hooks";
import {
  onRefreshCart,
  onUpdateCartModal,
  onUpdateProductDetailsModal,
} from "../Common/globalSlice";
import { infoData } from "../../configData";
import { getCookie } from "../../JsFiles/CommonFunction.mjs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";

export const PremiumCard = ({
  item = null,
  isHideImage = false,
  from = null,
  popOverOnClose = null,
}) => {

  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [selectedWeight, setSelectedWeight] = React.useState<string>("");
  const [currentPrice, setCurrentPrice] = React.useState<number>(0);
  const [sizeUnitSizeMap, setSizeUnitSizeMap] = React.useState<Record<string, { unitSize: string; qty: string; price: string; discount: string; discountPer: string; total: string; grandTotal: string }> | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);

  const onRefresh = useAppSelector((state) => state.globalConfig.onRefreshCart);
  const productItem = item.product ? item.product : item;
  
  // Get all product photos (main + sub photos)
  const allProductPhotos = React.useMemo(() => {
    const photos: string[] = [];
    
    // Add main photo first
    const mainPhoto = productItem?.photo;
    if (mainPhoto) {
      photos.push(mainPhoto);
    }
    
    // Add sub photos (productphotos)
    if (productItem?.productphotos && Array.isArray(productItem.productphotos)) {
      productItem.productphotos.forEach((photo: any) => {
        const imgUrl = photo?.imgUrl || photo?.url || photo;
        if (imgUrl && typeof imgUrl === 'string') {
          photos.push(imgUrl);
        }
      });
    }
    
    return photos;
  }, [productItem]);
  
  // Reset selected image index when product changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [productItem?.id]);
  const userId = getCookie("id");
  const { id } = useParams();
  const [addCart] = useAddCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const dispatch = useAppDispatch();
  let productId = {
    id: userId,
    productId: productItem?.id,
  };
  const { data, error, refetch } = useGetCartByProductIdQuery(productId, { skip: !productId });
  const MySwal = withReactContent(Swal);

  // Parse sizeUnitSizeMap and set initial price
  React.useEffect(() => {
    if (productItem?.sizeUnitSizeMap) {
      try {
        const parsed = typeof productItem.sizeUnitSizeMap === 'string'
          ? JSON.parse(productItem.sizeUnitSizeMap)
          : productItem.sizeUnitSizeMap;
        setSizeUnitSizeMap(parsed);

        // Check if product is already in cart and has a size
        const cartSize = data?.data?.size;
        let sizeToSelect = cartSize;

        // If no size in cart, use first size as default
        if (!sizeToSelect || !parsed[sizeToSelect]) {
          sizeToSelect = Object.keys(parsed)[0];
        }

        if (sizeToSelect && parsed[sizeToSelect]) {
          setSelectedSize(sizeToSelect);
          const sizeData = parsed[sizeToSelect];
          const sizePrice = Number(sizeData.price) || Number(sizeData.total) || Number(sizeData.grandTotal) || 0;
          if (sizePrice > 0) {
            setCurrentPrice(sizePrice);
          } else {
            const initialPrice = item?.price || productItem?.total || productItem?.price || 0;
            setCurrentPrice(Number(initialPrice));
          }
        } else {
          // Set initial price if no sizes available
          const initialPrice = item?.price || productItem?.total || productItem?.price || 0;
          setCurrentPrice(Number(initialPrice));
        }
      } catch (e) {
        console.warn('Failed to parse sizeUnitSizeMap:', e);
        setSizeUnitSizeMap(null);
        const initialPrice = item?.price || productItem?.total || productItem?.price || 0;
        setCurrentPrice(Number(initialPrice));
      }
    } else {
      // Set initial price if no sizeUnitSizeMap
      const initialPrice = item?.price || productItem?.total || productItem?.price || 0;
      setCurrentPrice(Number(initialPrice));
    }
  }, [item, productItem, data?.data?.size]);

  // Update price when size changes
  React.useEffect(() => {
    if (selectedSize && sizeUnitSizeMap && sizeUnitSizeMap[selectedSize]) {
      const sizeData = sizeUnitSizeMap[selectedSize];
      const sizePrice = Number(sizeData.price) || Number(sizeData.total) || Number(sizeData.grandTotal) || 0;
      if (sizePrice > 0) {
        setCurrentPrice(sizePrice);
      }
    } else if (!selectedSize) {
      // Reset to original price when size is cleared
      const originalPrice = item?.price || productItem?.total || productItem?.price || 0;
      setCurrentPrice(Number(originalPrice));
    }
  }, [selectedSize, sizeUnitSizeMap, item, productItem]);

  React.useEffect(() => {
    onRefresh && dispatch(onRefreshCart(false));
    refetch();
  }, [onRefresh]);

  const handleAddCart = async (type) => {
    // Use current price (which may be updated based on size selection)
    const priceToUse = currentPrice > 0 ? currentPrice : (Number(item?.price) || Number(productItem?.total) || Number(productItem?.price) || 0);

    let tempCartValue = {
      productId: productItem?.id,
      name: productItem?.name,
      orderId: userId,
      price: priceToUse,
      total: Number(data?.data?.qty || 1) * priceToUse,
      qty: data?.data?.qty
        ? type === "add"
          ? Number(data?.data?.qty) + 1
          : Number(data?.data?.qty) - 1
        : 1,
      unitSize: selectedSize && sizeUnitSizeMap && sizeUnitSizeMap[selectedSize]
        ? sizeUnitSizeMap[selectedSize].unitSize
        : productItem?.unitSize,
      photo: productItem?.photo ? productItem?.photo : item?.photo,
      storeId: id,
      size: selectedSize || "",
      weight: selectedWeight || "",
    };
    if (data?.data) {
      try {
        const result = await updateCart(tempCartValue);
        if (result?.data?.success) {
          refetch();
          dispatch(onRefreshCart(true));
        }
      } catch (error) {
        MySwal.fire({
          title: <p>{error?.data?.error}</p>,
        });
      }
    } else {
      try {
        const result = await addCart(tempCartValue);
        if (result?.data?.success) {
          refetch();
          dispatch(onRefreshCart(true));
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
  return (
    <>
      <Card className="Storecard pt-3.5 px-3">
        {!isHideImage && (
          <CardBody
            className="overflow-visible p-0 relative"
          >
            <span className="bg-slate-700 z-50 absolute text-white text-xs font-medium px-2.5 py-1 rounded-ss-xl rounded-ee-xl dark:bg-gray-700 dark:text-gray-300">
              {productItem?.discount ? productItem?.discount : item?.discount} %
            </span>

              <div className="relative flex gap-2">
                <div className="flex-1" onClick={() => {
                  dispatch(
                    onUpdateProductDetailsModal({
                      isOpen: true,
                      item: item,
                    })
                  );
                }}>
                  <Image
                    isZoomed
                    alt="Here no Image"
                    shadow="md"
                    width="100%"
                    radius="lg"
                    className={`w-full object-contain cursor-pointer ${from !== "ProductView"
                      ? "min-h-[176px] max-h-[176px]"
                      : "min-h-[176px] max-h-[176px]"
                    }`}
                    src={allProductPhotos[selectedImageIndex] || productItem?.photo}
                  />
                </div>
                {/* Show small thumbnail images on the right side */}
                {allProductPhotos.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    {allProductPhotos.slice(0, 4).map((imgUrl: string, idx: number) => {
                      const isSelected = selectedImageIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(idx);
                          }}
                          className={`flex-shrink-0 border rounded overflow-hidden cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 border-2' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <Image
                            alt={`Product photo ${idx + 1}`}
                            src={imgUrl}
                            style={{ width: "25px", height: "25px" }}
                            className="object-cover"
                            radius="sm"
                          />
                        </div>
                      );
                    })}
                    {allProductPhotos.length > 4 && (
                      <div className="flex-shrink-0 flex items-center justify-center border border-gray-200 rounded bg-gray-100 text-xs text-gray-600 font-medium"
                        style={{
                          width: "25px",
                          height: "25px",
                        }}
                      >
                        +{allProductPhotos.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            <div className="font-semibold text-base mt-2 TextMaincolor" onClick={() => {
              dispatch(
                onUpdateProductDetailsModal({
                  isOpen: true,
                  item: item,
                })
              );
            }}>
              <p className="truncate">{productItem?.name}</p>
            </div>
            <div className="w-full flex justify-between mt-2">
              <p className="font-semibold text-base Pricecolor p-0">
                Rs : {currentPrice > 0 ? currentPrice : (productItem?.total || item?.price || 0)}{" "}
                <span
                  style={{ color: "black", fontSize: "10px" }}
                >{`(${productItem?.qty})`}</span>
              </p>
              <p className="font-normal text-sm  TextMaincolor p-0">
                <small
                  style={{
                    color: "#999",
                    paddingLeft: "10px",
                  }}
                >
                  {selectedSize && sizeUnitSizeMap && sizeUnitSizeMap[selectedSize]
                    ? sizeUnitSizeMap[selectedSize].unitSize
                    : productItem?.unitSize}
                </small>{" "}
                Stocks
              </p>
            </div>
            {/* Size Selection - Box Style */}
            {sizeUnitSizeMap && Object.keys(sizeUnitSizeMap).length > 0 && (
              <div className="mt-2">
                <div className="mb-2">
                  <span className="text-gray-600 text-xs">Size: </span>
                  <span className="font-semibold text-black text-xs">
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
                        onClick={() => setSelectedSize(size)}
                        className={`
                          px-3 py-1.5 rounded border-2 transition-all text-xs
                          ${isSelected
                            ? 'border-blue-600 bg-blue-50 text-black font-medium'
                            : 'border-dashed border-gray-300 bg-white text-black hover:border-gray-400'
                          }
                          min-w-[20px] text-center
                        `}
                      >
                        {unitSize ? `${size.toUpperCase()}: ${unitSize}` : size.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="w-full flex justify-between mt-2">
              <p className="font-normal text-sm  Pricecolor TextMaincolor p-0">
                Per order
              </p>
              <IconTick
                fill={
                  productItem?.paymentMode?.includes("1") ? "#49A84C" : "red"
                }
              />
            </div>
            <div className="w-full flex justify-between pt-2">
              <p className="font-normal text-sm  Pricecolor TextMaincolor p-0">
                Online payment
              </p>
              <IconTick
                fill={
                  productItem?.paymentMode?.includes("2") ? "#49A84C" : "red"
                }
              />
            </div>
            <div className="w-full flex justify-between pt-2 pb-2">
              <p className="font-normal text-sm  Pricecolor TextMaincolor p-0">
                Cash on delivery
              </p>
              <IconTick
                fill={
                  productItem?.paymentMode?.includes("3") ? "#49A84C" : "red"
                }
              />
            </div>
          </CardBody>
        )}

        <CardFooter className="p-0">
          <div className="grid grid-cols-1 w-full">

            <div className="w-full flex justify-around pb-3">
              <div className="PrimiumCardFooterBg rounded-lg flex w-full justify-around items-center">
                <div className="PrimiumCardFooterBg rounded-lg flex w-full justify-around items-center">
                  <Tooltip
                    content="Like"
                    placement="top"
                    className="bg-black text-white"
                    showArrow
                  >
                    <Button
                      className="bgnone p-0 m-0"
                      radius="full"
                      isIconOnly
                      size="lg"
                    >
                      <IconHeart
                        fill="#FF0000"
                        className="m-3 cursor-pointer"
                      />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Product Details"
                    placement="top"
                    className="bg-black text-white"
                    showArrow
                  >
                    <Button
                      className="bgnone p-0 m-0"
                      radius="full"
                      isIconOnly
                      size="lg"
                      onClick={() => {
                        dispatch(
                          onUpdateProductDetailsModal({
                            isOpen: true,
                            item: item,
                          })
                        );
                      }}
                    >
                      <IconsEye fill="#CFA007" className="m-3 cursor-pointer" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Your Cart"
                    placement="top"
                    className="bg-black text-white"
                    showArrow
                  >
                    <Badge
                      content={data?.data?.qty ? data?.data?.qty : 0}
                      shape="circle"
                      color="danger"
                      onClick={() => {
                        if (userId) {
                          dispatch(onUpdateCartModal({
                            isOpen: true,
                            item: item,
                            qty: data?.data?.qty ? data?.data?.qty : 0,
                            type: "Product",
                          }));
                        } else {
                          toast.error("Please login to add to cart!");
                        }
                      }}
                    >
                      {/* <Button
                      className="bgnone p-0 m-0"
                      radius="full"
                      isIconOnly
                      size="lg"
                      onClick={() => cartOpen()}
                    > */}
                      <IconShopBag
                        fill="#4C86F9"
                        className="cursor-pointer"
                        onClick={() => {
                          if (userId) {
                            dispatch(onUpdateCartModal({
                              isOpen: true,
                              item: item,
                              qty: data?.data?.qty ? data?.data?.qty : 0,
                              type: "Product",
                            }));
                          } else {
                            toast.error("Please login to add to cart!");
                          }
                        }}
                      />
                      {/* </Button> */}
                    </Badge>
                  </Tooltip>

                  <Popover
                    placement="top"
                    showArrow={true}
                    shouldFlip={true}
                    className="p-0 m-0"
                  >
                    <PopoverTrigger>
                      <Button
                        className="bgnone p-0 m-0"
                        radius="full"
                        isIconOnly
                        size="lg"
                      >
                        <IconShoptrolley
                          fill="#49A84C"
                          className="m-3 cursor-pointer"
                        />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="addsub bg-white ">
                      <div className="flex justify-between items-center">
                        <Button
                          className="bgnone p-0 m-0 text-base font-semibold"
                          radius="full"
                          isIconOnly
                          size="md"
                          onClick={() => handleAddCart("remove")}
                        >
                          -
                        </Button>
                        <p className="bgnonetext-sm font-semibold px-2 ">
                          {data?.data?.qty ? data?.data?.qty : 0}
                        </p>
                        <Button
                          className="bgnone p-0 m-0 text-base font-semibold "
                          radius="full"
                          isIconOnly
                          size="md"
                          onClick={() => handleAddCart("add")}
                        >
                          +
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};
export default PremiumCard;
