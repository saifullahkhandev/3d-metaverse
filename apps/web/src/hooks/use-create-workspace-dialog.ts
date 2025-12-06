"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Hook to manage the open/close state of the create workspace dialog.
 * Uses URL search params to sync state across components without context.
 */
export function useCreateWorkspaceDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("create-workspace") === "open";

  const setIsOpen = useCallback(
    (open: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (open) {
        params.set("create-workspace", "open");
      } else {
        params.delete("create-workspace");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const openDialog = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeDialog = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleDialog = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen]
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}
