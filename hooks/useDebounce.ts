import { useState, useEffect } from "react";

/**
 * Holds a value back until it stops changing.
 *
 * The default wait is deliberately long. These searches hit the API, and the
 * people using them are typing product and merchant names on a phone — at a
 * shorter wait the request fires between words, so a two or three word name
 * costs several round trips and the list churns under the thumb while it is
 * still being typed.
 *
 * Clearing the field is not a search, it is a cancel, so an empty value goes
 * through at once and the full list comes straight back.
 */
export function useDebounce<T>(value: T, delay = 800): T {
  const [debounced, setDebounced] = useState(value);
  const emptied = typeof value === "string" && value.trim() === "";

  // Adjusted during render rather than in an effect, so an emptied field never
  // spends a frame still showing the last search.
  if (emptied && debounced !== value) setDebounced(value);

  useEffect(() => {
    if (typeof value === "string" && value.trim() === "") return;
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
