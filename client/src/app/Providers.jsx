"use client";

import { DarkModeProvider } from "@/context/DarkModeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>{children}</DarkModeProvider>
    </QueryClientProvider>
  );
}
