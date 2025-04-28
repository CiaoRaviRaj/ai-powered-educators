import { EndpointConfig } from "@/api";

export const ASSIGNMENT_SUB_CATEGORIES_API = {
  GET_ALL: {
    method: "GET",
    url: "/assignment-sub-categories",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  GET_BY_ID: {
    method: "GET",
    url: "/assignment-sub-categories/",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  CREATE: {
    method: "POST",
    url: "/assignment-sub-categories/create",
    showToast: true,
  } as EndpointConfig,

  UPDATE: {
    method: "POST",
    url: "/assignment-sub-categories/update/",
    showToast: true,
  } as EndpointConfig,

  DELETE: {
    method: "DELETE",
    url: "/assignment-sub-categories/",
    showToast: true,
  } as EndpointConfig,
};
