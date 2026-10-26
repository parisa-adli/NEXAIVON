"use client";

import { useState } from "react";

function ProductTabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-xl border border-secondary-200 bg-secondary-0">
      <div role="tablist" className="flex border-b border-secondary-200 px-4">
        {tabs.map(({ label }, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={active === i}
            aria-controls={`tabpanel-${i}`}
            onClick={() => setActive(i)}
            className={`px-6 py-4 text-sm font-bold border-b-2 -mb-px ${
              active === i
                ? "border-brand text-brand"
                : "border-transparent text-secondary-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="p-6"
      >
        {tabs[active].content}
      </div>
    </div>
  );
}
export default ProductTabs;
