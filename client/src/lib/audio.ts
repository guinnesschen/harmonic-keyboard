import * as Tone from "tone";
import type { ChordVoicing } from "@shared/schema";

let synth: Tone.PolySynth;

export async function initAudio() {
  await Tone.start();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle"
    },
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  }).toDestination();

  // Set initial volume
  synth.volume.value = -12;
}

export function playChord(voicing: ChordVoicing | null) {
  if (!synth) return;

  // If no voicing is provided, stop all sounds
  if (!voicing) {
    synth.releaseAll();
    return;
  }

  const frequencies = voicing.notes.map(note => 
    Tone.Frequency(note, "midi").toFrequency()
  );

  synth.triggerRelease(); // Release any existing notes
  synth.triggerAttack(frequencies);
}