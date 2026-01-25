"use client";

import { useState, useCallback } from "react";

/**
 * useModalState - Simple local state management for modals.
 * Following user request to stop using URL parameters for modal state.
 */
export function useModalState() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false); // Can be manually set if needed during actions

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOpenChange = useCallback((openState: boolean) => {
    setIsOpen(openState);
  }, []);

  return { 
    isOpen, 
    isPending, 
    setPending: setIsPending,
    open, 
    close, 
    onOpenChange 
  };
}
