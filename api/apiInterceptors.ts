import axios, { AxiosResponse, AxiosError } from "axios";

interface ErrorResponse {
  errorCode?: string;
}

export const axiosInstance = axios.create();

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<{ errorCode?: string }>) => {
    const errorCode = error?.response?.data?.errorCode;

    if (errorCode) {
    }

    // Handle 401 and 403 status codes
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      let url = "/login";

      window.location.replace(url);
    }

    return Promise.reject(error);
  }
);
