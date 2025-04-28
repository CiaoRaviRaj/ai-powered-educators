"use client";
import AuthGuard from "@/components/@core/AuthGaurd";
import GuestGuard from "@/components/@core/GuestGuard";
import Spinner from "@/components/common/Spinner";

import { createContext, useContext, ReactNode } from "react";

type AuthGuardContextType = {};

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(
  undefined
);

export const AuthGuardProvider = ({
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
    <AuthGuardContext.Provider value={{}}>{render()}</AuthGuardContext.Provider>
  );
};

export const useauthGuard = () => {
  const context = useContext(AuthGuardContext);
  if (!context)
    throw new Error("useauthGuard must be used within authGuardProvider");
  return context;
};
