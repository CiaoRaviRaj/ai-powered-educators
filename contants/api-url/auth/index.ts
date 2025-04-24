import { EndpointConfig } from "@/api";
import { apisEndpointsAuth } from "@/contants/api-endpoints/auth";
import {
  API_METHOD_GET,
  API_METHOD_POST,
  DEFAULT_SERVICE_KEY,
  USER_SERVICE_KEY,
} from "@/contants/appConstant";

export const LOGIN_API: EndpointConfig = {
  url: apisEndpointsAuth.ENDPOINTS_LOGIN_API,
  method: API_METHOD_POST,
  withToken: false,
  module: DEFAULT_SERVICE_KEY,
  isMultipart: false,
  showToast: false,
};

export const SIGNUP_API: EndpointConfig = {
  url: apisEndpointsAuth.ENDPOINTS_SIGNUP_API,
  method: API_METHOD_POST,
  withToken: false,
  module: DEFAULT_SERVICE_KEY,
  isMultipart: false,
  showToast: false,
};

export const GET_USER_API: EndpointConfig = {
  url: apisEndpointsAuth.ENDPOINTS_GET_USER_API,
  method: API_METHOD_GET,
  withToken: true,
  module: DEFAULT_SERVICE_KEY,
  isMultipart: false,
  showToast: false,
};

export const LOGOUT_API: EndpointConfig = {
  url: apisEndpointsAuth.ENDPOINTS_LOGOUT_API,
  method: API_METHOD_GET,
  withToken: true,
  module: DEFAULT_SERVICE_KEY,
  isMultipart: false,
  showToast: false,
};
