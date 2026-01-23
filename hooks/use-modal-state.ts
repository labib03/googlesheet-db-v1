"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useModalState(modalKey: string, id?: string | number) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isOpen = useMemo(() => {
    const modalParam = searchParams.get("modal");
    if (modalParam !== modalKey) return false;
    
    if (id !== undefined) {
      return searchParams.get("id") === String(id);
    }
    
    return true;
  }, [searchParams, modalKey, id]);

  const open = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", modalKey);
    if (id !== undefined) {
      params.set("id", String(id));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, modalKey, id]);

  const close = useCallback(() => {
    // If the modal is currently open in the URL, go back to previous history state
    // This allows the browser "back" button to essentially be "close"
    if (searchParams.get("modal") === modalKey) {
      router.back();
    }
  }, [router, searchParams, modalKey]);

  const onOpenChange = useCallback((openState: boolean) => {
    if (openState) {
      open();
    } else {
      close();
    }
  }, [open, close]);

  return { isOpen, open, close, onOpenChange };
}
