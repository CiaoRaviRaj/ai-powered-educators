import { AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";

import {
  ALL_ROUTES,
  API_SERVICE_KEY,
  BASE_URLS,
  DYNAMIC_API_ERROR_MESSAGE_ERROR_CODE,
  hideToastMessageFromAPI,
  USER_ACCESS_TOKEN_KEY,
} from "@/contants/appConstant";
import { axiosInstance } from "./apiInterceptors";
import Toast from "@/utils/toast";
import { toastErrorMessage } from "@/contants/messages";
import { convertObjToQueryString } from "../utils/common";

export type EndpointConfig = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  isMultipart?: boolean;
  url: string;
  showToast?: boolean;
  module?: string;
  ToastMessages?: Record<string, string>;
  responseType?: AxiosRequestConfig["responseType"];
  succesMsgHide?: boolean;
  isShowAPIMessage?: boolean;
  withToken?: boolean;
};

export type paramsType = Record<string, any> | null | undefined;

export interface ApiParams {
  endpoint: EndpointConfig;
  payloadData?: any;
  id?: string | number | null;
  params?: paramsType;
  dynamicMessage?: string | null;
  isToastMessageHide?: boolean;
  cancelToken?: CancelToken | string;
  withoutToken?: boolean;
}

export interface ApiResponse<T = any> {
  data: {
    error: boolean;
    data: T;
    errorCode?: string;
    message?: string;
  };
}

export const api = async <T = any>({
  endpoint,
  payloadData,
  id = null,
  params = null,
  dynamicMessage = null,
  isToastMessageHide = false,
  cancelToken = "",
  withoutToken = false,
}: ApiParams): Promise<ApiResponse<T> | AxiosResponse<T>> => {
  const {
    method,
    isMultipart,
    url,
    showToast,
    module = API_SERVICE_KEY,
    ToastMessages,
    responseType,
    succesMsgHide,
    isShowAPIMessage = false,
  } = endpoint;

  const token = withoutToken
    ? null
    : window.localStorage.getItem(USER_ACCESS_TOKEN_KEY);

  let res: AxiosResponse | null = null;

  try {
    const headers: Record<string, string> = {
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let finalUrl = `${BASE_URLS.get(module)}${url}${id ?? ""}${
      params ? convertObjToQueryString(params) : ""
    }`;

    if (method === "GET" && payloadData && typeof payloadData === "string") {
      finalUrl += payloadData;
    }

    const config: AxiosRequestConfig = {
      url: finalUrl,
      method,
      headers,
      data: method !== "GET" ? payloadData ?? {} : undefined,
      responseType,
    };

    if (cancelToken) {
      config.cancelToken = cancelToken as CancelToken;
    }

    res = await axiosInstance(config);
  } catch (err: any) {
    res = err.response;

    try {
      if (
        !hideToastMessageFromAPI.includes(res?.data?.errorCode || "") &&
        showToast &&
        !isToastMessageHide
      ) {
        Toast.error(
          isShowAPIMessage
            ? res?.data?.message || toastErrorMessage.INTERNAL_SERVER_ERROR
            : getErrorToastMessage(
                ToastMessages,
                res?.data?.errorCode,
                toastErrorMessage.INTERNAL_SERVER_ERROR,
                res?.data?.message
              )
        );
      }

      if (res?.status === 401 || res?.status === 403) {
        if (window.location.pathname !== ALL_ROUTES.LOGIN) {
          window.location.replace(ALL_ROUTES.LOGIN);
        }
      }

      return {
        data: {
          error: true,
          data: res?.data?.data,
          errorCode: res?.data?.errorCode,
          message: res?.data?.message ?? "",
        },
      };
    } catch (error) {
      return {
        data: {
          error: true,
          data: res?.data?.data,
          errorCode: res?.data?.errorCode,
          message: res?.data?.message ?? "",
        },
      };
    }
  }

  if (
    res &&
    res.data &&
    !res.data.error &&
    showToast &&
    !isToastMessageHide &&
    !succesMsgHide
  ) {
    Toast.success(
      isShowAPIMessage
        ? res?.data?.message ?? ""
        : getSuccessToastMessage(
            ToastMessages,
            res.data.errorCode,
            dynamicMessage,
            toastErrorMessage.INTERNAL_SERVER_ERROR
          )
    );
  }

  return res;
};

const getSuccessToastMessage = (
  ToastMessages: Record<string, string> | undefined,
  errorCode: string,
  dynamicMessage: string | null,
  fallbackMessage: string
): string => {
  if (ToastMessages && ToastMessages[errorCode]) {
    return dynamicMessage ?? ToastMessages[errorCode];
  }
  return dynamicMessage ?? fallbackMessage;
};

const getErrorToastMessage = (
  ToastMessages: Record<string, string> | undefined,
  errorCode: string,
  fallbackMessage: string,
  apiMessage?: string
): string => {
  switch (errorCode) {
    case DYNAMIC_API_ERROR_MESSAGE_ERROR_CODE:
      return apiMessage || "";
  }

  return ToastMessages?.[errorCode] ?? fallbackMessage;
};
