// Startup checks, run by index.js before anything else. Throws so the server
// refuses to start on a bad environment instead of failing at request time.
function validateEnv(env) {
  // Everything except "production" logs OTPs instead of sending SMS, so an
  // unset NODE_ENV must never be read as "not production" by accident.
  if (!env.NODE_ENV?.trim())
    throw new Error(
      'NODE_ENV is not set. Set it to "production" in production, or "development" locally.'
    );
  // Public upload URLs are built from it and stored in the database, so a
  // missing value would save "undefined/uploads/..." links.
  if (!env.SERVER_URL?.trim())
    throw new Error(
      "SERVER_URL is not set. Set it to this API's public origin, e.g. http://localhost:5000."
    );
}

module.exports = { validateEnv };
