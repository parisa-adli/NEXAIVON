import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { cookieForUser } from "./helpers/auth.js";
import { loggedCode } from "./helpers/otp.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

const profile = { name: "کاربر دمو", email: "demo@example.com", biography: "" };

async function demoUser() {
  await request(createApp())
    .post("/api/user/demo-login")
    .send({ username: "demo", password: "demo1234", role: "USER" });
  return UserModel.findOne({ username: "demo-user" });
}

function update(user, body) {
  return request(createApp())
    .patch("/api/user/update")
    .set("Cookie", cookieForUser(user))
    .send(body);
}

describe("PATCH /api/user/update", () => {
  it("lets a demo user set a phone number and email", async () => {
    const user = await demoUser();

    const res = await update(user, { ...profile, phoneNumber: "09120000050" });

    expect(res.status).toBe(200);
    expect(await UserModel.findById(user._id)).toMatchObject({
      email: "demo@example.com",
      phoneNumber: "09120000050",
    });
  });

  it("clears the demo account's details on the next demo login", async () => {
    const user = await demoUser();
    await update(user, { ...profile, phoneNumber: "09120000050" });

    const again = await demoUser();

    expect(again.email).toBeUndefined();
    expect(again.phoneNumber).toBeUndefined();
  });

  it("never signs anyone in to a demo account by OTP", async () => {
    const user = await demoUser();
    await update(user, { ...profile, phoneNumber: "09120000050" });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await request(createApp()).post("/api/user/get-otp").send({ phoneNumber: "09120000050" });
    const res = await request(createApp())
      .post("/api/user/check-otp")
      .send({ phoneNumber: "09120000050", otp: loggedCode(logSpy, "09120000050") });

    logSpy.mockRestore();
    expect(res.status).toBe(200);
    expect(res.body.data.user._id).not.toBe(String(user._id));
  });

  it("does not let a user change a phone number they already have", async () => {
    const user = await UserModel.create({ name: "otp user", phoneNumber: "09120000051" });

    const res = await update(user, { ...profile, phoneNumber: "09120000052" });

    expect(res.status).toBe(400);
    expect((await UserModel.findById(user._id)).phoneNumber).toBe("09120000051");
  });

  it("rejects an email or phone number another user has", async () => {
    await UserModel.create({ name: "other", email: "taken@example.com", phoneNumber: "09120000053" });
    const user = await demoUser();

    expect((await update(user, { ...profile, email: "taken@example.com" })).status).toBe(400);
    expect((await update(user, { ...profile, phoneNumber: "09120000053" })).status).toBe(400);
  });
});
