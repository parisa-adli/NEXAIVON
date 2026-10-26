import http from "./httpService";
import { homeContentDefaults } from "@/constants/home";

// Saved sections replace the defaults; the defaults also keep the homepage up
// when the API is unreachable.
export function getHomeContent() {
  return http
    .get("/home")
    .then(({ data }) => ({ ...homeContentDefaults, ...data.data.content }))
    .catch(() => homeContentDefaults);
}

export function updateHomeContent(content) {
  return http.put("/admin/home", content).then(({ data }) => data.data);
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return http
    .post("/admin/upload/image", formData)
    .then(({ data }) => data.data.url);
}
