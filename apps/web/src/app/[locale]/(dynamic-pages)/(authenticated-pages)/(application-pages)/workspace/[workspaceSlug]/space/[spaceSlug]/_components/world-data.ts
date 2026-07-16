/**
 * Static map definition for Phase 0 of Spaces ("Commons").
 *
 * Ported from the standalone prototype at `docs/prototype/metaverse.html`:
 * geometry, zone layout, spawn point and the circle-vs-AABB collider list.
 * In Phase 1 this same shape is what `spaces.map_data` (jsonb) will hold, so it
 * is kept as plain serialisable data rather than imperative Three.js calls.
 */

/** Palette (hex ints), matching the prototype's `COL`. */
export const COL = {
  grass: 0x9d_c8_8b,
  path: 0xf0_e6_d2,
  plaza: 0xf6_ed_e0,
  wall: 0xf3_de_d0,
  wallTop: 0xe9_cb_b8,
  wood: 0xca_a4_76,
  woodDark: 0xa0_7d_54,
  water: 0x7f_c4_d6,
  leaf: 0x7b_bf_7a,
  leafDark: 0x5a_a0_65,
  trunk: 0x9a_6b_45,
  meeting: 0x5b_8d_ef,
  cafe: 0xf0_a9_4b,
  games: 0xa0_6f_e0,
  garden: 0x59_b8_7e,
  coral: 0xef_6f_5b,
  skin: 0xf3_c9_a6,
} as const;

export type Zone = {
  key: string;
  name: string;
  color: number;
  x: number;
  z: number;
  r: number;
  desc: string;
};

export type FloorTile = {
  x: number;
  z: number;
  w: number;
  d: number;
  color: number;
};

export type Wall = { cx: number; cz: number; w: number; d: number };

export type WorldObject =
  | { type: "tree"; x: number; z: number; s: number }
  | { type: "bush"; x: number; z: number }
  | { type: "chair"; x: number; z: number; rot: number; color: number }
  | { type: "table"; x: number; z: number; r: number; color: number }
  | { type: "rug"; x: number; z: number; w: number; d: number; color: number }
  | { type: "counter"; x: number; z: number }
  | { type: "whiteboard"; x: number; z: number }
  | { type: "jukebox"; x: number; z: number }
  | { type: "arcade"; x: number; z: number; rot: number }
  | { type: "bench"; x: number; z: number; rot: number }
  | { type: "fountain"; x: number; z: number };

export type Collider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type MapData = {
  /** Full ground plane extent (prototype `WORLD`). */
  worldSize: number;
  /** Axis-aligned movement limit (prototype `lim`). */
  boundary: number;
  spawn: { x: number; z: number };
  floorTiles: FloorTile[];
  walls: Wall[];
  zones: Zone[];
  objects: WorldObject[];
};

const WORLD = 60;
const WALL_HALF = 29.5;
const WALL_THICKNESS = 1;

// Six chairs ringed around the meeting-hall table.
const MEETING_CHAIRS: WorldObject[] = Array.from({ length: 6 }, (_, i) => {
  const angle = (i / 6) * Math.PI * 2;
  return {
    type: "chair",
    x: -16 + Math.cos(angle) * 3,
    z: -14 + Math.sin(angle) * 3,
    rot: -angle + Math.PI / 2,
    color: COL.meeting,
  };
});

