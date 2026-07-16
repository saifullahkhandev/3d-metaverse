import type { ReactNode } from "react";

/**
 * Full-viewport layout for a space. The R3F canvas needs the whole screen, so
 * this fixed overlay sits above the workspace sidebar/navbar chrome rather than
 * rendering inside it.
 */
export default function SpaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0e1020]">
      {children}
    </div>
  );
}
