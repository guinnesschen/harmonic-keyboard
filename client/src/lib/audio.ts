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

export function playChord(voicing: ChordVoicing) {
  if (!synth) return;

  const frequencies = voicing.notes.map(note => 
    Tone.Frequency(note, "midi").toFrequency()
  );

  synth.triggerRelease(frequencies); // Release any existing notes
  synth.triggerAttack(frequencies);
}
