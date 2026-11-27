import {
  AmbientLight, BoxGeometry, Color, CylinderGeometry, Group, Mesh, MeshStandardMaterial,
  PlaneGeometry, PointLight, SpotLight, type World,
} from '@iwsdk/core';

const mat = (color: number, rough = 0.7, metal = 0) => new MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const CHARCOAL = mat(0x23252a, 0.9);
const WOOD = mat(0x6b4a2f, 0.55);
const DARKWOOD = mat(0x3a2718, 0.5);
const GOLD = mat(0xc9a24a, 0.35, 0.8);
const FELT = mat(0x2f3138, 1);

function box(w: number, h: number, d: number, m: MeshStandardMaterial, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  return mesh;
}

/** Procedural studio built with Three primitives from the SDK (no external assets needed). */
export function buildStudio(world: World): Group {
  const g = new Group();
  g.name = 'melospace-studio';
  world.scene.background = new Color(0x15161a);

  // Floor and rug
  const floor = new Mesh(new PlaneGeometry(8, 8), DARKWOOD);
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const rug = new Mesh(new PlaneGeometry(3.2, 2.4), mat(0x3b3f4a, 1));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.004, -0.4);
  g.add(rug);

  // Back wall + side walls (charcoal) with acoustic slat panels
  g.add(box(8, 3, 0.1, CHARCOAL, 0, 1.5, -3));
  g.add(box(0.1, 3, 6, CHARCOAL, -4, 1.5, 0));
  g.add(box(0.1, 3, 6, CHARCOAL, 4, 1.5, 0));
  for (let i = -5; i <= 5; i++) {
    const slat = box(0.12, 1.6, 0.06, WOOD, i * 0.3, 1.55, -2.92);
    g.add(slat);
  }
  for (let i = 0; i < 6; i++) {
    g.add(box(0.06, 1.4, 0.12, WOOD, -3.92, 1.5, -1.8 + i * 0.5));
    g.add(box(0.06, 1.4, 0.12, WOOD, 3.92, 1.5, -1.8 + i * 0.5));
  }
  // Gold trim
  g.add(box(8, 0.03, 0.04, GOLD, 0, 0.9, -2.94));
  g.add(box(8, 0.03, 0.04, GOLD, 0, 2.3, -2.94));
  // Bass traps (corner cylinders)
  [-3.7, 3.7].forEach((x) => {
    const c = new Mesh(new CylinderGeometry(0.25, 0.25, 2.2, 20), FELT);
    c.position.set(x, 1.1, -2.7);
    g.add(c);
  });

  // Piano body (instrument sits in front of the user)
  const bodyY = 0.72;
  g.add(box(0.62, 0.05, 0.42, DARKWOOD, 0, bodyY - 0.03, -0.66));       // key bed
  g.add(box(0.66, 0.7, 0.2, DARKWOOD, 0, 0.35, -0.84));                 // cabinet
  g.add(box(0.66, 0.04, 0.5, WOOD, 0, 0.7, -0.74));                    // top rail
  g.add(box(0.7, 0.012, 0.03, GOLD, 0, bodyY + 0.02, -0.46));           // gold fall-board line
  for (const x of [-0.3, 0.3]) g.add(box(0.05, 0.7, 0.05, DARKWOOD, x, 0.35, -0.5)); // legs
  // Stool (seated layout)
  const stool = new Mesh(new CylinderGeometry(0.2, 0.2, 0.06, 24), WOOD);
  stool.position.set(0, 0.5, 0.45);
  g.add(stool);
  const stoolLeg = new Mesh(new CylinderGeometry(0.03, 0.03, 0.47, 12), GOLD);
  stoolLeg.position.set(0, 0.25, 0.45);
  g.add(stoolLeg);

  // Warm lighting
  g.add(new AmbientLight(0xffe8c8, 0.55));
  const key = new SpotLight(0xffd9a0, 18, 7, Math.PI / 4, 0.5, 1.5);
  key.position.set(0, 2.6, 0.2);
  key.target.position.set(0, 0.8, -0.7);
  g.add(key, key.target);
  [-1.6, 1.6].forEach((x) => {
    const p = new PointLight(0xffb870, 3, 5, 2);
    p.position.set(x, 2.1, -2.4);
    g.add(p);
  });

  world.scene.add(g);
  return g;
}
