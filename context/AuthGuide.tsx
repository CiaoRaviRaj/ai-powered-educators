"use client";
import AuthGuard from "@/components/@core/AuthGaurd";
import GuestGuard from "@/components/@core/GuestGuard";
import Spinner from "@/components/common/Spinner";

import { createContext, useContext, ReactNode } from "react";

type authGuardContextType = {};

const authGuardContext = createContext<authGuardContextType | undefined>(
  undefined
);

export const authGuardProvider = ({
  children,
  values,
}: {
  children: ReactNode;
  values: { authGuard: Boolean; guestGuard: Boolean };
}) => {
  const { authGuard, guestGuard } = values;
  function render() {
    if (guestGuard) {
      return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>;
    } else if (!guestGuard && !authGuard) {
      return <>{children}</>;
    } else {
      return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>;
    }
  }
  return (
    <authGuardContext.Provider value={{}}>{render()}</authGuardContext.Provider>
  );
};

export const useauthGuard = () => {
  const context = useContext(authGuardContext);
  if (!context)
    throw new Error("useauthGuard must be used within authGuardProvider");
  return context;
};
