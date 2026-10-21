import { test } from "node:test";
import assert from "node:assert/strict";
import { findProtectedChanges } from "./check-scope.mjs";

test("a server change is protected", () => {
  assert.deepEqual(findProtectedChanges(["server/src/app.js"]), [
    "server/src/app.js",
  ]);
});

for (const [area, path] of [
  ["client data services", "client/src/services/productService.js"],
  ["hooks", "client/src/hooks/useCart.js"],
  ["context", "client/src/context/DarkModeContext.jsx"],
  ["middleware", "client/src/middleware.js"],
  ["logic utilities", "client/src/utils/toPersianNumber.js"],
  ["the shared component folder", "client/src/common/Button.jsx"],
  ["the Account area", "client/src/app/(profile)/profile/me/page.jsx"],
  ["the Admin panel", "client/src/app/(admin)/admin/page.jsx"],
]) {
  test(`a change to ${area} is protected`, () => {
    assert.deepEqual(findProtectedChanges([path]), [path]);
  });
}

test("Storefront pages, the header, styling and fonts are not protected", () => {
  assert.deepEqual(
    findProtectedChanges([
      "client/src/app/(user)/products/page.jsx",
      "client/src/app/(user)/layout.jsx",
      "client/src/app/Header.jsx",
      "client/src/app/globals.css",
      "client/src/app/icon.svg",
      "client/src/constants/localFonts.js",
      "client/tailwind.config.js",
      "package.json",
      "scripts/check-scope.mjs",
    ]),
    []
  );
});

test("the Admin panel forms are protected but the Storefront UI folder is not", () => {
  assert.deepEqual(
    findProtectedChanges([
      "client/src/components/ProductForm.jsx",
      "client/src/components/ui/PillButton.jsx",
    ]),
    ["client/src/components/ProductForm.jsx"]
  );
});
