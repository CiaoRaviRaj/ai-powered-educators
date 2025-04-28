import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkSuccessResponse = (response: any) => {
  return response?.status === "success" || response?.status === 200;
};
