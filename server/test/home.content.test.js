import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { cookieForUser, signedInCookie } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

function content(overrides = {}) {
  return {
    navLinks: [{ label: "محصولات", href: "/products" }],
    searchTags: ["آیفون"],
    heroSlides: [
      {
        eyebrow: "جدید",
        title: "گوشی‌ها",
        subtitle: "",
        image: "http://localhost:5000/uploads/images/a.png",
        icon: "LuSmartphone",
      },
    ],
    homeCategories: [
      { label: "موبایل", category: "smartphones", image: "/category/mobile.png" },
    ],
    promos: [
      { chip: "", title: "ساعت", subtitle: "", image: "/category/w.png", dark: true },
    ],
    brands: [{ name: "Apple", icon: "SiApple", wide: false }],
    services: [{ title: "ارسال سریع", subtitle: "", icon: "LuTruck" }],
    footerLinks: [{ label: "راهنما", href: "#" }],
    contact: { phone: "021", email: "info@example.com", address: "تهران" },
    ...overrides,
  };
}

async function mainAdminCookie() {
  const admin = await UserModel.create({
    name: "main",
    phoneNumber: "09120000031",
    isActive: true,
    role: "ADMIN",
    isMainAdmin: true,
  });
  return cookieForUser(admin);
}

function save(cookie, body) {
  return request(createApp()).put("/api/admin/home").set("Cookie", cookie).send(body);
}

describe("home content", () => {
  it("is empty until saved, so the client uses its defaults", async () => {
    const res = await request(createApp()).get("/api/home");
    expect(res.status).toBe(200);
    expect(res.body.data.content).toEqual({});
  });

  it("lets the main admin save it and serves it publicly", async () => {
    const res = await save(await mainAdminCookie(), content());
    expect(res.status).toBe(200);

    const home = await request(createApp()).get("/api/home");
    expect(home.body.data.content).toEqual(content());
  });

  it("is forbidden for other admins and users", async () => {
    expect((await save(await signedInCookie("ADMIN"), content())).status).toBe(403);
    await UserModel.deleteMany({});
    expect((await save(await signedInCookie("USER"), content())).status).toBe(403);
  });

  it("rejects unsafe links and images from other hosts", async () => {
    const cookie = await mainAdminCookie();
    const badLink = content({ navLinks: [{ label: "x", href: "javascript:alert(1)" }] });
    const badImage = content({
      promos: [{ chip: "", title: "x", subtitle: "", image: "https://evil.example/a.png", dark: false }],
    });

    const res = await save(cookie, badLink);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("navLinks.0.href");
    expect((await save(cookie, badImage)).status).toBe(400);
    expect((await save(cookie, content({ heroSlides: [] }))).status).toBe(400);
  });

  it("allows banners without an image", async () => {
    const noImage = content({
      heroSlides: [{ eyebrow: "", title: "x", subtitle: "", image: "", icon: "" }],
      promos: [{ chip: "", title: "x", subtitle: "", image: "", dark: false }],
    });
    expect((await save(await mainAdminCookie(), noImage)).status).toBe(200);
  });
});
