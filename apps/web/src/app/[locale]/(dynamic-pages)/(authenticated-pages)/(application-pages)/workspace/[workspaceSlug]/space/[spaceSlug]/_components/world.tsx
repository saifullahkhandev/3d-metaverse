import { Html } from "@react-three/drei";
import { DoubleSide } from "three";
import {
  COL,
  hexColor,
  type MapData,
  type WorldObject,
  type Zone,
} from "./world-data";

const HALF_PI = Math.PI / 2;

/** Flat coloured floor tile, laid just above the grass (prototype `floorTile`). */
function FloorTile({
  x,
  z,
  w,
  d,
  color,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  color: number;
}) {
  return (
    <mesh position={[x, 0.02, z]} receiveShadow rotation={[-HALF_PI, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} side={DoubleSide} />
    </mesh>
  );
}

/** Boundary wall with a lighter capping strip (prototype `wall`). */
function Wall({
  cx,
  cz,
  w,
  d,
}: {
  cx: number;
  cz: number;
  w: number;
  d: number;
}) {
  return (
    <group position={[cx, 0, cz]}>
      <mesh castShadow position={[0, 1.1, 0]} receiveShadow>
        <boxGeometry args={[w, 2.2, d]} />
        <meshStandardMaterial color={COL.wall} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.35, 0]} receiveShadow>
        <boxGeometry args={[w + 0.3, 0.35, d + 0.3]} />
        <meshStandardMaterial color={COL.wallTop} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** A zone's floor ring, translucent disc and floating name label. */
function ZoneFloor({ zone }: { zone: Zone }) {
  return (
    <group>
      <mesh position={[zone.x, 0.04, zone.z]} rotation={[-HALF_PI, 0, 0]}>
        <ringGeometry args={[zone.r - 0.25, zone.r, 48]} />
        <meshStandardMaterial
          color={zone.color}
          emissive={zone.color}
          emissiveIntensity={0.15}
          roughness={0.6}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[zone.x, 0.035, zone.z]} rotation={[-HALF_PI, 0, 0]}>
        <circleGeometry args={[zone.r - 0.25, 48]} />
        <meshStandardMaterial
          color={zone.color}
          opacity={0.14}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <Html
        center
        distanceFactor={22}
        pointerEvents="none"
        position={[zone.x, 4.6, zone.z]}
      >
        <div
          style={{
            background: hexColor(zone.color),
            color: "#fff",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            padding: "3px 12px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {zone.name}
        </div>
      </Html>
    </group>
  );
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 1 * s, 0]} receiveShadow>
        <cylinderGeometry args={[0.35 * s, 0.45 * s, 2 * s, 8]} />
        <meshStandardMaterial color={COL.trunk} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.7 * s, 0]}>
        <sphereGeometry args={[1.5 * s, 18, 18]} />
        <meshStandardMaterial color={COL.leaf} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.8 * s, 2.2 * s, 0.4 * s]}>
        <sphereGeometry args={[1.1 * s, 18, 18]} />
        <meshStandardMaterial color={COL.leafDark} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.7 * s, 2.4 * s, -0.3 * s]}>
        <sphereGeometry args={[1 * s, 18, 18]} />
        <meshStandardMaterial color={COL.leaf} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Bush({ x, z }: { x: number; z: number }) {
  return (
    <mesh castShadow position={[x, 0.5, z]} scale={[1, 0.8, 1]}>
      <sphereGeometry args={[0.7, 18, 18]} />
      <meshStandardMaterial color={COL.leafDark} roughness={0.9} />
    </mesh>
  );
}

