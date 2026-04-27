import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { infoData } from "../../../configData";
import { prepareHeaders } from "../../../utils/authHelper.mjs";

const axiosBaseQuery = fetchBaseQuery({
  baseUrl: infoData.baseApi, // Set your base URL
  prepareHeaders: (headers, { getState }) => {
    return prepareHeaders(headers, { getState });
  },
});

export const ProductApi = createApi({
  reducerPath: "ProductApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/product/getAllproductList`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    getProductImg: builder.query({
      query: (body) => ({
        url: `/product/getAllPhoto`,
        method: "GET",
      }),
    }),
    getProductsById: builder.query({
      query: (id) => ({
        url: `/product/getWebProductById/${id}`,
        method: "GET",
      }),
    }),
    getProductsByCategory: builder.query({
      query: ({ id, page = 1, limit = 20 } = {}) => ({
        url: `/product/getAllByCategory`,
        method: "GET",
        params: { categoryIds: id, page, limit },
      }),
    }),
    getProductsBySearch: builder.query({
      query: ({ query, page = 1, limit = 20 } = {}) => ({
        url: `/product/gcatalogsearch/result`,
        method: "GET",
        params: { search: query, flat: 1, page, limit },
      }),
    }),
    getProductsByPaymenType: builder.query({
      query: ({ query, page = 1, limit = 20 } = {}) => ({
        url: `/product/gcatalogsearch/result`,
        method: "GET",
        params: { paymentModes: query, flat: 1, page, limit },
      }),
    }),
    getProductsByOpenShop: builder.query({
      query: (query) => ({
        url: `/product/getProductsByOpenStores`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsByIdQuery,
  useGetProductImgQuery,
  useGetProductsByCategoryQuery,
  useGetProductsBySearchQuery,
  useGetProductsByPaymenTypeQuery,
  useGetProductsByOpenShopQuery
} = ProductApi;
export const { endpoints } = ProductApi;

export const {
  useLazyGetProductsQuery,
  useLazyGetProductsByIdQuery,
  useLazyGetProductsByCategoryQuery,
  useLazyGetProductsBySearchQuery,
  useLazyGetProductsByPaymenTypeQuery,
} = ProductApi;
