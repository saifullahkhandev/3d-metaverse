import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect } from "react";
import type { Group } from "three";
import { Vector3 } from "three";
import type { SpaceControls } from "./world-data";

const DRAG_SPEED = 0.006;
const ZOOM_SPEED = 0.02;
const MIN_DIST = 11;
const MAX_DIST = 34;
const HEIGHT_RATIO = 0.72;
const FOLLOW_LERP = 0.12;
const LOOK_HEIGHT = 1.2;

type CameraRigProps = {
  playerRef: RefObject<Group | null>;
  controlsRef: RefObject<SpaceControls>;
};

/**
 * Orbit-yaw + zoom follow camera, ported from the prototype. Pointer drag
 * rotates the yaw, wheel adjusts distance, and the camera lerps to a position
 * behind the player each frame. Writes into the shared `controlsRef` so the
 * movement hook can resolve camera-relative input.
 */
export function CameraRig({ playerRef, controlsRef }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const domElement = useThree((s) => s.gl.domElement);

  useEffect(() => {
    let dragging = false;
    let lastX = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        controlsRef.current.camYaw -= (e.clientX - lastX) * DRAG_SPEED;
        lastX = e.clientX;
      }
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = controlsRef.current.camDist + e.deltaY * ZOOM_SPEED;
      controlsRef.current.camDist = Math.max(
        MIN_DIST,
        Math.min(MAX_DIST, next)
      );
    };

    domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      domElement.removeEventListener("wheel", onWheel);
    };
  }, [domElement, controlsRef]);

  const target = new Vector3();
  useFrame(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const { camYaw, camDist } = controlsRef.current;
    const p = player.position;
    target.set(
      p.x - Math.sin(camYaw) * camDist,
      camDist * HEIGHT_RATIO,
      p.z - Math.cos(camYaw) * camDist
    );
    camera.position.lerp(target, FOLLOW_LERP);
    camera.lookAt(p.x, p.y + LOOK_HEIGHT, p.z);
  });

  return null;
}
