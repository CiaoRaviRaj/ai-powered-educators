import { USER_ACCESS_TOKEN_KEY } from "@/contants/appConstant";

export function isClientSide() {
  return typeof window !== "undefined";
}

export function getAccessTokenFromLocalStorage() {
  return isClientSide() && localStorage.getItem("accessToken");
}

export function setAccessTokenInLocalStorage(accessToken: String) {
  if (!isClientSide()) {
    return;
  }

  return localStorage.setItem(USER_ACCESS_TOKEN_KEY, accessToken as string);
}

export function removeAccessTokenFromLocalStorage() {
  return isClientSide() && localStorage.removeItem("accessToken");
}
