import React from "react";
import StoreHeaderCard from "../../../../Components/Card/StoreHeaderCard";
import PremiumCard from "../../../../Components/Card/PremiumCard";
import RelatedProducts from "../../../../Components/Card/RelatedProducts";
import { useParams } from "react-router-dom";
import { useLazyGetStoresProductByIDQuery } from "../Service.mjs";
import { useAppSelector } from "../../../../Components/Common/hooks";
import { recordVisit } from "../../../../utils/visitTracker.mjs";
import { NoProductsFound } from "../../NoItems/NoProductsFound";
import { ProductDetail } from "../../../../Components/DetailsModales/ProductDetail";
import { BuyCard } from "../../../../Components/Card/BuyCard";
import { Input, Select, SelectItem, Slider } from "@nextui-org/react";
import { SearchIcon } from "../../../../Components/Icons";
import "../../../../Components/style.scss";

const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "name_asc", label: "Name (A–Z)" },
  { key: "name_desc", label: "Name (Z–A)" },
  { key: "price_asc", label: "Price (Low to High)" },
  { key: "price_desc", label: "Price (High to Low)" },
];

const getProductName = (result: any) =>
  result?.product?.name ?? result?.product?.productName ?? "";

const getProductPrice = (result: any) => {
  const p = result?.product;
  let price = Number(result?.price ?? p?.price ?? p?.total ?? 0) || 0;
  if (price > 0) return price;
  const map = p?.sizeUnitSizeMap;
  if (map) {
    try {
      const parsed = typeof map === "string" ? JSON.parse(map) : map;
      const prices = Object.values(parsed as Record<string, { price?: string; total?: string; grandTotal?: string }>)
        .map((s: any) => Number(s?.price ?? s?.total ?? s?.grandTotal ?? 0))
        .filter((n) => n > 0);
      if (prices.length) return Math.min(...prices);
    } catch (_) { }
  }
  return 0;
};

