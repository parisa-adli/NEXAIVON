import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { loggedCode } from "./helpers/otp.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const Kavenegar = require("kavenegar");

setupTestDb();

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/user/get-otp outside production", () => {
  it("logs the code instead of calling Kavenegar, and the logged code verifies", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const kavenegarSpy = vi.spyOn(Kavenegar, "KavenegarApi");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const app = createApp();
    const phoneNumber = "09120000001";

    const res = await request(app)
      .post("/api/user/get-otp")
      .send({ phoneNumber });

    expect(res.status).toBe(200);
    expect(res.body.data.phoneNumber).toBe(phoneNumber);
    expect(kavenegarSpy).not.toHaveBeenCalled();

    const code = loggedCode(logSpy, phoneNumber);
    expect(code).toBeDefined();

    const check = await request(app)
      .post("/api/user/check-otp")
      .send({ phoneNumber, otp: code });
    expect(check.status).toBe(200);
  });

  it("gives concurrent requests for different phones their own codes", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const app = createApp();
    const phoneNumbers = ["09120000001", "09120000002"];

    const responses = await Promise.all(
      phoneNumbers.map((phoneNumber) =>
        request(app).post("/api/user/get-otp").send({ phoneNumber })
      )
    );
    expect(responses.map((res) => res.status)).toEqual([200, 200]);

    for (const phoneNumber of phoneNumbers) {
      const check = await request(app)
        .post("/api/user/check-otp")
        .send({ phoneNumber, otp: loggedCode(logSpy, phoneNumber) });
      expect(check.status).toBe(200);
    }
  });
});

describe("POST /api/user/get-otp in production", () => {
  it("sends the code by Kavenegar SMS and does not log it", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const verifyLookup = vi.fn((params, callback) => callback([{}], 200));
    vi.spyOn(Kavenegar, "KavenegarApi").mockReturnValue({
      VerifyLookup: verifyLookup,
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const app = createApp();
    const phoneNumber = "09120000001";

    const res = await request(app)
      .post("/api/user/get-otp")
      .send({ phoneNumber });

    expect(res.status).toBe(200);
    expect(verifyLookup).toHaveBeenCalledOnce();
    const [params] = verifyLookup.mock.calls[0];
    expect(params).toMatchObject({
      receptor: phoneNumber,
      template: "registerVerify",
    });
    const code = String(params.token);
    const loggedText = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(loggedText).not.toContain(code);

    const check = await request(app)
      .post("/api/user/check-otp")
      .send({ phoneNumber, otp: code });
    expect(check.status).toBe(200);
  });
});
