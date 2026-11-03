"use client";

import { useEffect, useState } from "react";

// initialState may be a function; it runs only in the browser, after hydration
export default function useLocalStorageState(key, initialState, ssrState) {
  const [value, setValue] = useState(ssrState);
  const [loaded, setLoaded] = useState(false);

  // read after mount so the first client render matches the server HTML
  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    setValue(
      storedValue !== null
        ? JSON.parse(storedValue)
        : typeof initialState === "function"
          ? initialState()
          : initialState
    );
    setLoaded(true);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(value));
  }, [value, key, loaded]);

  return [value, setValue];
}
