import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { cookieForUser, signedInCookie } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

afterEach(() => vi.restoreAllMocks());

function createUser() {
  return UserModel.create({
    name: "target",
    phoneNumber: "09120000001",
    isActive: true,
    role: "USER",
  });
}

function update(cookie, userId, body) {
  return request(createApp())
    .patch(`/api/admin/user/update/${userId}`)
    .set("Cookie", cookie)
    .send(body);
}

describe("PATCH /api/admin/user/update/:userId", () => {
  it("promotes a user to admin", async () => {
    const admin = await signedInCookie("ADMIN");
    const user = await createUser();

    const res = await update(admin, user._id, { role: "ADMIN" });

    expect(res.status).toBe(200);
    expect((await UserModel.findById(user._id)).role).toBe("ADMIN");
  });

  it("deactivates a user, who is then locked out", async () => {
    const admin = await signedInCookie("ADMIN");
    const user = await createUser();

    const res = await update(admin, user._id, { isBlocked: true });
    expect(res.status).toBe(200);

    const profile = await request(createApp())
      .get("/api/user/profile")
      .set("Cookie", cookieForUser(user));
    expect(profile.status).toBe(401);
  });

  it("rejects an unknown role and an empty body", async () => {
    const admin = await signedInCookie("ADMIN");
    const user = await createUser();

    expect((await update(admin, user._id, { role: "ROOT" })).status).toBe(400);
    expect((await update(admin, user._id, {})).status).toBe(400);
  });

  it("does not let an admin change their own account", async () => {
    const admin = await signedInCookie("ADMIN");
    const self = await UserModel.findOne({ role: "ADMIN" });

    const res = await update(admin, self._id, { isBlocked: true });

    expect(res.status).toBe(400);
    expect((await UserModel.findById(self._id)).isBlocked).toBe(false);
  });

  it("is forbidden for non-admins", async () => {
    const cookie = await signedInCookie("USER");
    const user = await createUser();

    expect((await update(cookie, user._id, { role: "ADMIN" })).status).toBe(403);
  });

  it("keeps one admin when two admins demote each other at once", async () => {
    const [a, b] = await UserModel.create([
      { name: "a", phoneNumber: "09120000011", isActive: true, role: "ADMIN" },
      { name: "b", phoneNumber: "09120000012", isActive: true, role: "ADMIN" },
    ]);

    const results = await Promise.all([
      update(cookieForUser(a), b._id, { role: "USER" }),
      update(cookieForUser(b), a._id, { role: "USER" }),
    ]);

    expect(results.some((res) => res.status === 200 || res.status === 409)).toBe(true);
    expect(await UserModel.countDocuments({ role: "ADMIN" })).toBeGreaterThan(0);
  });

  it("rolls back a demotion when the other admin was demoted meanwhile", async () => {
    const [a, b] = await UserModel.create([
      { name: "a", phoneNumber: "09120000011", isActive: true, role: "ADMIN" },
      { name: "b", phoneNumber: "09120000012", isActive: true, role: "ADMIN" },
    ]);
    // Simulate the lost race: b's own demotion lands right after a's request
    // passed authorization.
    const original = UserModel.findByIdAndUpdate.bind(UserModel);
    vi.spyOn(UserModel, "findByIdAndUpdate").mockImplementation(async (...args) => {
      await UserModel.updateOne({ _id: b._id }, { $set: { role: "USER" } });
      return original(...args);
    });

    const res = await update(cookieForUser(b), a._id, { isBlocked: true });

    expect(res.status).toBe(409);
    const admin = await UserModel.findById(a._id);
    expect(admin.role).toBe("ADMIN");
    expect(admin.isBlocked).toBe(false);
  });
});
