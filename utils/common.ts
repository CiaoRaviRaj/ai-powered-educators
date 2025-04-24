import { RESPONSE_CREATED, RESPONSE_OK } from "@/contants/appConstant";

export const convertObjToQueryString = (
    obj: Record<string, string | number | boolean | null | undefined>
  ): string => {
    const filteredEntries = Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null
    );
  
    const params = new URLSearchParams();
    for (const [key, value] of filteredEntries) {
      params.append(key, String(value));
    }
  
    return '?' + params.toString();
  };


  export const checkSuccessResponse = (res:any) => {
    return res?.status === RESPONSE_OK || res?.status === RESPONSE_CREATED
  }

