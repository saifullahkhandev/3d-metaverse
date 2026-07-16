import type { Ref } from "react";
import type { Group, Mesh } from "three";
import { COL } from "./world-data";

type AvatarProps = {
  /** Shirt/body colour (hex int). */
  shirt: number;
  /** Skin colour (hex int). */
  skin?: number;
  /** Ref to the outer transform group (world position + facing). */
  groupRef?: Ref<Group>;
  /** Ref to the body mesh, for the walk-tilt animation. */
  bodyRef?: Ref<Mesh>;
};

/**
 * Low-poly primitive avatar, ported from the prototype's `makeAvatar`.
 * The nose sphere marks the facing direction. The outer group is positioned and
 * rotated by the caller (local player controller or, later, remote peers).
 */
export function Avatar({
  shirt,
  skin = COL.skin,
  groupRef,
  bodyRef,
}: AvatarProps) {
  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.75, 0]} ref={bodyRef}>
        <cylinderGeometry args={[0.42, 0.5, 1, 16]} />
        <meshStandardMaterial color={shirt} metalness={0} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshStandardMaterial color={skin} metalness={0} roughness={0.9} />
      </mesh>
      {/* hair cap */}
      <mesh castShadow position={[0, 1.72, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.44, 18, 18]} />
        <meshStandardMaterial
          color={0x3a_2b_22}
          metalness={0}
          roughness={0.9}
        />
      </mesh>
      {/* feet */}
      <mesh castShadow position={[-0.2, 0.09, 0.05]}>
        <boxGeometry args={[0.24, 0.18, 0.34]} />
        <meshStandardMaterial
          color={COL.woodDark}
          metalness={0}
          roughness={0.9}
        />
      </mesh>
      <mesh castShadow position={[0.2, 0.09, 0.05]}>
        <boxGeometry args={[0.24, 0.18, 0.34]} />
        <meshStandardMaterial
          color={COL.woodDark}
          metalness={0}
          roughness={0.9}
        />
      </mesh>
      {/* nose — points the way the avatar faces */}
      <mesh castShadow position={[0, 1.5, 0.4]}>
        <sphereGeometry args={[0.09, 18, 18]} />
        <meshStandardMaterial color={skin} metalness={0} roughness={0.9} />
      </mesh>
    </group>
  );
}
