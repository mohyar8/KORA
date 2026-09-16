"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getClientSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True only for devices with an accurate pointer and hover support (mouse /
 * trackpad). Used to gate desktop-only flourishes — cursor effects, magnetic
 * buttons — that would be meaningless or janky on touch.
 *
 * Built on `useSyncExternalStore` (not `useState` + `useEffect`) so the
 * first client render matches the server render exactly — reading
 * `matchMedia` during a state initializer would otherwise disagree with the
 * server's markup and trigger a hydration mismatch.
 */
export function useIsFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
