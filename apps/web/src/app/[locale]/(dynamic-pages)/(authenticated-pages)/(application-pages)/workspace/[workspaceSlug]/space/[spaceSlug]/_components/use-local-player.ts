import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import { type Collider, collidesAt, type SpaceControls } from "./world-data";

const MOVE_SPEED = 6.2;
const MAX_DELTA = 0.05;
const WALK_BOB = 0.08;
const WALK_TILT = 0.05;
const TURN_LERP = 0.2;
const MOVEMENT_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  " ",
]);

function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) {
    d -= 2 * Math.PI;
  }
  while (d < -Math.PI) {
    d += 2 * Math.PI;
  }
  return a + d * t;
}

type LocalPlayerArgs = {
  playerRef: RefObject<Group | null>;
  bodyRef: RefObject<Mesh | null>;
  controlsRef: RefObject<SpaceControls>;
  colliders: Collider[];
  spawn: { x: number; z: number };
  boundary: number;
};

/**
 * Camera-relative WASD/arrow movement with per-axis circle-vs-AABB collision,
 * plus a subtle walk bob. Ported from the prototype's movement block. Mutates
 * the player group's transform directly each frame (no React state churn).
 */
export function useLocalPlayer({
  playerRef,
  bodyRef,
  controlsRef,
  colliders,
  spawn,
  boundary,
}: LocalPlayerArgs): void {
  const keys = useRef<Record<string, boolean>>({});
  const walkPhase = useRef(0);
  const spawned = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "INPUT") {
        return;
      }
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (MOVEMENT_KEYS.has(k)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    if (!spawned.current) {
      player.position.set(spawn.x, 0, spawn.z);
      spawned.current = true;
    }

    const dt = Math.min(rawDelta, MAX_DELTA);
    const pressed = keys.current;

    let ix = 0;
    let iz = 0;
    if (pressed.w || pressed.arrowup) {
      iz -= 1;
    }
    if (pressed.s || pressed.arrowdown) {
      iz += 1;
    }
    if (pressed.a || pressed.arrowleft) {
      ix -= 1;
    }
    if (pressed.d || pressed.arrowright) {
      ix += 1;
    }
    const moving = ix !== 0 || iz !== 0;

    // Camera-relative basis from the current yaw.
    const yaw = controlsRef.current.camYaw;
    const fwdX = Math.sin(yaw);
    const fwdZ = Math.cos(yaw);
    // right = (fwd.z, -fwd.x)
    let moveX = fwdX * -iz + fwdZ * ix;
    let moveZ = fwdZ * -iz - fwdX * ix;
    const len = Math.hypot(moveX, moveZ);

    if (len > 0) {
      moveX /= len;
      moveZ /= len;
      const step = MOVE_SPEED * dt;
      const nx = player.position.x + moveX * step;
      const nz = player.position.z + moveZ * step;
      if (
        !collidesAt(colliders, nx, player.position.z) &&
        Math.abs(nx) < boundary
      ) {
        player.position.x = nx;
      }
      if (
        !collidesAt(colliders, player.position.x, nz) &&
        Math.abs(nz) < boundary
      ) {
        player.position.z = nz;
      }
      const targetRot = Math.atan2(moveX, moveZ);
      player.rotation.y = lerpAngle(player.rotation.y, targetRot, TURN_LERP);
      walkPhase.current += dt * 10;
    } else {
      walkPhase.current *= 0.8;
    }

    const bob = moving ? 1 : 0;
    player.position.y = Math.abs(Math.sin(walkPhase.current)) * WALK_BOB * bob;
    const body = bodyRef.current;
    if (body) {
      body.rotation.z = Math.sin(walkPhase.current) * WALK_TILT * bob;
    }
  });
}
