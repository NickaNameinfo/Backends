import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { infoData } from "../../../configData";
import { prepareHeaders } from "../../../utils/authHelper.mjs";

// Note: Login and Register endpoints don't require auth, but other endpoints do
const axiosBaseQuery = fetchBaseQuery({
  baseUrl: infoData.baseApi, // Set your base URL
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Skip auth for login/register endpoints
    if (endpoint === 'Login' || endpoint === 'register') {
      return headers;
    }
    return prepareHeaders(headers, { getState });
  },
});

export const AuthApi = createApi({
  reducerPath: "AuthApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    Login: builder.mutation({
      query: (body) => ({
        url: `/auth/rootLogin`,
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: `/auth/register`,
        method: "POST",
        body
      }),
    }),
    updatUser: builder.mutation({
      query: (body) => ({
        url: `/auth/user/update`,
        method: "POST",
        body
      }),
    }),
    uploadFile: builder.mutation({
      query: (body) => ({
        url: `/auth/upload-file`,
        method: "POST",
        body
      }),
    }),
    requestPasswordReset: builder.mutation({
      query: (body) => ({
        url: `/auth/password/reset/request`,
        method: "POST",
        body,
      }),
    }),
    confirmPasswordReset: builder.mutation({
      query: (body) => ({
        url: `/auth/password/reset/confirm`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useUpdatUserMutation,
  useUploadFileMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = AuthApi;
export const { endpoints } = AuthApi;
