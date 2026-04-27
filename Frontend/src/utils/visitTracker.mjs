import { infoData } from "../configData";

/**
 * Record a visit (site or store). No auth required. Fire-and-forget.
 * @param {{ storeId?: number }} payload - omit or { storeId: null } for site visit; { storeId: id } for store page
 */
export function recordVisit(payload = {}) {
  const url = `${infoData.baseApi}/store/visit`;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload.storeId != null ? { storeId: payload.storeId } : {}),
    credentials: "omit",
  }).catch(() => {});
}
