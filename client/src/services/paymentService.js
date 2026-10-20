import http from "./httpService";

export function createPayment() {
  return http.post("/payment/create").then(({ data }) => data.data);
}

export function getAllPayments(options) {
  return http.get("/admin/payment/list", options).then(({ data }) => data.data);
}

export function getOnePaymentById(id) {
  return http.get(`/admin/payment/${id}`).then(({ data }) => data.data);
}
