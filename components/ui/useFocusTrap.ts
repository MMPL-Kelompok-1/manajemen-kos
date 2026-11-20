"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  /** Kunci scroll body selama aktif. */
  lockScroll?: boolean;
  /** Kembalikan fokus ke elemen pemicu saat ditutup. */
  restoreFocus?: boolean;
};

// Fokus awal ke [data-autofocus] bila ada, selain itu ke field pertama.
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  { lockScroll = true, restoreFocus = true }: Options = {},
) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const trigger = document.activeElement as HTMLElement | null;
    const items = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const first = node.querySelector<HTMLElement>("[data-autofocus]") ?? items()[0] ?? node;
    if (first === node && !node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
    first.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const start = list[0];
      const end = list[list.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === start || !node!.contains(current))) {
        e.preventDefault();
        end.focus();
      } else if (!e.shiftKey && (current === end || !node!.contains(current))) {
        e.preventDefault();
        start.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      if (restoreFocus && trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };
  }, [active, ref, lockScroll, restoreFocus]);
}
