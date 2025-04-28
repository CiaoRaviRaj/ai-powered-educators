import { EndpointConfig } from "@/api";

export const ASSIGNMENTS_API = {
  GET_ALL: {
    method: "GET",
    url: "/assignments",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  GET_BY_ID: {
    method: "GET",
    url: "/assignments/",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  CREATE: {
    method: "POST",
    url: "/assignments/create",
    showToast: true,
  } as EndpointConfig,

  UPDATE: {
    method: "POST",
    url: "/assignments/update/",
    showToast: true,
  } as EndpointConfig,

  DELETE: {
    method: "DELETE",
    url: "/assignments/",
    showToast: true,
  } as EndpointConfig,
};
