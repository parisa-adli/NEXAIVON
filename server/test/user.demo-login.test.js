import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

function demoLogin(body) {
  return request(createApp())
    .post("/api/user/demo-login")
    .send({ username: "demo", password: "demo1234", ...body });
}

function cookiesOf(res) {
  return res.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ");
}

describe("POST /api/user/demo-login", () => {
  it("signs in as admin with admin access", async () => {
    const res = await demoLogin({ role: "ADMIN" });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ role: "ADMIN", isActive: true });

    const users = await request(createApp())
      .get("/api/admin/user/list")
      .set("Cookie", cookiesOf(res));
    expect(users.status).toBe(200);
  });

  it("signs in as a user without admin access", async () => {
    const res = await demoLogin({ role: "USER" });
    expect(res.status).toBe(200);

    const users = await request(createApp())
      .get("/api/admin/user/list")
      .set("Cookie", cookiesOf(res));
    expect(users.status).toBe(403);
  });

  it("reuses and resets the demo account on each login", async () => {
    await demoLogin({ role: "ADMIN" });
    await UserModel.updateOne({ username: "demo-admin" }, { role: "USER", isBlocked: true });

    const res = await demoLogin({ role: "ADMIN" });

    expect(res.body.data.user).toMatchObject({ role: "ADMIN", isBlocked: false });
    expect(await UserModel.countDocuments({ username: "demo-admin" })).toBe(1);
  });

  it("rejects wrong credentials and unknown roles", async () => {
    expect((await demoLogin({ role: "ADMIN", password: "nope" })).status).toBe(401);
    expect((await demoLogin({ role: "ADMIN", username: "x" })).status).toBe(401);
    expect((await demoLogin({ role: "ROOT" })).status).toBe(400);
  });
});
