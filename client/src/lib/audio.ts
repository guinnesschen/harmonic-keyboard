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

  // Stop all currently playing notes
  synth.releaseAll();

  // If no voicing is provided or no notes to play, return
  if (!voicing || !voicing.notes.length) {
    return;
  }

  // Convert MIDI notes to frequencies
  const frequencies = voicing.notes.map(note => 
    Tone.Frequency(note, "midi").toFrequency()
  );

  // Play the new notes
  synth.triggerAttack(frequencies);
}