function Chair({
  x,
  z,
  rot,
  color,
}: {
  x: number;
  z: number;
  rot: number;
  color: number;
}) {
  const legs: Array<[number, number]> = [
    [-0.28, -0.28],
    [0.28, -0.28],
    [-0.28, 0.28],
    [0.28, 0.28],
  ];
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.85, -0.3]}>
        <boxGeometry args={[0.7, 0.7, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {legs.map(([lx, lz]) => (
        <mesh castShadow key={`${lx},${lz}`} position={[lx, 0.25, lz]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Table({
  x,
  z,
  r,
  color,
}: {
  x: number;
  z: number;
  r: number;
  color: number;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 1, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.16, 20]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 1, 10]} />
        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Rug({
  x,
  z,
  w,
  d,
  color,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  color: number;
}) {
  return (
    <mesh position={[x, 0.03, z]} receiveShadow rotation={[-HALF_PI, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={1} side={DoubleSide} />
    </mesh>
  );
}

function Counter({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.55, 0]} receiveShadow>
        <boxGeometry args={[5, 1.1, 1.4]} />
        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.3, 10]} />
        <meshStandardMaterial color={0xff_ff_ff} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Whiteboard({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[-2, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[2, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.1, 0]}>
        <boxGeometry args={[4.4, 2.2, 0.15]} />
        <meshStandardMaterial color={0xff_ff_ff} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Jukebox({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.6, 2.4, 1]} />
        <meshStandardMaterial color={COL.games} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.52]}>
        <boxGeometry args={[1.2, 0.9, 0.1]} />
        <meshStandardMaterial
          color={0x2a_1f_3a}
          emissive={0x5b_3a_8f}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

function Arcade({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[1.2, 2.2, 1.1]} />
        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.55]}>
        <boxGeometry args={[0.9, 0.9, 0.1]} />
        <meshStandardMaterial
          color={0x22_33_44}
          emissive={0x22_88_aa}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function Bench({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.4, 0.15, 0.7]} />
        <meshStandardMaterial color={COL.wood} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.9, -0.3]}>
        <boxGeometry args={[2.4, 0.6, 0.12]} />
        <meshStandardMaterial color={COL.wood} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Fountain({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.5, 24]} />
        <meshStandardMaterial color={0xdc_d3_c4} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[-HALF_PI, 0, 0]}>
        <circleGeometry args={[2.1, 32]} />
        <meshStandardMaterial
          color={COL.water}
          emissive={COL.water}
          emissiveIntensity={0.12}
          metalness={0.1}
          opacity={0.85}
          roughness={0.2}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.4, 14]} />
        <meshStandardMaterial color={0xdc_d3_c4} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.9, 0.5, 0.3, 16]} />
        <meshStandardMaterial color={0xdc_d3_c4} roughness={0.9} />
      </mesh>
    </group>
  );
}

function SceneObject({ obj }: { obj: WorldObject }) {
  switch (obj.type) {
    case "tree":
      return <Tree s={obj.s} x={obj.x} z={obj.z} />;
    case "bush":
      return <Bush x={obj.x} z={obj.z} />;
    case "chair":
      return <Chair color={obj.color} rot={obj.rot} x={obj.x} z={obj.z} />;
    case "table":
      return <Table color={obj.color} r={obj.r} x={obj.x} z={obj.z} />;
    case "rug":
      return <Rug color={obj.color} d={obj.d} w={obj.w} x={obj.x} z={obj.z} />;
    case "counter":
      return <Counter x={obj.x} z={obj.z} />;
    case "whiteboard":
      return <Whiteboard x={obj.x} z={obj.z} />;
    case "jukebox":
      return <Jukebox x={obj.x} z={obj.z} />;
    case "arcade":
      return <Arcade rot={obj.rot} x={obj.x} z={obj.z} />;
    case "bench":
      return <Bench rot={obj.rot} x={obj.x} z={obj.z} />;
    case "fountain":
      return <Fountain x={obj.x} z={obj.z} />;
    default:
      return null;
  }
}

/** The whole static room: ground, floor tiles, walls, zones and props. */
export function World({ map }: { map: MapData }) {
  return (
    <group>
      <mesh receiveShadow rotation={[-HALF_PI, 0, 0]}>
        <planeGeometry args={[map.worldSize, map.worldSize]} />
        <meshStandardMaterial color={COL.grass} roughness={1} />
      </mesh>

      {map.floorTiles.map((tile) => (
        <FloorTile
          color={tile.color}
          d={tile.d}
          key={`tile-${tile.x}-${tile.z}`}
          w={tile.w}
          x={tile.x}
          z={tile.z}
        />
      ))}

      {map.walls.map((wall) => (
        <Wall
          cx={wall.cx}
          cz={wall.cz}
          d={wall.d}
          key={`wall-${wall.cx}-${wall.cz}`}
          w={wall.w}
        />
      ))}

      {map.zones.map((zone) => (
        <ZoneFloor key={zone.key} zone={zone} />
      ))}

      {map.objects.map((obj, i) => (
        <SceneObject key={`obj-${obj.type}-${obj.x}-${obj.z}-${i}`} obj={obj} />
      ))}
    </group>
  );
}
