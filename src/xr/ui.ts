import { PokeInteractable, RayInteractable, UIKit, type World } from '@iwsdk/core';
import type { Destination, AppState } from '../app/store';
import { LESSONS, getLesson } from '../lesson/lessons';

const { Container, Text } = UIKit;
const PX = 0.0016; // metres per UI pixel => 600px panel = 0.96 m
const C = { bg: 0x1c1d22, panel: 0x26282f, btn: 0x3a3d47, hover: 0x535766, gold: 0xc9a24a, text: 0xf4f1ea, dim: 0xb4b0a6, ok: 0x6fcf97, warn: 0xf2994a, active: 0x7a5f1f, disabled: 0x2c2e35 };

export interface UIActions {
  navigate(d: Destination): void;
  startLesson(id: string): void;
  playReference(): void;
  startPractice(): void;
  stopPractice(): void;
  setVolume(v: number): void;
  setTempo(bpm: number): void;
  toggleMetronome(): void;
  tutorPrompt(text: string): void;
  enterXR(): void;
  exitXR(): void;
  isXR(): boolean;
}

type AnyC = InstanceType<typeof Container>;
type AnyT = InstanceType<typeof Text>;

function panel(w: number, extra: Record<string, unknown> = {}) {
  return new Container({ pixelSize: PX, width: w, flexDirection: 'column', gap: 10, padding: 18, backgroundColor: C.panel, borderRadius: 24, borderWidth: 2, borderColor: C.gold, ...extra } as any);
}
function label(text: string, size = 26, color: number = C.text, extra: Record<string, unknown> = {}) {
  return new Text({ text, fontSize: size, color, ...extra } as any);
}
function button(text: string, onClick: () => void, extra: Record<string, unknown> = {}) {
  const b = new Container({ paddingX: 18, paddingY: 12, borderRadius: 14, backgroundColor: C.btn, hover: { backgroundColor: C.hover }, active: { backgroundColor: C.gold }, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', onClick, ...extra } as any);
  const t = label(text, 26);
  b.add(t);
  return { b, t };
}
const row = (gap = 10, extra: Record<string, unknown> = {}) => new Container({ flexDirection: 'row', gap, flexWrap: 'wrap', alignItems: 'center', ...extra } as any);
const col = (gap = 8, extra: Record<string, unknown> = {}) => new Container({ flexDirection: 'column', gap, ...extra } as any);
const show = (c: AnyC, on: boolean) => (c as any).setProperties({ display: on ? 'flex' : 'none' });

/** Spatial UI built with UIKit (the UI layer bundled with IWSDK). Every control calls a real action. */
export class StudioUI {
  private navBtns = new Map<Destination, AnyC>();
  private pages = new Map<Destination, AnyC>();
  private texts: Record<string, AnyT> = {};
  private lessonList!: AnyC;
  private lessonDetail!: AnyC;
  private beatDots: AnyC[] = [];
  private progressList!: AnyC;
  readonly roots: AnyC[] = [];

  constructor(private world: World, private a: UIActions) {
    this.buildNav();
    this.buildContent();
    this.buildControls();
    this.buildTutor();
  }

  private place(root: AnyC, x: number, y: number, z: number, ry = 0, rx = 0) {
    (root as any).position.set(x, y, z);
    (root as any).rotation.set(rx, ry, 0);
    const e = this.world.createTransformEntity(root as any);
    e.addComponent(RayInteractable);
    e.addComponent(PokeInteractable);
    this.roots.push(root);
  }

  private buildNav() {
    const nav = panel(760, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12 });
    (['studio', 'learn', 'play', 'create', 'progress'] as Destination[]).forEach((d) => {
      const { b } = button(d[0].toUpperCase() + d.slice(1), () => this.a.navigate(d), { width: 130 });
      this.navBtns.set(d, b);
      nav.add(b);
    });
    const xr = button('Enter VR', () => (this.a.isXR() ? this.a.exitXR() : this.a.enterXR()), { width: 190, backgroundColor: C.active });
    this.texts.xr = xr.t;
    nav.add(xr.b);
    this.place(nav, 0, 1.74, -1.0, 0, -0.18);
  }

  private buildContent() {
    const content = panel(780, { minHeight: 330 });
    this.texts.title = label('MeloSpace', 36, C.gold);
    content.add(this.texts.title);

    // STUDIO
    const studio = col(10);
    studio.add(label('Learn. Play. Create.', 28));
    studio.add(label('Pick an instrument, then learn or free-play.', 24, C.dim));
    const inst = row(10);
    inst.add(button('Piano (ready)', () => this.a.navigate('play'), { backgroundColor: C.active }).b);
    ['Guitar', 'Bass', 'Drums'].forEach((n) => inst.add(button(`${n} - soon`, () => {}, { backgroundColor: C.disabled, hover: {}, cursor: 'default' }).b));
    studio.add(inst);
    const go = row(10);
    go.add(button('Start first lesson', () => this.a.startLesson(LESSONS[0].id)).b);
    go.add(button('Free play', () => this.a.navigate('play')).b);
    studio.add(go);
    this.pages.set('studio', studio);

    // LEARN
    const learn = col(10);
    this.lessonList = col(8);
    LESSONS.forEach((l) => {
      const { b } = button(`${l.title}  |  ${l.difficulty}`, () => this.a.startLesson(l.id), { justifyContent: 'flex-start' });
      this.lessonList.add(b);
    });
    learn.add(this.lessonList);
    this.lessonDetail = col(8);
    this.texts.lessonTitle = label('', 30, C.gold);
    this.texts.lessonBody = label('', 23, C.dim);
    this.texts.feedback = label('', 30, C.ok);
    this.texts.result = label('', 24, C.text);
    this.lessonDetail.add(this.texts.lessonTitle, this.texts.lessonBody, this.texts.feedback, this.texts.result);
    const lr = row(10);
    lr.add(button('Hear example', () => this.a.playReference()).b);
    lr.add(button('Start practice', () => this.a.startPractice()).b);
    lr.add(button('Stop & score', () => this.a.stopPractice()).b);
    lr.add(button('Lessons', () => this.a.navigate('learn')).b);
    this.lessonDetail.add(lr);
    learn.add(this.lessonDetail);
    this.pages.set('learn', learn);

    // PLAY
    const play = col(10);
    play.add(label('Free play - Piano (C4-C5)', 28));
    play.add(label('Press any key with hand-pinch, gaze + pinch, or pointer.', 24, C.dim));
    this.texts.sound = label('', 22, C.warn);
    play.add(this.texts.sound);
    this.pages.set('play', play);

    // CREATE
    const create = col(10);
    create.add(label('Create - not implemented yet', 28, C.warn));
    create.add(label('Planned: composition, loop recording and band tools. Nothing here works yet.', 24, C.dim));
    this.pages.set('create', create);

    // PROGRESS
    const progress = col(8);
    this.texts.progressSummary = label('', 26);
    this.progressList = col(4);
    progress.add(this.texts.progressSummary, this.progressList);
    this.pages.set('progress', progress);

    this.pages.forEach((p) => content.add(p));
    this.place(content, 0, 1.2, -0.98, 0, -0.32);
  }

  private buildControls() {
    const c = panel(380);
    c.add(label('Controls', 28, C.gold));
    const vol = row(8);
    vol.add(button('-', () => this.a.setVolume(-1), { width: 70 }).b);
    this.texts.volume = label('', 26);
    vol.add(this.texts.volume);
    vol.add(button('+', () => this.a.setVolume(+1), { width: 70 }).b);
    c.add(label('Volume', 22, C.dim), vol);
    const tempo = row(8);
    tempo.add(button('-', () => this.a.setTempo(-5), { width: 70 }).b);
    this.texts.tempo = label('', 26);
    tempo.add(this.texts.tempo);
    tempo.add(button('+', () => this.a.setTempo(+5), { width: 70 }).b);
    c.add(label('Tempo (BPM)', 22, C.dim), tempo);
    const m = button('Metronome: off', () => this.a.toggleMetronome());
    this.texts.metro = m.t;
    c.add(m.b);
    const dots = row(8);
    for (let i = 0; i < 4; i++) { const d = new Container({ width: 34, height: 34, borderRadius: 17, backgroundColor: C.btn } as any); this.beatDots.push(d); dots.add(d); }
    c.add(dots);
    this.place(c, 0.8, 1.05, -0.7, -0.75, -0.1);
  }

  private buildTutor() {
    const t = panel(380);
    t.add(label('Music tutor', 28, C.gold));
    this.texts.tutor = label('', 23, C.text);
    t.add(this.texts.tutor);
    ['Teach me the piano basics', 'Make it slower', 'Show me the next note', 'Play the example again', 'Turn on the metronome', 'How did I perform?', 'What should I practise next?'].forEach((p) =>
      t.add(button(p, () => this.a.tutorPrompt(p), { paddingY: 8 }).b));
    this.place(t, -0.8, 1.05, -0.7, 0.75, -0.1);
  }

  pulseBeat(beat: number) {
    this.beatDots.forEach((d, i) => (d as any).setProperties({ backgroundColor: i === beat ? (beat === 0 ? C.gold : C.ok) : C.btn }));
  }

  render(s: AppState, extra: { sound: string; isXR: boolean }) {
    (Object.keys(this.pagesObj()) as Destination[]).forEach((d) => show(this.pages.get(d)!, d === s.destination));
    this.navBtns.forEach((b, d) => (b as any).setProperties({ backgroundColor: d === s.destination ? C.active : C.btn }));
    this.set('xr', extra.isXR ? 'Exit VR' : 'Enter VR');
    this.set('title', { studio: 'MeloSpace Studio', learn: 'Learn', play: 'Play', create: 'Create', progress: 'Progress' }[s.destination]);
    this.set('volume', `${Math.round(s.volume * 100)}%`);
    this.set('tempo', `${s.tempo}`);
    this.set('metro', s.metronomeOn ? 'Metronome: on' : 'Metronome: off');
    this.set('sound', extra.sound);
    this.set('tutor', s.tutorStatus === 'thinking' ? 'Thinking...' : s.tutorMessage);
    this.set('progressSummary', '');

    const l = s.lessonId ? getLesson(s.lessonId) : undefined;
    const inLesson = !!l && s.lessonPhase !== 'idle';
    show(this.lessonList, !inLesson);
    show(this.lessonDetail, inLesson);
    if (l) {
      this.set('lessonTitle', l.title);
      this.set('lessonBody', `${l.objective}\n${l.instructions.join(' ')}`);
      this.set('feedback', s.feedback);
      const r = s.currentResult;
      this.set('result', s.lessonPhase === 'result' && r
        ? `Score ${r.score}/100 | correct ${r.correctNotes}/${r.totalNotes} | wrong keys ${r.incorrectNotes} | missed ${r.missedNotes} | timing ${Math.round(r.timingAccuracy * 100)}%\n${r.completed ? 'Completed!' : 'Not completed yet - press Start practice to retry.'} ${r.recommendedNextStep}`
        : s.lessonPhase === 'practice' ? `Next note: ${s.highlighted[0] ?? '-'}` : '');
    }
    // Progress page
    const h = s.history;
    const completed = [...new Set(h.filter((x) => x.completed).map((x) => x.lessonId))];
    this.set('progressSummary', h.length === 0 ? 'No practice yet. Complete a lesson and it will appear here.' : `${h.length} attempts | ${completed.length}/${LESSONS.length} lessons completed`);
    this.progressList.children.slice().forEach((c: any) => this.progressList.remove(c));
    h.slice(-6).reverse().forEach((x) => this.progressList.add(label(`${getLesson(x.lessonId)?.title ?? x.lessonId}: ${x.score}/100 ${x.completed ? 'OK' : ''}`, 22, C.dim)));
  }

  private pagesObj() { return Object.fromEntries(this.pages) as Record<Destination, AnyC>; }
  private set(k: string, v: string) { (this.texts[k] as any)?.setProperties({ text: v }); }
}
