import { configureUIKitRenderer, createSystem, ReferenceSpaceType, SessionMode, VisibilityState, World } from '@iwsdk/core';
import { Dispatcher } from './app/dispatcher';
import { LessonSession } from './app/lesson-session';
import { Store } from './app/store';
import { AudioEngine } from './audio/audio-engine';
import { Metronome } from './audio/metronome';
import { SynthPianoInstrument } from './audio/synth-piano';
import { PIANO_KEYS } from './music/notes';
import { PianoInput } from './music/piano-input';
import { TutorClient } from './tutor/tutor-client';
import { PianoView } from './xr/piano-view';
import { buildStudio } from './xr/studio';
import { StudioUI } from './xr/ui';

async function main() {
  const container = document.getElementById('scene-container') as HTMLDivElement;
  const world = await World.create(container, {
    xr: {
      sessionMode: SessionMode.ImmersiveVR,
      offer: 'once',
      referenceSpace: { type: ReferenceSpaceType.LocalFloor },
      // Hands first; gaze+pinch for devices without hand rays. Both optional so entry never fails.
      features: { handTracking: true, gazeTracking: true },
    },
    render: { fov: 60, camera: { position: [0, 1.3, 0.35], lookAt: [0, 1.1, -0.9] } },
    features: { locomotion: false, grabbing: false, spatialUI: true },
  });

  const store = new Store();
  const audio = new AudioEngine();
  const synth = new SynthPianoInstrument();
  await audio.setInstrument(synth);
  const metronome = new Metronome(() => audio.ctx, () => audio.output);
  const session = new LessonSession(store, audio);
  const dispatcher = new Dispatcher(store, session, audio, metronome);
  const tutor = new TutorClient(store, dispatcher);

  configureUIKitRenderer(world.renderer);
  buildStudio(world);

  // Device-independent piano input -> audio + lesson. Timestamps come from the audio clock.
  let pianoView!: PianoView;
  const input = new PianoInput((id) => PIANO_KEYS.find((k) => k.id === id)?.midi, {
    noteOn: (midi, keyId) => {
      pianoView.setPressed(keyId, true);
      const go = () => { audio.noteOn(midi); session.handleNoteOn(midi, audio.now); };
      if (audio.ctx && audio.state === 'running') go();
      else audio.ensureStarted().then(() => { store.set({ audioStatus: 'Audio ready.' }); go(); }).catch(() => store.set({ audioStatus: 'Audio blocked by the browser — tap again.' }));
    },
    noteOff: (midi, keyId) => { pianoView.setPressed(keyId, false); audio.noteOff(midi); },
  });
  pianoView = new PianoView(world, input);

  const setNum = (key: 'volume' | 'tempo', delta: number) => {
    if (key === 'volume') { const v = Math.max(0, Math.min(1, Math.round((store.state.volume + delta * 0.1) * 10) / 10)); audio.setVolume(v); store.set({ volume: v }); }
    else dispatcher.execute('set_tempo', { bpm: Math.max(40, Math.min(160, store.state.tempo + delta)) });
  };

  const ui = new StudioUI(world, {
    navigate: (d) => store.set({ destination: d }),
    startLesson: (id) => { audio.ensureStarted(); session.select(id); },
    playReference: () => void session.playReference(),
    startPractice: () => void session.startPractice(),
    stopPractice: () => void session.stopPractice(),
    setVolume: (d) => setNum('volume', d),
    setTempo: (d) => setNum('tempo', d),
    toggleMetronome: () => void dispatcher.execute('toggle_metronome', {}),
    tutorPrompt: (t) => void tutor.send(t),
    enterXR: () => world.launchXR(),
    exitXR: () => world.exitXR(),
    isXR: () => world.visibilityState.value !== VisibilityState.NonImmersive,
  });

  const draw = () => {
    pianoView.setHighlighted(store.state.highlighted);
    ui.render(store.state, {
      sound: `Sound: ${audio.instrumentInfo?.label ?? 'none'}. ${store.state.audioStatus}`,
      isXR: world.visibilityState.value !== VisibilityState.NonImmersive,
    });
  };
  store.subscribe(draw);
  draw();

  // No stuck notes: release on tracking loss, focus loss, session visibility change or end.
  const releaseAll = () => { input.releaseAll(); audio.allNotesOff(); };
  world.visibilityState.subscribe((v) => { if (v !== VisibilityState.Visible) releaseAll(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
  window.addEventListener('blur', releaseAll);
  const hookSession = (sess?: XRSession) => sess?.addEventListener('inputsourceschange', (e: any) => { if (e.removed?.length) releaseAll(); });
  let hooked: XRSession | undefined;

  class MeloSystem extends createSystem({}) {
    update(delta: number) {
      for (const r of ui.roots) (r as any).update(delta * 1000);
      const b = metronome.pollVisualBeat();
      if (b !== undefined) ui.pulseBeat(b);
      if (world.session && world.session !== hooked) { hooked = world.session; hookSession(hooked); }
    }
  }
  world.registerSystem(MeloSystem);

  window.addEventListener('beforeunload', () => { session.dispose(); metronome.stop(); void audio.dispose(); });

  if (new URLSearchParams(location.search).has('debug')) {
    (window as any).__melospace = { tutor, store, audio, input, session, dispatcher, pianoView, world };
  }
}

main().catch((e) => {
  console.error('MeloSpace failed to start', e);
  const el = document.createElement('pre');
  el.textContent = `MeloSpace failed to start: ${e?.message ?? e}`;
  el.style.cssText = 'color:#fff;background:#400;padding:12px;position:fixed;top:0;left:0;right:0;z-index:9';
  document.body.appendChild(el);
});
