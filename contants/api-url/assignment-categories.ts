import { EndpointConfig } from "@/api";

export const ASSIGNMENT_CATEGORIES_API = {
  GET_ALL: {
    method: "GET",
    url: "/assignment-categories",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  GET_BY_ID: {
    method: "GET",
    url: "/assignment-categories/",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  CREATE: {
    method: "POST",
    url: "/assignment-categories/create",
    showToast: true,
  } as EndpointConfig,

  UPDATE: {
    method: "POST",
    url: "/assignment-categories/update/",
    showToast: true,
  } as EndpointConfig,

  DELETE: {
    method: "DELETE",
    url: "/assignment-categories/",
    showToast: true,
  } as EndpointConfig,
};
