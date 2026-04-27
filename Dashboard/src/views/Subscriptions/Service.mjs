import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../../utils/baseQuery.mjs";

const axiosBaseQuery = createBaseQuery();
export const SucriptioniApi = createApi({
  reducerPath: "SucriptioniApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    // Admin DetailPage API
    getSubcription: builder.query({
      query: (body) => ({
        url: `/subscription`,
        method: "GET",
      }),
    }),
    getSubcriptionByCustomerID: builder.query({
      query: (body) => ({
        url: `/subscription/${body?.id}?subscriptionType=${body?.subscriptionType}`,
        method: "GET",
      }),
    }),
    addSubcription: builder.mutation({
      query: (body) => ({
        url: `/subscription/create`,
        method: "POST",
        body,
      }),
    }),
    updatesubscription: builder.mutation({
      query: (body) => ({
        url: `/subscription/update`,
        method: "POST",
        body,
      }),
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `/subscription/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddSubcriptionMutation,
  useGetSubcriptionQuery,
  useGetSubcriptionByCustomerIDQuery,
  useUpdatesubscriptionMutation,
  useDeleteSubscriptionMutation,
} = SucriptioniApi;
export const { endpoints } = SucriptioniApi;
