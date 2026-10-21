"use client";

// PROTOTYPE: the product page is statically generated, so the server never
// sees ?variant=. All variants are rendered on the server and this picks one
// in the browser.

import { useSearchParams } from "next/navigation";

function VariantView({ variants }) {
  const variant = useSearchParams().get("variant") ?? "current";
  return variants[variant] ?? variants.current;
}
export default VariantView;
