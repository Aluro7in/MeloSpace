import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, PokeInteractable, RayInteractable, type Entity, type World } from '@iwsdk/core';
import { PIANO_KEYS, type PianoKeyDef } from '../music/notes';
import type { PianoInput } from '../music/piano-input';

const WHITE_W = 0.058, WHITE_GAP = 0.003, WHITE_L = 0.2, WHITE_H = 0.025;
const BLACK_W = 0.034, BLACK_L = 0.12, BLACK_H = 0.03;
export const KEYBOARD_ORIGIN = { x: 0, y: 0.75, z: -0.55 };

interface KeyView { def: PianoKeyDef; mesh: Mesh; entity: Entity; baseY: number; base: Color; mat: MeshStandardMaterial; pressed: boolean; highlighted: boolean }

/** 13 individually interactive 3D keys. Pointer events (ray / gaze+pinch / poke) -> PianoInput. */
export class PianoView {
  readonly group = new Group();
  private keys = new Map<string, KeyView>();

  constructor(world: World, private input: PianoInput) {
    this.group.name = 'piano-keys';
    this.group.position.set(KEYBOARD_ORIGIN.x, KEYBOARD_ORIGIN.y, KEYBOARD_ORIGIN.z);
    this.group.rotation.x = -0.12; // slight tilt toward the seated player
    const groupEntity = world.createTransformEntity(this.group);
    const totalW = 8 * (WHITE_W + WHITE_GAP);
    const x0 = -totalW / 2 + WHITE_W / 2;

    for (const def of PIANO_KEYS) {
      const black = def.isBlack;
      const m = new MeshStandardMaterial({ color: black ? 0x111114 : 0xf3efe6, roughness: black ? 0.35 : 0.5 });
      const mesh = new Mesh(new BoxGeometry(black ? BLACK_W : WHITE_W, black ? BLACK_H : WHITE_H, black ? BLACK_L : WHITE_L), m);
      mesh.name = def.id;
      const wx = x0 + def.whiteIndex * (WHITE_W + WHITE_GAP);
      const x = black ? wx + (WHITE_W + WHITE_GAP) / 2 : wx;
      const y = black ? BLACK_H / 2 + 0.014 : WHITE_H / 2;
      const z = black ? -(WHITE_L - BLACK_L) / 2 : 0;
      mesh.position.set(x, y, z);

      const entity = world.createTransformEntity(mesh, groupEntity);
      entity.addComponent(RayInteractable);
      entity.addComponent(PokeInteractable);
      const kv: KeyView = { def, mesh, entity, baseY: y, base: m.color.clone(), mat: m, pressed: false, highlighted: false };
      this.keys.set(def.id, kv);

      const pid = (e: any) => (typeof e?.pointerId === 'number' ? e.pointerId : 0);
      mesh.addEventListener('pointerdown' as any, (e: any) => { e.stopPropagation?.(); this.input.press(def.id, pid(e)); });
      mesh.addEventListener('pointerup' as any, (e: any) => this.input.release(pid(e)));
      mesh.addEventListener('pointerleave' as any, (e: any) => this.input.release(pid(e)));
      mesh.addEventListener('pointercancel' as any, (e: any) => this.input.release(pid(e)));
    }
  }

  setPressed(keyId: string, pressed: boolean) {
    const k = this.keys.get(keyId);
    if (!k) return;
    k.pressed = pressed;
    this.refresh(k);
  }

  setHighlighted(notes: string[]) {
    for (const k of this.keys.values()) {
      k.highlighted = notes.includes(k.def.note);
      this.refresh(k);
    }
  }

  private refresh(k: KeyView) {
    k.mesh.position.y = k.baseY - (k.pressed ? 0.008 : 0);
    if (k.pressed) k.mat.color.setHex(0xc9a24a);
    else if (k.highlighted) k.mat.color.setHex(0x4fc3f7);
    else k.mat.color.copy(k.base);
    k.mat.emissive.setHex(k.highlighted && !k.pressed ? 0x0a4a66 : 0x000000);
  }

  get keyIds() { return [...this.keys.keys()]; }
}
