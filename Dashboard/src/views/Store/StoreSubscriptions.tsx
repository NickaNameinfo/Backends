import React from "react";
import { useGetStoreQuery } from "./Service.mjs";
import {
  useDeleteSubscriptionMutation,
  useUpdatesubscriptionMutation,
} from "../Subscriptions/Service.mjs";
import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

function formatDate(value: unknown) {
  if (value == null || value === "") return "—";
  try {
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameLocalDay(a: unknown, b: Date) {
  if (a == null) return false;
  const da = new Date(String(a));
  if (Number.isNaN(da.getTime())) return false;
  return startOfLocalDay(da).getTime() === startOfLocalDay(b).getTime();
}

/** Uses `expiresAt` from DB when present; otherwise infers from plan/yearly/monthly. */
function resolveExpiry(sub: any): Date | null {
  if (sub?.expiresAt) {
    const d = new Date(sub.expiresAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const c = sub?.createdAt ? new Date(sub.createdAt) : null;
  if (!c || Number.isNaN(c.getTime())) return null;
  const p = String(sub.subscriptionPlan ?? "");
  const t = String(sub.subscriptionType ?? "");
  const blob = `${p} ${t}`.toLowerCase();
  const d = new Date(c.getTime());
  if (/yearly|year\b|pl1_|pl1-|^pl1|standard|premium|starter/i.test(blob)) {
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  if (/monthly|month\b/i.test(blob)) {
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function formatMoney(n: number) {
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
  } catch {
    return String(n);
  }
}

function toDateTimeLocalValue(value: unknown): string {
  if (value == null || value === "") return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type SubEditForm = {
  subscriptionPlan: string;
  subscriptionType: string;
  subscriptionPrice: string;
  status: string;
  subscriptionCount: string;
  freeCount: string;
  paymentId: string;
  expiresAt: string;
};

function subToEditForm(sub: any): SubEditForm {
  return {
    subscriptionPlan: String(sub?.subscriptionPlan ?? ""),
    subscriptionType: String(sub?.subscriptionType ?? ""),
    subscriptionPrice:
      sub?.subscriptionPrice != null && sub?.subscriptionPrice !== ""
        ? String(sub.subscriptionPrice)
        : "",
    status: String(sub?.status ?? "active"),
    subscriptionCount:
      sub?.subscriptionCount != null && sub?.subscriptionCount !== ""
        ? String(sub.subscriptionCount)
        : "1",
    freeCount:
      sub?.freeCount != null && sub?.freeCount !== "" ? String(sub.freeCount) : "",
    paymentId: sub?.paymentId != null ? String(sub.paymentId) : "",
    expiresAt: sub?.expiresAt ? toDateTimeLocalValue(sub.expiresAt) : "",
  };
}

type StoreRow = {
  id: number | string;
  storename?: string;
  email?: string;
  isTrashed?: boolean;
  subscriptions?: any[];
  subscription?: any;
};

function getSubs(store: StoreRow): any[] {
  if (Array.isArray(store.subscriptions)) return store.subscriptions;
  if (store.subscription) return [store.subscription];
  return [];
}

type FilterStatus = "all" | "active" | "inactive";
type FilterExpiry = "all" | "expiring7" | "expired";

const StoreSubscriptions = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetStoreQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateSubscription, { isLoading: isUpdating }] = useUpdatesubscriptionMutation();
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();

  const [editSub, setEditSub] = React.useState<any | null>(null);
  const [editForm, setEditForm] = React.useState<SubEditForm | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>("all");
  const [expiryFilter, setExpiryFilter] = React.useState<FilterExpiry>("all");

  const stores = React.useMemo(() => {
    return (data?.["data"] || []).filter((s: StoreRow) => !Boolean(s?.isTrashed));
  }, [data]);

  const enriched = React.useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return stores.map((store: StoreRow) => {
      const subs = getSubs(store);
      const planKeys = [
        ...new Set(
          subs.map((s) => String(s.subscriptionPlan ?? "").trim()).filter(Boolean)
        ),
      ];
      const typeKeys = [
        ...new Set(
          subs.map((s) => String(s.subscriptionType ?? "").trim()).filter(Boolean)
        ),
      ];
      const linePrice = (s: any) => {
        const n = Number(s?.subscriptionPrice);
        return Number.isFinite(n) ? n : 0;
      };
      const totalPayment = subs.reduce((sum, s) => sum + linePrice(s), 0);
      const todayTotal = subs.reduce((sum, s) => {
        if (isSameLocalDay(s.createdAt, now)) {
          return sum + linePrice(s);
        }
        return sum;
      }, 0);

      const withExp = subs
        .map((s) => ({ sub: s, exp: resolveExpiry(s) }))
        .filter((x) => x.exp != null) as { sub: any; exp: Date }[];

      let nearestFuture: Date | null = null;
      let nearestPast: Date | null = null;
      for (const { exp } of withExp) {
        if (exp > now) {
          if (!nearestFuture || exp < nearestFuture) nearestFuture = exp;
        } else {
          if (!nearestPast || exp > nearestPast) nearestPast = exp;
        }
      }

      const displayExpiry: Date | null = nearestFuture ?? nearestPast ?? null;
      const isExpired = displayExpiry ? displayExpiry < now : false;

      const hasActive = subs.some(
        (s) => String(s.status ?? "").toLowerCase() === "active"
      );

      let expiringIn7 = false;
      for (const { exp } of withExp) {
        if (exp > now && exp <= in7) {
          expiringIn7 = true;
          break;
        }
      }

      return {
        store,
        subs,
        planKeys,
        typeKeys,
        totalPayment,
        todayTotal,
        displayExpiry,
        isExpired,
        hasActive,
        expiringIn7,
      };
    });
  }, [stores]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((row) => {
      const { store, subs, hasActive, expiringIn7, displayExpiry, isExpired } = row;
      if (q) {
        const name = String(store.storename ?? "").toLowerCase();
        const email = String(store.email ?? "").toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      if (statusFilter === "active" && !hasActive) return false;
      if (statusFilter === "inactive" && hasActive) return false;
      if (expiryFilter === "expiring7" && !expiringIn7) return false;
      if (expiryFilter === "expired") {
        if (!displayExpiry || !isExpired) return false;
      }
      return true;
    });
  }, [enriched, search, statusFilter, expiryFilter]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) =>
      String(a.store.storename ?? "").localeCompare(
        String(b.store.storename ?? ""),
        undefined,
        { sensitivity: "base" }
      )
    );
  }, [filtered]);

  const openEditSub = (sub: any) => {
    setEditSub(sub);
    setEditForm(subToEditForm(sub));
  };

  const closeEditSub = () => {
    setEditSub(null);
    setEditForm(null);
  };

  const saveEditSub = async () => {
    if (!editSub?.id || !editForm) return;
    const price = Number(editForm.subscriptionPrice);
    const count = Number(editForm.subscriptionCount);
    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }
    if (!Number.isFinite(count) || count < 1) {
      alert("Please enter a valid subscription count (at least 1).");
      return;
    }
    try {
      await updateSubscription({
        id: editSub.id,
        subscriptionPlan: editForm.subscriptionPlan,
        subscriptionType: editForm.subscriptionType,
        subscriptionPrice: price,
        status: editForm.status,
        subscriptionCount: count,
        freeCount:
          editForm.freeCount.trim() === "" ? null : Number(editForm.freeCount),
        paymentId: editForm.paymentId.trim() === "" ? null : editForm.paymentId.trim(),
        expiresAt: editForm.expiresAt.trim() === "" ? null : new Date(editForm.expiresAt).toISOString(),
      }).unwrap();
      await refetch();
      closeEditSub();
    } catch {
      alert("Could not update subscription.");
    }
  };

  const removeSub = async (sub: any) => {
    if (sub?.id == null) return;
    if (!window.confirm(`Delete subscription #${sub.id}? This cannot be undone.`)) return;
    try {
      await deleteSubscription(sub.id).unwrap();
      await refetch();
    } catch {
      alert("Could not delete subscription.");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-2 flex justify-center py-16">
        <Spinner size="lg" color="primary" label="Loading stores..." />
      </div>
    );
  }

  return (
    <div className="mx-2 pb-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Store subscriptions</h1>
        <p className="text-sm text-default-500">
          Grouped by store. Filters apply to the list below. Expiry uses saved{" "}
          <code className="text-xs">expiresAt</code> when set; otherwise it is estimated from plan
          / start date.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <Input
          label="Search store"
          placeholder="Name or email..."
          value={search}
          onValueChange={setSearch}
          className="max-w-md"
          size="sm"
        />
        <Select
          label="Subscription status"
          selectedKeys={new Set([statusFilter])}
          onSelectionChange={(keys) => {
            const v = Array.from(keys)[0] as FilterStatus;
            setStatusFilter(v ?? "all");
          }}
          className="max-w-[200px]"
          size="sm"
        >
          <SelectItem key="all">All stores</SelectItem>
          <SelectItem key="active">Has active sub</SelectItem>
          <SelectItem key="inactive">No active sub</SelectItem>
        </Select>
        <Select
          label="Expiry"
          selectedKeys={new Set([expiryFilter])}
          onSelectionChange={(keys) => {
            const v = Array.from(keys)[0] as FilterExpiry;
            setExpiryFilter(v ?? "all");
          }}
          className="max-w-[220px]"
          size="sm"
        >
          <SelectItem key="all">All</SelectItem>
          <SelectItem key="expiring7">Expiring within 7 days</SelectItem>
          <SelectItem key="expired">Expired</SelectItem>
        </Select>
      </div>

      {!data?.["data"]?.length ? (
        <p className="text-default-500 text-sm">No stores to show.</p>
      ) : sorted.length === 0 ? (
        <p className="text-default-500 text-sm">No stores match the filters.</p>
      ) : (
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          defaultSelectedKeys={new Set()}
          className="px-0"
        >
          {sorted.map(
            ({
              store,
              subs,
              planKeys,
              typeKeys,
              totalPayment,
              todayTotal,
              displayExpiry,
              isExpired,
            }) => (
              <AccordionItem
                key={String(store.id)}
                aria-label={String(store.storename)}
                title={
                  <div className="flex flex-col gap-2 py-1 max-w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <User
                        avatarProps={{ radius: "lg", src: (store as any).avatar }}
                        description={store.email}
                        name={store.storename ?? "—"}
                        classNames={{ name: "font-semibold text-foreground" }}
                      />
                      <Chip size="sm" variant="flat" color="default">
                        ID: {store.id}
                      </Chip>
                      <Chip size="sm" variant="flat" color="secondary">
                        {subs.length} subscription{subs.length === 1 ? "" : "s"}
                      </Chip>
                    </div>
                    {(planKeys.length > 0 || typeKeys.length > 0) && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-default-500 shrink-0">Plans:</span>
                        {planKeys.map((p) => (
                          <Chip key={`p-${p}`} size="sm" variant="bordered" color="primary">
                            {p}
                          </Chip>
                        ))}
                        {typeKeys.map((t) => (
                          <Chip key={`t-${t}`} size="sm" variant="flat" color="default">
                            {t}
                          </Chip>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm items-baseline">
                      <span>
                        Total payment:{" "}
                        <strong className="text-foreground">{formatMoney(totalPayment)}</strong>
                        <span className="text-default-400 text-xs ml-1">(sum of prices)</span>
                      </span>
                      <span>
                        Today&apos;s payment:{" "}
                        <strong className="text-foreground">{formatMoney(todayTotal)}</strong>
                        <span className="text-default-400 text-xs ml-1">(by sub. created date)</span>
                      </span>
                      {displayExpiry && (
                        <span>
                          Expiry:{" "}
                          <span
                            className={
                              isExpired
                                ? "text-red-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {formatDateShort(displayExpiry)}
                            {isExpired ? " (expired)" : ""}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                }
              >
                <div className="flex justify-end mb-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => navigate(`/Stores/Edit/${store.id}`)}
                  >
                    Edit store
                  </Button>
                </div>
                {subs.length === 0 ? (
                  <p className="text-sm text-default-500 py-2">
                    No subscription records linked to this store.
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-2 px-2">
                    <Table
                      aria-label={`Subscriptions for ${store.storename}`}
                      removeWrapper
                      classNames={{ th: "text-xs uppercase text-default-500" }}
                    >
                      <TableHeader>
                        <TableColumn>Sub. ID</TableColumn>
                        <TableColumn>Plan</TableColumn>
                        <TableColumn>Type</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Price</TableColumn>
                        <TableColumn>Count</TableColumn>
                        <TableColumn>Free</TableColumn>
                        <TableColumn>Payment ID</TableColumn>
                        <TableColumn>Created</TableColumn>
                        <TableColumn>Expiry</TableColumn>
                        <TableColumn className="text-end">Actions</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {subs.map((sub) => {
                          const exp = resolveExpiry(sub);
                          return (
                            <TableRow key={sub.id}>
                              <TableCell>{String(sub.id ?? "—")}</TableCell>
                              <TableCell>{sub.subscriptionPlan ?? "—"}</TableCell>
                              <TableCell>{sub.subscriptionType ?? "—"}</TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat" color="primary" className="capitalize">
                                  {String(sub.status ?? "—")}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                {sub.subscriptionPrice != null
                                  ? String(sub.subscriptionPrice)
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {sub.subscriptionCount != null
                                  ? String(sub.subscriptionCount)
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {sub.freeCount != null ? String(sub.freeCount) : "—"}
                              </TableCell>
                              <TableCell className="max-w-[140px] truncate font-mono text-xs">
                                {sub.paymentId != null ? String(sub.paymentId) : "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs">
                                {formatDate(sub.createdAt)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs">
                                {exp ? (
                                  <span className="text-red-600 font-medium">
                                    {formatDateShort(exp)}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    isDisabled={isDeleting || isUpdating}
                                    onPress={() => openEditSub(sub)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isDisabled={isDeleting || isUpdating}
                                    onPress={() => removeSub(sub)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AccordionItem>
            )
          )}
        </Accordion>
      )}

      <Modal
        isOpen={Boolean(editSub && editForm)}
        onOpenChange={(open) => {
          if (!open) closeEditSub();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Edit subscription
            {editSub?.id != null && (
              <span className="text-sm font-normal text-default-500">ID: {editSub.id}</span>
            )}
          </ModalHeader>
          <ModalBody className="gap-3">
            {editForm && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Plan"
                    size="sm"
                    value={editForm.subscriptionPlan}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, subscriptionPlan: v } : f))
                    }
                  />
                  <Input
                    label="Type"
                    size="sm"
                    value={editForm.subscriptionType}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, subscriptionType: v } : f))
                    }
                  />
                  <Input
                    label="Price"
                    size="sm"
                    type="number"
                    value={editForm.subscriptionPrice}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, subscriptionPrice: v } : f))
                    }
                  />
                  <Input
                    label="Status"
                    size="sm"
                    value={editForm.status}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, status: v } : f))
                    }
                    description="e.g. active, inactive, or your numeric code"
                  />
                  <Input
                    label="Count"
                    size="sm"
                    type="number"
                    value={editForm.subscriptionCount}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, subscriptionCount: v } : f))
                    }
                  />
                  <Input
                    label="Free"
                    size="sm"
                    type="number"
                    value={editForm.freeCount}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, freeCount: v } : f))
                    }
                  />
                  <Input
                    label="Payment ID"
                    size="sm"
                    value={editForm.paymentId}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, paymentId: v } : f))
                    }
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Expires at"
                    size="sm"
                    type="datetime-local"
                    value={editForm.expiresAt}
                    onValueChange={(v) =>
                      setEditForm((f) => (f ? { ...f, expiresAt: v } : f))
                    }
                    className="sm:col-span-2"
                  />
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeEditSub} isDisabled={isUpdating}>
              Cancel
            </Button>
            <Button color="primary" onPress={saveEditSub} isLoading={isUpdating}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StoreSubscriptions;
