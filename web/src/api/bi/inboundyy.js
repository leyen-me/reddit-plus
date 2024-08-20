import service from "@/utils/request";

export const useInboundyySubmitApi = (data) => {
  return service.post("/sys", data);
};
