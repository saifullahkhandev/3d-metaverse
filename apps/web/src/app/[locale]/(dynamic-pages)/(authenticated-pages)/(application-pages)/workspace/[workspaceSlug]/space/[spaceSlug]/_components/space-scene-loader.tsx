"use client";

import dynamic from "next/dynamic";

/**
 * Client-only boundary for the R3F canvas. WebGL and `window` access must never
 * run during server render, so the scene is imported with `ssr: false`.
 */
const SpaceScene = dynamic(
  () => import("./space-scene").then((m) => m.SpaceScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 to-sky-200">
        <div className="text-center text-slate-600">
          <div className="font-semibold text-lg text-slate-800">Commons</div>
          <div className="mt-1 text-sm">Warming up the world…</div>
        </div>
      </div>
    ),
  }
);

export function SpaceSceneLoader({
  spaceName,
  playerName,
}: {
  spaceName: string;
  playerName: string;
}) {
  return <SpaceScene playerName={playerName} spaceName={spaceName} />;
}