const StoreDetails = () => {
  const { id } = useParams();
  const [triggerProducts] = useLazyGetStoresProductByIDQuery();
  const [rawList, setRawList] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (id) recordVisit({ storeId: Number(id) });
  }, [id]);

  const loadPage = React.useCallback(async (nextPage: number) => {
    if (!id) return;
    const limit = 20;
    setLoadingMore(true);
    try {
      const resp = await triggerProducts({ id: Number(id), page: nextPage, limit }).unwrap();
      const batch = resp?.data ?? [];
      const total = Number(resp?.count ?? 0) || 0;
      setRawList((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
      setHasMore(batch.length > 0 && nextPage * limit < total);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [id, triggerProducts]);

  React.useEffect(() => {
    setRawList([]);
    setPage(1);
    setHasMore(true);
    if (id) loadPage(1);
  }, [id, loadPage]);

  React.useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loadingMore) {
          loadPage(page + 1);
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadPage, page]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<string>("default");
  const [filterEcommerce, setFilterEcommerce] = React.useState<string>("all");
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 10000]);

  const isProductDetailsModalOpen = useAppSelector(
    (state) => state.globalConfig.isProductDetailsModalOpen
  );

  const isOpenCartModal = useAppSelector(
    (state) => state.globalConfig.isOpenCartModal
  );

  const priceBounds = React.useMemo(() => {
    const list = rawList ?? [];
    if (list.length === 0) return { min: 0, max: 10000 };
    let min = Infinity;
    let max = -Infinity;
    list.forEach((result) => {
      const p = getProductPrice(result);
      if (p < min) min = p;
      if (p > max) max = p;
    });
    if (min === Infinity) min = 0;
    if (max === -Infinity || max <= min) max = Math.max(min + 100, 10000);
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [rawList]);

  React.useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  const filteredAndSortedProducts = React.useMemo(() => {
    const list = rawList ?? [];
    let filtered = list;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((result) =>
        getProductName(result).toLowerCase().includes(q)
      );
    }

    if (filterEcommerce === "ecommerce") {
      filtered = filtered.filter(
        (result) => Number(result?.product?.isEnableEcommerce) === 1
      );
    }

    const [minP, maxP] = priceRange;
    filtered = filtered.filter((result) => {
      const p = getProductPrice(result);
      return p >= minP && p <= maxP;
    });

    if (sortBy !== "default") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return getProductName(a).localeCompare(getProductName(b));
          case "name_desc":
            return getProductName(b).localeCompare(getProductName(a));
          case "price_asc":
            return getProductPrice(a) - getProductPrice(b);
          case "price_desc":
            return getProductPrice(b) - getProductPrice(a);
          default:
            return 0;
        }
      });
    } else {
      // Default: online-first + random (stable for this page session)
      const seed = (Number(id) || 0) ^ (Date.now() & 0x7fffffff);
      const isOnline = (r: any) => String(r?.product?.paymentMode ?? r?.paymentMode ?? "").includes("2");
      const idOf = (r: any) => Number(r?.product?.id ?? r?.id ?? 0) || 0;
      const randKey = (r: any) => ((idOf(r) * 1103515245 + seed) & 0x7fffffff) >>> 0;
      filtered = [...filtered].sort((a, b) => {
        const ao = isOnline(a) ? 1 : 0;
        const bo = isOnline(b) ? 1 : 0;
        if (ao !== bo) return bo - ao;
        return randKey(a) - randKey(b);
      });
    }

    return filtered;
  }, [rawList, searchQuery, sortBy, filterEcommerce, priceRange]);

  const hasProducts = rawList?.length > 0;
  const hasFilteredResults = filteredAndSortedProducts.length > 0;

  const step = priceBounds.max - priceBounds.min > 1000 ? 50 : priceBounds.max - priceBounds.min > 100 ? 10 : 1;

  return (
    <div>
      <StoreHeaderCard />
      {hasProducts ? (
        <>
          <div className="StorecardHeader rounded-2xl p-4 mb-4 mt-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <Input
                  isClearable
                  // classNames={{ inputWrapper: "rounded-xl shadow-sm" }}
                  className="w-full sm:max-w-[280px] min-h-[50px]"
                  placeholder="Search products by name..."
                  startContent={<SearchIcon className="text-default-400" />}
                  value={searchQuery}
                  onClear={() => setSearchQuery("")}
                  onValueChange={setSearchQuery}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    label: "bg-[#ffffff3b] text-black/90 dark:text-black/90",
                    input: [
                      "bg-[#ffffff3b] min-h-[50px]",
                      "text-black/90 dark:text-black/100",
                      "placeholder:text-black-100/30 dark:placeholder:text-black/10",
                      "font-normal",
                      "group-data-[has-value=true]:text-black/90",
                    ],
                    innerWrapper: "text-black/90 dark:text-black/70",
                    inputWrapper: [
                      "bg-[#ffffff3b] min-h-[50px]",
                      "dark:bg-[#ffffff3b] min-h-[50px]",
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
                />
                <Select
                  label="Sort by"
                  placeholder="Sort"
                  selectedKeys={sortBy ? [sortBy] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string;
                    setSortBy(v ?? "default");
                  }}
                  size="sm"
                  className="max-w-[200px] min-h-[50px] border-none text-black"
                  variant="flat"
                  classNames={{
                    label: "bg-[#ffffff8a] text-black dark:text-black/90",
                    value: "text-black dark:text-black",
                    trigger: [
                      "bg-[#ffffff8a] min-h-[50px]",
                      "text-black dark:text-black/100",
                      "placeholder:text-black/90 dark:placeholder:text-black/90",
                      "font-normal",
                      "group-data-[has-value=true]:text-black",
                    ],
                    innerWrapper: "text-black/90 dark:text-black/70",
                    popoverContent: "bg-white dark:bg-white",
                    listbox: "[&_li[data-hover=true]]:bg-white [&_li[data-hover=true]]:text-black [&_li[data-selected=true]]:text-black",
                    listboxWrapper: [
                      "bg-white",
                      "dark:bg-white",
                      "backdrop-blur-xl",
                      "backdrop-saturate-50",
                      "shadow-none",
                      "border-0",
                    ],
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Show"
                  placeholder="Filter"
                  selectedKeys={filterEcommerce ? [filterEcommerce] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string;
                    setFilterEcommerce(v ?? "all");
                  }}
                  size="sm"
                  className="max-w-[180px] min-h-[50px] border-none text-black"
                  variant="flat"
                  classNames={{
                    label: "bg-[#ffffff8a] text-black/90 dark:text-black/90",
                    value: "text-black dark:text-black",
                    trigger: [
                      "bg-[#ffffff8a] min-h-[50px]",
                      "text-black dark:text-black/100",
                      "placeholder:text-black/90 dark:placeholder:text-black/10",
                      "font-normal",
                      "group-data-[has-value=true]:text-black",
                    ],
                    innerWrapper: "text-black/90 dark:text-black/70",
                    popoverContent: "bg-white dark:bg-white",
                    listbox: "[&_li[data-hover=true]]:bg-white [&_li[data-hover=true]]:text-black [&_li[data-selected=true]]:text-black",
                    listboxWrapper: [
                      "bg-white",
                      "dark:bg-white",
                      "backdrop-blur-xl",
                      "backdrop-saturate-50",
                      "shadow-none",
                      "border-0",
                    ],
                  }}
                >
                  <SelectItem key="all">All products</SelectItem>
                  <SelectItem key="ecommerce">E-commerce only</SelectItem>
                </Select>
                <div className="w-[320px] bg-[#ffffff8a] px-3 pb-1 rounded-2xl">
                  <span className="textColortimingColor text-sm font-medium whitespace-nowrap">Price range:</span>
                  <Slider
                    size="sm"
                    step={step}
                    minValue={priceBounds.min}
                    maxValue={priceBounds.max}
                    value={priceRange}
                    onChange={(value) => setPriceRange(value as [number, number])}
                    className="max-w-full"
                    getValue={(v) => {
                      const arr = Array.isArray(v) ? v : [v];
                      return `₹${Number(arr[0]).toLocaleString()} – ₹${Number(arr[1] ?? arr[0]).toLocaleString()}`;
                    }}
                    showTooltip={true}
                    tooltipValueFormatOptions={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }}
                    classNames={{ base: "gap-2", track: "rounded-full", thumb: "bg-primary", }}
                  />
                </div>
              </div>

            </div>
          </div>
          {hasFilteredResults ? (
            <div className="grid xm:grid-cols-1 mm:grid-cols-1 ml:grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-3  xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 gap-2">
              {filteredAndSortedProducts.map((result, index) =>
                Number(result?.product?.isEnableEcommerce) === 1 ? (
                  <PremiumCard item={result} key={result?.product?.id ?? index} />
                ) : (
                  <RelatedProducts item={result} key={result?.product?.id ?? index} />
                )
              )}
            </div>
          ) : (
            <NoProductsFound />
          )}
          <div ref={sentinelRef} className="h-10 w-full" />
          {loadingMore ? (
            <div className="w-full flex items-center justify-center py-4 text-sm text-gray-600">
              Loading more...
            </div>
          ) : null}
        </>
      ) : (
        <NoProductsFound />
      )}
      {isProductDetailsModalOpen?.isOpen && (
        <ProductDetail
          isOpen={isProductDetailsModalOpen?.isOpen}
          item={isProductDetailsModalOpen?.item}
        />
      )}

      {isOpenCartModal && <BuyCard isOpen={isOpenCartModal} />}
    </div>
  );
};

export default StoreDetails;
