// 【模块五：后台管理】举报 API
import request from "@/utils/request";

// 举报商品、留言或用户
export function createReport(data) {
  return request.post("/reports", data);
}
