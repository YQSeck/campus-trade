// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import request from '@/utils/request';

// 鍟嗗搧鍒嗛〉鍒楄〃锛歱arams 鍖呭惈 page锛堥粯璁?1锛夈€乴imit锛堥粯璁?10锛夌瓑鏌ヨ鍙傛暟
export function getProducts(params) {
  return request.get('/products', { params });
}

// 鍟嗗搧璇︽儏
export function getProductById(id) {
  return request.get(`/products/${id}`);
}

// 鍙戝竷鍟嗗搧锛歞ata 闇€鍖呭惈 title銆乨escription銆乧ategory銆乸rice銆乮mages 绛夊繀濉瓧娈?export function createProduct(data) {
  return request.post('/products', data);
}

// 鏇存柊鍟嗗搧锛氫粎鍙慨鏀规湰浜哄彂甯冪殑鍟嗗搧
export function updateProduct(id, data) {
  return request.put(`/products/${id}`, data);
}

// 鍒犻櫎鍟嗗搧锛堢墿鐞嗗垹闄わ紝鐘舵€佹祦杞负 deleted锛?export function deleteProduct(id) {
  return request.delete(`/products/${id}`);
}
