import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = async ({
  endpoint,
  method = "GET",
  payloadData,
}: {
  endpoint: string;
  method?: string;
  payloadData?: any;
}) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data: payloadData,
      headers,
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
