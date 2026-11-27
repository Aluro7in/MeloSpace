/** Reusable instrument contracts. Future guitar/bass/drums implement these. */
export interface Voice {
  /** Begin the release phase at audio time `when`. */
  release(when: number): void;
  /** Immediately silence and disconnect. */
  stop(): void;
  onEnded(cb: () => void): void;
}

export interface Instrument {
  readonly id: string;
  /** 'prototype-synth' must never be presented as realistic sampled audio. */
  readonly kind: 'prototype-synth' | 'sampled';
  readonly label: string;
  load(ctx: BaseAudioContext): Promise<void>;
  createVoice(ctx: BaseAudioContext, dest: AudioNode, midi: number, velocity: number, when: number): Voice;
}
