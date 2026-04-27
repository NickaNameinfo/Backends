import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./utils/baseQuery.mjs";

const axiosBaseQuery = createBaseQuery();

/**
 * Global API Service
 * All endpoints in this service require authentication.
 * Tokens are automatically added via baseQuery -> prepareHeaders.
 * 
 * Token source: XSRF-token or token cookie
 * Token format: Authorization: Bearer <token>
 */
export const GlobalApi = createApi({
  reducerPath: "globalApi",
  baseQuery: axiosBaseQuery, // Uses createBaseQuery() which adds auth headers
  endpoints: (builder) => ({
    /**
     * Get user by ID
     * Requires: Authentication token
     * URL: GET /auth/user/:id
     */
    getUser: builder.query({
      query: (id) => ({
        url: `/auth/user/${id}`,
        method: "GET",
      }),
    }),
    /**
     * Get all users list
     * Requires: Authentication token
     * URL: GET /auth/user/getAllUserList
     */
    getAllUser: builder.query({
      query: (id) => ({
        url: `/auth/user/getAllUserList`,
        method: "GET",
      }),
    }),
    /**
     * Get all orders list
     * Requires: Authentication token
     * URL: GET /order/list
     */
    getAllOrderList: builder.query({
      query: (id) => ({
        url: `/order/list`,
        method: "GET",
      }),
    }),
    /**
     * Get orders by store ID
     * Requires: Authentication token
     * URL: GET /order/store/list/:id
     */
    getAllOrderListByStore: builder.query({
      query: (id) => ({
        url: `/order/store/list/${id}`,
        method: "GET",
      }),
    }),
    /**
     * Update user
     * Requires: Authentication token
     * URL: POST /auth/user/update
     */
    updatUser: builder.mutation({
      query: (body) => ({
        url: `/auth/user/update`,
        method: "POST",
        body
      }),
    }),
    /**
     * Update order status
     * Requires: Authentication token
     * URL: POST /order/status/update
     */
    updatOrder: builder.mutation({
      query: (body) => ({
        url: `/order/status/update`,
        method: "POST",
        body
      }),
    }),
    /**
     * Delete order by id (admin / authorized dashboard user).
     * Backend should expose: DELETE /order/delete/:id
     */
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/order/delete/${id}`,
        method: "DELETE",
      }),
    }),
    /**
     * Shiprocket proxy (credentials live on backend)
     */
    shiprocketServiceability: builder.query({
      query: (params) => ({
        url: `/shiprocket/courier/serviceability`,
        method: "GET",
        params,
      }),
    }),
    shiprocketCreateOrderAdhoc: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/orders/create/adhoc`,
        method: "POST",
        body,
      }),
    }),
    shiprocketCreateOrderFromOrder: builder.mutation({
      query: (arg) => {
        const orderId = typeof arg === "object" ? arg?.orderId : arg;
        const force = typeof arg === "object" ? arg?.force : false;
        const reorder = typeof arg === "object" ? arg?.reorder : false;
        const qs = new URLSearchParams();
        if (force) qs.set("force", "1");
        if (reorder) qs.set("reorder", "1");
        return {
          url: `/shiprocket/orders/create/from-order/${orderId}${qs.toString() ? `?${qs.toString()}` : ""}`,
        method: "POST",
        };
      },
    }),
    shiprocketAssignAwb: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/courier/assign/awb`,
        method: "POST",
        body,
      }),
    }),
    shiprocketGeneratePickup: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/courier/generate/pickup`,
        method: "POST",
        body,
      }),
    }),
    shiprocketGenerateManifest: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/manifests/generate`,
        method: "POST",
        body,
      }),
    }),
    shiprocketPrintManifest: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/manifests/print`,
        method: "POST",
        body,
      }),
    }),
    shiprocketGenerateLabel: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/courier/generate/label`,
        method: "POST",
        body,
      }),
    }),
    shiprocketPrintInvoice: builder.mutation({
      query: (body) => ({
        url: `/shiprocket/orders/print/invoice`,
        method: "POST",
        body,
      }),
    }),
    shiprocketTrackAwb: builder.query({
      query: (awb) => ({
        url: `/shiprocket/courier/track/awb/${awb}`,
        method: "GET",
      }),
    }),
    /**
     * Upload file
     * Requires: Authentication token
     * URL: POST /auth/upload-file
     */
    uploadFile: builder.mutation({
      query: (body) => ({
        url: `/auth/upload-file`,
        method: "POST",
        body
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdatUserMutation,
  useGetAllUserQuery,
  useGetAllOrderListQuery,
  useGetAllOrderListByStoreQuery,
  useUpdatOrderMutation,
  useDeleteOrderMutation,
  useShiprocketServiceabilityQuery,
  useShiprocketCreateOrderAdhocMutation,
  useShiprocketCreateOrderFromOrderMutation,
  useShiprocketAssignAwbMutation,
  useShiprocketGeneratePickupMutation,
  useShiprocketGenerateManifestMutation,
  useShiprocketPrintManifestMutation,
  useShiprocketGenerateLabelMutation,
  useShiprocketPrintInvoiceMutation,
  useShiprocketTrackAwbQuery,
  useUploadFileMutation,
} = GlobalApi;
export const { endpoints } = GlobalApi;