export const DEFAULT_MAP: MapData = {
  worldSize: WORLD,
  boundary: 28.5,
  spawn: { x: 0, z: 7 },
  floorTiles: [
    { x: 0, z: 0, w: 20, d: 20, color: COL.plaza }, // central plaza
    { x: 0, z: -19, w: 7, d: 20, color: COL.path }, // path north
    { x: 0, z: 19, w: 7, d: 20, color: COL.path }, // path south
    { x: -19, z: 0, w: 20, d: 7, color: COL.path }, // path west
    { x: 19, z: 0, w: 20, d: 7, color: COL.path }, // path east
  ],
  walls: [
    { cx: 0, cz: -WALL_HALF, w: WORLD, d: WALL_THICKNESS },
    { cx: 0, cz: WALL_HALF, w: WORLD, d: WALL_THICKNESS },
    { cx: -WALL_HALF, cz: 0, w: WALL_THICKNESS, d: WORLD },
    { cx: WALL_HALF, cz: 0, w: WALL_THICKNESS, d: WORLD },
  ],
  zones: [
    {
      key: "meeting",
      name: "Meeting Hall",
      color: COL.meeting,
      x: -16,
      z: -14,
      r: 8.5,
      desc: "A round table for focused conversation. Step in to gather the group.",
    },
    {
      key: "cafe",
      name: "The Café",
      color: COL.cafe,
      x: 16,
      z: -14,
      r: 8.5,
      desc: "Coffee, small tables, low chatter. Best place to bump into people.",
    },
    {
      key: "games",
      name: "Arcade",
      color: COL.games,
      x: 16,
      z: 15,
      r: 8.5,
      desc: "A jukebox and a couple of machines. Loosen up between meetings.",
    },
    {
      key: "garden",
      name: "Quiet Garden",
      color: COL.garden,
      x: -16,
      z: 15,
      r: 8.5,
      desc: "Trees, a bench, and a fountain. A calm spot to step away.",
    },
  ],
  objects: [
    // meeting hall
    { type: "rug", x: -16, z: -14, w: 10, d: 10, color: 0xdf_e6_f2 },
    { type: "table", x: -16, z: -14, r: 1.9, color: COL.wood },
    ...MEETING_CHAIRS,
    { type: "whiteboard", x: -16, z: -20.5 },
    // café
    { type: "rug", x: 16, z: -14, w: 10, d: 10, color: 0xf6_e3_c8 },
    { type: "table", x: 13.5, z: -15, r: 1, color: COL.wood },
    { type: "chair", x: 13.5, z: -13.3, rot: Math.PI, color: COL.cafe },
    { type: "chair", x: 13.5, z: -16.7, rot: 0, color: COL.cafe },
    { type: "table", x: 18.5, z: -13, r: 1, color: COL.wood },
    { type: "chair", x: 18.5, z: -11.3, rot: Math.PI, color: COL.cafe },
    { type: "chair", x: 18.5, z: -14.7, rot: 0, color: COL.cafe },
    { type: "counter", x: 16, z: -19 },
    // arcade
    { type: "rug", x: 16, z: 15, w: 10, d: 10, color: 0xea_dc_f7 },
    { type: "jukebox", x: 19, z: 18.5 },
    { type: "arcade", x: 12.5, z: 18.5, rot: 0 },
    { type: "arcade", x: 15, z: 18.8, rot: 0.3 },
    // garden
    { type: "tree", x: -20, z: 11, s: 1.2 },
    { type: "tree", x: -12, z: 19, s: 1 },
    { type: "tree", x: -21, z: 19, s: 0.9 },
    { type: "tree", x: -11, z: 11, s: 0.8 },
    { type: "bush", x: -16, z: 11 },
    { type: "bush", x: -19, z: 15 },
    { type: "bush", x: -13, z: 16 },
    { type: "bench", x: -16, z: 16.5, rot: Math.PI },
    // central landmark
    { type: "fountain", x: 0, z: 0 },
    // scattered trees around the plaza edges
    { type: "tree", x: -24, z: -24, s: 1.1 },
    { type: "tree", x: 24, z: -24, s: 1 },
    { type: "tree", x: 24, z: 24, s: 1.1 },
    { type: "tree", x: -24, z: 24, s: 1 },
    { type: "tree", x: 0, z: -26, s: 1 },
    { type: "tree", x: 0, z: 26, s: 1 },
    { type: "tree", x: -26, z: 0, s: 0.9 },
    { type: "tree", x: 26, z: 0, s: 0.9 },
  ],
};

/** Player collision radius (prototype `PR`). */
export const PLAYER_RADIUS = 0.5;

function aabb(cx: number, cz: number, w: number, d: number): Collider {
  return {
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
  };
}

/**
 * Build the flat collider list from a map, mirroring the prototype's
 * `addCollider(cx, cz, w, d)` calls. Purely decorative props (chairs, bushes,
 * rugs) have no collider, exactly as in the prototype.
 */
export function buildColliders(map: MapData): Collider[] {
  const colliders: Collider[] = [];
  for (const wall of map.walls) {
    colliders.push(aabb(wall.cx, wall.cz, wall.w, wall.d));
  }
  for (const obj of map.objects) {
    switch (obj.type) {
      case "tree":
        colliders.push(aabb(obj.x, obj.z, 1.2 * obj.s, 1.2 * obj.s));
        break;
      case "table":
        colliders.push(aabb(obj.x, obj.z, obj.r * 1.6, obj.r * 1.6));
        break;
      case "whiteboard":
        colliders.push(aabb(obj.x, obj.z, 4.4, 0.6));
        break;
      case "counter":
        colliders.push(aabb(obj.x, obj.z, 5, 1.4));
        break;
      case "jukebox":
        colliders.push(aabb(obj.x, obj.z, 1.6, 1));
        break;
      case "arcade":
        colliders.push(aabb(obj.x, obj.z, 1.2, 1.1));
        break;
      case "bench":
        colliders.push(aabb(obj.x, obj.z, 2.4, 0.7));
        break;
      case "fountain":
        colliders.push(aabb(obj.x, obj.z, 4.6, 4.6));
        break;
      default:
        break;
    }
  }
  return colliders;
}

/**
 * Circle-vs-AABB test: is a player of `PLAYER_RADIUS` at (x, z) overlapping any
 * collider? Matches the prototype's `collides()` (AABB inflated by the radius).
 */
export function collidesAt(
  colliders: Collider[],
  x: number,
  z: number,
  radius = PLAYER_RADIUS
): boolean {
  for (const c of colliders) {
    if (
      x > c.minX - radius &&
      x < c.maxX + radius &&
      z > c.minZ - radius &&
      z < c.maxZ + radius
    ) {
      return true;
    }
  }
  return false;
}

/** Shared, mutable camera-control state written by the rig, read by movement. */
export type SpaceControls = { camYaw: number; camDist: number };

export function hexColor(n: number): string {
  return `#${n.toString(16).padStart(6, "0")}`;
}
