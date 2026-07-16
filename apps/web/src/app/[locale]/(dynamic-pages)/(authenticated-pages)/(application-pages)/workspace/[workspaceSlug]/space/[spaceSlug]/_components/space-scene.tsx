"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { Color, PCFSoftShadowMap } from "three";
import { Avatar } from "./avatar";
import { CameraRig } from "./camera-rig";
import { useLocalPlayer } from "./use-local-player";
import { World } from "./world";
import {
  buildColliders,
  COL,
  DEFAULT_MAP,
  type MapData,
  type SpaceControls,
} from "./world-data";

type SpaceSceneProps = {
  spaceName: string;
  playerName: string;
  map?: MapData;
};

type PlayerProps = {
  playerRef: React.RefObject<Group | null>;
  bodyRef: React.RefObject<Mesh | null>;
  controlsRef: React.RefObject<SpaceControls>;
  map: MapData;
};

function Player({ playerRef, bodyRef, controlsRef, map }: PlayerProps) {
  const colliders = useMemo(() => buildColliders(map), [map]);
  useLocalPlayer({
    playerRef,
    bodyRef,
    controlsRef,
    colliders,
    spawn: map.spawn,
    boundary: map.boundary,
  });
  return <Avatar bodyRef={bodyRef} groupRef={playerRef} shirt={COL.coral} />;
}

export function SpaceScene({
  spaceName,
  playerName,
  map = DEFAULT_MAP,
}: SpaceSceneProps) {
  const playerRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const controlsRef = useRef<SpaceControls>({ camYaw: 0, camDist: 20 });

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 300, position: [0, 15, 26] }}
        dpr={[1, 2]}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
          scene.background = new Color(0xbf_e0_e6);
        }}
        shadows
      >
        <fog args={[0xcf_e4_e6, 55, 105]} attach="fog" />
        <hemisphereLight
          args={[0xff_e9_c8, 0x8a_9a_7a, 0.85]}
          position={[0, 50, 0]}
        />
        <directionalLight
          castShadow
          color={0xff_f0_d6}
          intensity={1.15}
          position={[24, 40, 18]}
          shadow-bias={-0.0004}
          shadow-camera-bottom={-50}
          shadow-camera-far={140}
          shadow-camera-left={-50}
          shadow-camera-near={1}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <ambientLight color={0xff_ff_ff} intensity={0.18} />

        <World map={map} />
        <Player
          bodyRef={bodyRef}
          controlsRef={controlsRef}
          map={map}
          playerRef={playerRef}
        />
        <CameraRig controlsRef={controlsRef} playerRef={playerRef} />
      </Canvas>

      <div className="pointer-events-none absolute top-4 left-4 select-none rounded-2xl bg-white/80 px-4 py-3 text-slate-700 text-sm shadow-lg backdrop-blur">
        <div className="font-semibold text-slate-900">{spaceName}</div>
        <div className="mt-0.5 text-slate-500 text-xs">
          you are {playerName}
        </div>
      </div>

      <div className="-translate-x-1/2 pointer-events-none absolute bottom-4 left-1/2 flex select-none items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 text-slate-600 text-xs shadow-lg backdrop-blur">
        <span>
          <kbd className="font-semibold">WASD</kbd> move
        </span>
        <span className="text-slate-300">·</span>
        <span>
          <kbd className="font-semibold">drag</kbd> look
        </span>
        <span className="text-slate-300">·</span>
        <span>
          <kbd className="font-semibold">scroll</kbd> zoom
        </span>
      </div>
    </div>
  );
}
