import { createRequire } from "node:module";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const JWT = require("jsonwebtoken");
const signature = require("cookie-signature");
const { UserModel } = require("../../app/models/user.js");

// Creates a user with the given role and returns a Cookie header carrying a
// signed access token, the way setAccessToken would issue it.
export async function signedInCookie(role = "USER") {
  const user = await UserModel.create({
    name: `${role} user`,
    phoneNumber: "09120000099",
    isActive: true,
    role,
  });
  return cookieForUser(user);
}

// Returns a Cookie header with a valid access token for an existing user.
export function cookieForUser(user) {
  return accessTokenCookie(
    JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: "1h",
    })
  );
}

// Wraps a raw JWT in a correctly signed accessToken cookie, so tests can send
// tokens that are expired or signed with the wrong key.
export function accessTokenCookie(token) {
  const value = `s:${signature.sign(token, process.env.COOKIE_PARSER_SECRET_KEY)}`;
  return `accessToken=${encodeURIComponent(value)}`;
}
