import {
  DEFAULT_PAGE_ON_LOGIN,
  USER_ACCESS_TOKEN_KEY,
} from "@/contants/appConstant";
import { useAuth } from "@/context/auth-context/AuthContextProvider";
import { isClientSide } from "@/utils/auth";
import { useRouter } from "next/router";
import React, { JSX, PropsWithChildren, useEffect } from "react";
const GuestGuard = (props: PropsWithChildren<{ fallback: JSX.Element }>) => {
  const { children, fallback } = props;
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (window.localStorage.getItem(USER_ACCESS_TOKEN_KEY)) {
      router.replace(DEFAULT_PAGE_ON_LOGIN);
    }
  }, [router.route, router]);

  if (
    auth.loading ||
    (!auth.loading && auth.user !== null && !isClientSide())
  ) {
    return fallback;
  }

  return <>{children}</>;
};

export default GuestGuard;
