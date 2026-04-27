import React from "react";
import StoreCard from "../../../Components/Card/StoreCard";
import {
  useGetStoresByOpenStoreQuery,
  useLazyGetStoresQuery,
  useLazyGetStoresByCategoryQuery,
  useLazyGetStoresByFiltersQuery,
  useLazyGetStoresByPaymentTypeQuery,
} from "./Service.mjs";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../Components/Common/hooks";
import {
  onResetModals,
  onUpdateCartModal,
  onUpdateProductDetailsModal,
  onUpdateStoreList,
} from "../../../Components/Common/globalSlice";

const Store = () => {
  const dispatch = useAppDispatch();
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

  const {
    data: storesByOpenStore,
    error: storesByOpenStoreError,
    refetch: storesByOpenStoreRefetch,
  } = useGetStoresByOpenStoreQuery({ refetchOnMountOrArgChange: true });

  const [triggerAll] = useLazyGetStoresQuery();
  const [triggerCategory] = useLazyGetStoresByCategoryQuery();
  const [triggerSearch] = useLazyGetStoresByFiltersQuery();
  const [triggerPayment] = useLazyGetStoresByPaymentTypeQuery();

  const [items, setItems] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    dispatch(onResetModals());
  }, []);

  React.useEffect(() => {
    dispatch(onUpdateStoreList(items));
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
      } else if (mode === "category") {
        resp = await triggerCategory({ id: globalCategorySearch, page: nextPage, limit }).unwrap();
      } else if (mode === "payment") {
        resp = await triggerPayment({ query: gloablSearchByPayment, page: nextPage, limit }).unwrap();
      } else {
        resp = await triggerAll({ page: nextPage, limit }).unwrap();
      }

      const batch = resp?.data ?? [];
      const total = Number(resp?.count ?? 0) || 0;
      setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
      setHasMore(batch.length > 0 && nextPage * limit < total);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [mode, triggerAll, triggerCategory, triggerSearch, triggerPayment, globalSearch, globalCategorySearch, gloablSearchByPayment, storesByOpenStore]);

  React.useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad, mode]);

  React.useEffect(() => {
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
      <div className="grid mm:grid-cols-2 ml:grid-cols-2 sm:grid-cols-4  md:grid-cols-4  lg:grid-cols-4  xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 gap-2 mt-2">
        {items?.map((item, index) => {
          return item?.status === 1 && <StoreCard item={item} key={index} />;
        })}
      </div>
      <div ref={sentinelRef} className="h-10 w-full" />
      {loadingMore ? (
        <div className="w-full flex items-center justify-center py-4 text-sm text-gray-600">
          Loading more...
        </div>
      ) : null}
    </>
  );
};

export default Store;
