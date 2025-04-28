"use client";

import { api } from "@/api";
import { GET_USER_API, LOGOUT_API } from "@/contants/api-url/auth";
import { ALL_ROUTES, DEFAULT_PAGE_ON_LOGIN } from "@/contants/appConstant";
import {
  getAccessTokenFromLocalStorage,
  removeAccessTokenFromLocalStorage,
} from "@/utils/auth";
import { checkSuccessResponse } from "@/utils/common";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation } from "react-query";

type User = {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
};

type AuthContextType = {
  loading: boolean;
  setIsLoading: () => boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  getLoginUser: () => Promise<void>;
  handleLogout: () => Promise<void>;
  profileApi: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  values,
}: {
  children: ReactNode;
  values: { authGuard: Boolean; guestGuard: Boolean };
}) => {
  const [loading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  async function getLoginUser() {
    const response = await api({
      endpoint: GET_USER_API,
    });

    if (checkSuccessResponse(response)) {
      setUser(response.data.data?.user);
    } else {
      setUser(null);
      removeAccessTokenFromLocalStorage();
      if (ALL_ROUTES.LOGIN !== pathname) {
        router.push(ALL_ROUTES.LOGIN);
      }
    }
  }

  async function init() {
    try {
      setIsLoading(true);
      if (!user) {
        await getLoginUser();
      }
    } catch (error) {
      setUser(null);
      removeAccessTokenFromLocalStorage();
      if (pathname !== ALL_ROUTES.LOGIN) {
        router.push(ALL_ROUTES.LOGIN);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);

  // Api call mutation
  const handleLogoutAPI = useMutation(
    async () => {
      const response = await api({
        endpoint: LOGOUT_API,
      });
      return response;
    },
    {
      onSuccess: (response) => {
        removeAccessTokenFromLocalStorage();
        setUser(null);
        router.push(ALL_ROUTES.LOGIN);
      },
      onError: () => {},
    }
  );

  async function handleLogout() {
    await handleLogoutAPI.mutateAsync();
  }

  const totalValues: AuthContextType = {
    loading,
    setIsLoading,
    user,
    setUser,
    getLoginUser,
    handleLogout: handleLogout,
    profileApi: getLoginUser,
  };

  return (
    <AuthContext.Provider value={totalValues}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
