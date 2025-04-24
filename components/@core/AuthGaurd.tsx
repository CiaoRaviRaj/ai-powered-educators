// ** React Imports
import { JSX, PropsWithChildren, useEffect } from "react";

// ** Next Import
import { useRouter } from "next/router";
import { useAuth } from "@/context/auth-context/AuthContextProvider";
import { ALL_ROUTES, USER_ACCESS_TOKEN_KEY } from "@/contants/appConstant";

// ** Hooks Import

const AuthGuard = (props: PropsWithChildren<{ fallback: JSX.Element }>) => {
  const { children, fallback } = props;
  const auth = useAuth();
  const router = useRouter();
  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      if (
        auth.user === null &&
        !window.localStorage.getItem(USER_ACCESS_TOKEN_KEY)
      ) {
        if (router.asPath !== ALL_ROUTES.LOGIN) {
          router.replace({
            pathname: ALL_ROUTES.LOGIN,
            query: { returnUrl: router.asPath },
          });
        } else {
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, router.isReady]
  );
  if (auth.loading || auth.user === null) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
