/****
 * You can put any key constant here which you want to use many times or one time
 */
export const USER_ACCESS_TOKEN_KEY = "accessToken";
export const LOGGED_IN_USER_DATA = "userData";
export const USER_ROLE_KEY = "role";

export const ROLE_ADMIN = "ADMIN";
export const ROUTE_ADMIN = "admin";
export const ROUTE_PUBLIC = "public";

// MESSAGE
export const DYNAMIC_API_ERROR_MESSAGE_ERROR_CODE = "ATC005";

export const hideToastMessageFromAPI: string[] = [];

export const ADMIN_SERVICE_KEY = "ADMIN";
export const USER_SERVICE_KEY = "USER";
export const DEFAULT_SERVICE_KEY = "DEFAULT";
export const API_SERVICE_KEY = "API";

export const BASE_URLS = new Map();

BASE_URLS.set(USER_SERVICE_KEY, `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`);
BASE_URLS.set(DEFAULT_SERVICE_KEY, `${process.env.NEXT_PUBLIC_API_BASE_URL}`);
BASE_URLS.set(API_SERVICE_KEY, `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`);
// RESPONSE TYPE
export const RESPONSE_OK = 200;
export const RESPONSE_CREATED = 201;

// API ACTIONS TYPE

export const API_METHOD_GET = "GET";
export const API_METHOD_POST = "POST";
export const API_METHOD_DELETE = "DELETE";

// ROUTE

export const DEFAULT_PAGE_ON_LOGIN = "/dashboard/assignments";
export const ALL_ROUTES = {
  LOGIN: "/login",
  LANDING_PAGE: "/",
  SIGNUP: "/signup",
};
