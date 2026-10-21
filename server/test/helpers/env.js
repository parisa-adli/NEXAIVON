// Fixed fake environment for tests. server/.env is never loaded in tests.
Object.assign(process.env, {
  NODE_ENV: "test",
  COOKIE_PARSER_SECRET_KEY: "test-cookie-parser-secret",
  ACCESS_TOKEN_SECRET_KEY: "test-access-token-secret",
  REFRESH_TOKEN_SECRET_KEY: "test-refresh-token-secret",
  TOKEN_SECRET_KEY: "test-token-secret",
  ALLOW_CORS_ORIGIN: "http://localhost:3000",
  DOMAIN: "localhost",
  SERVER_URL: "http://localhost:5000",
});
