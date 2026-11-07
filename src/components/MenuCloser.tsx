"use client";
// Closes the mobile menu (a <details> element) when a link inside it is tapped and whenever the page changes.
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function MenuCloser() {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    document.querySelectorAll<HTMLDetailsElement>("details[data-mobile-menu], details[data-mobile-menu] details").forEach((d) => (d.open = false));
    document.body.style.overflow = "";
  }, [path, search]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const menu = a?.closest<HTMLDetailsElement>("details[data-mobile-menu]");
      if (menu) menu.open = false;
    };
    // Lock page scrolling behind the open menu.
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (d.matches?.("details[data-mobile-menu]")) document.body.style.overflow = d.open ? "hidden" : "";
    };
    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("toggle", onToggle, true); };
  }, []);
  return null;
}
