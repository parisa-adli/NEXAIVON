import { cache } from "react";
import { getHomeContent } from "./homeService";

// Server components only: one GET /home per render, however many sections ask.
export const getCachedHomeContent = cache(getHomeContent);
