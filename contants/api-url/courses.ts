import { EndpointConfig } from "@/api";

export const COURSES_API = {
  GET_ALL: {
    method: "GET",
    url: "/courses",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  GET_BY_ID: {
    method: "GET",
    url: "/courses/",
    showToast: false,
    succesMsgHide: true,
  } as EndpointConfig,

  CREATE: {
    method: "POST",
    url: "/courses/create",
    showToast: true,
  } as EndpointConfig,

  UPDATE: {
    method: "POST",
    url: "/courses/update/",
    showToast: true,
  } as EndpointConfig,

  DELETE: {
    method: "DELETE",
    url: "/courses/",
    showToast: true,
  } as EndpointConfig,
};
