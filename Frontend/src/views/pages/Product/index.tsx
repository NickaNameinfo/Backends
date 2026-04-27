import React from "react";
import ProductViewCard from "../../../Components/Card/ProductView";
import {
  useGetProductsByOpenShopQuery,
  useLazyGetProductsQuery,
  useLazyGetProductsByCategoryQuery,
  useLazyGetProductsBySearchQuery,
  useLazyGetProductsByPaymenTypeQuery,
} from "./Service.mjs";
import { useAppSelector } from "../../../Components/Common/hooks";
import { ProductDetail } from "../../../Components/DetailsModales/ProductDetail";
import { BuyCard } from "../../../Components/Card/BuyCard";

const Product = () => {
  const globalSearch = useAppSelector(
    (state) => state.globalConfig.globalSearch
  );
  const globalCategorySearch = useAppSelector(
    (state) => state.globalConfig.globalCategorySearch
  );

  const gloablSearchByPayment = useAppSelector(
    (state) => state.globalConfig.gloablSearchByPayment
  );

  const onSearchOpenStore = useAppSelector(
    (state) => state.globalConfig.onSearchOpenStore
  );

  const isProductDetailsModalOpen = useAppSelector(
    (state) => state.globalConfig.isProductDetailsModalOpen
  );

  const isOpenCartModal = useAppSelector(
    (state) => state.globalConfig.isOpenCartModal
  );

  const { data: storesByOpenStore } = useGetProductsByOpenShopQuery({ refetchOnMountOrArgChange: true });

  const [triggerAll, allQuery] = useLazyGetProductsQuery();
  const [triggerCategory, categoryQuery] = useLazyGetProductsByCategoryQuery();
  const [triggerSearch, searchQuery] = useLazyGetProductsBySearchQuery();
  const [triggerPayment, paymentQuery] = useLazyGetProductsByPaymenTypeQuery();

  const [items, setItems] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const shuffleSeedRef = React.useRef<number>(Date.now() & 0x7fffffff);

  const onlineFirstRandom = React.useMemo(() => {
    const seed = shuffleSeedRef.current;
    const isOnline = (p: any) => String(p?.paymentMode ?? "").includes("2");
    const idOf = (p: any) => Number(p?.id ?? 0) || 0;
    const randKey = (p: any) => ((idOf(p) * 1103515245 + seed) & 0x7fffffff) >>> 0;
    return [...(items ?? [])].sort((a, b) => {
      const ao = isOnline(a) ? 1 : 0;
      const bo = isOnline(b) ? 1 : 0;
      if (ao !== bo) return bo - ao;
      return randKey(a) - randKey(b);
    });
  }, [items]);

  const mode = React.useMemo(() => {
    if (onSearchOpenStore) return "open";
    if (globalSearch) return "search";
    if (globalCategorySearch) return "category";
    if (gloablSearchByPayment) return "payment";
    return "all";
  }, [onSearchOpenStore, globalSearch, globalCategorySearch, gloablSearchByPayment]);

  const resetAndLoad = React.useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, []);

  const loadPage = React.useCallback(async (nextPage: number) => {
    const limit = 20;
    if (mode === "open") {
      // existing endpoint is non-paginated; keep as-is
      const list = storesByOpenStore?.data ?? [];
      setItems(list);
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    try {
      let resp: any;
      if (mode === "search") {
        resp = await triggerSearch({ query: globalSearch, page: nextPage, limit }).unwrap();
        const batch = resp?.data ?? [];
        setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
        const total = Number(resp?.count ?? 0) || 0;
        setHasMore(batch.length > 0 && nextPage * limit < total);
      } else if (mode === "category") {
        resp = await triggerCategory({ id: globalCategorySearch, page: nextPage, limit }).unwrap();
        const batch = resp?.data ?? [];
        setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
        const total = Number(resp?.count ?? 0) || 0;
        setHasMore(batch.length > 0 && nextPage * limit < total);
      } else if (mode === "payment") {
        resp = await triggerPayment({ query: gloablSearchByPayment, page: nextPage, limit }).unwrap();
        const batch = resp?.data ?? [];
        setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
        const total = Number(resp?.count ?? 0) || 0;
        setHasMore(batch.length > 0 && nextPage * limit < total);
      } else {
        resp = await triggerAll({ page: nextPage, limit }).unwrap();
        const batch = resp?.data ?? [];
        setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
        const total = Number(resp?.count ?? 0) || 0;
        setHasMore(batch.length > 0 && nextPage * limit < total);
      }
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [mode, triggerAll, triggerCategory, triggerSearch, triggerPayment, globalSearch, globalCategorySearch, gloablSearchByPayment, storesByOpenStore]);

  React.useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad, mode]);

  React.useEffect(() => {
    // load first page
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  return (
    <>
      <div className="grid  mm:grid-cols-2 ml:grid-cols-2 sm:grid-cols-4  md:grid-cols-4  lg:grid-cols-5  xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-5 gap-2 mt-1">
        {onlineFirstRandom?.length > 0
          ? onlineFirstRandom?.map((item, index) => {
              return item?.createdType === "Store" ? (
                <ProductViewCard key={item?.id || index} item={item} />
              ) : null;
            })
          : null}
      </div>
      <div ref={sentinelRef} className="h-10 w-full" />
      {loadingMore ? (
        <div className="w-full flex items-center justify-center py-4 text-sm text-gray-600">
          Loading more...
        </div>
      ) : null}
      {isProductDetailsModalOpen?.isOpen && (
        <ProductDetail
          isOpen={isProductDetailsModalOpen?.isOpen}
          item={isProductDetailsModalOpen?.item}
        />
      )}

      {isOpenCartModal && <BuyCard isOpen={isOpenCartModal} />}
    </>
  );
};

export default Product;
