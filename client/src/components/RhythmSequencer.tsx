import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Square, Music } from "lucide-react";
import type { ChordVoicing } from "@shared/schema";

interface RhythmSequencerProps {
  onTriggerChord: (duration: number) => void;
  activeChord: ChordVoicing | null;
}

interface Note {
  startBeat: number;  // In 16th notes
  duration: number;   // In 16th notes
}

export default function RhythmSequencer({ onTriggerChord, activeChord }: RhythmSequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartBeat, setDragStartBeat] = useState<number | null>(null);

  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const lastTriggerTimeRef = useRef<number>(0);

  // Grid constants
  const TOTAL_BARS = 4;
  const BEATS_PER_BAR = 4;
  const SUBDIVISIONS = 4; // 16th notes per beat
  const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR * SUBDIVISIONS;

  const beatDuration = 60000 / bpm / SUBDIVISIONS; // Duration of one 16th note in ms

  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    if (time - lastTriggerTimeRef.current >= beatDuration) {
      setCurrentBeat((prev) => (prev + 1) % TOTAL_BEATS);
      lastTriggerTimeRef.current = time;

      // Find if there's a note starting at this beat
      const noteAtBeat = notes.find(note => note.startBeat === currentBeat);
      if (noteAtBeat && activeChord) {
        onTriggerChord(noteAtBeat.duration * beatDuration / 1000);
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isPlaying, bpm, notes, currentBeat, activeChord]);

  const handleGridClick = (beat: number) => {
    if (!isDragging) {
      setDragStartBeat(beat);
      setIsDragging(true);
    } else {
      setIsDragging(false);
      if (dragStartBeat !== null) {
        const duration = Math.abs(beat - dragStartBeat) + 1;
        const startBeat = Math.min(beat, dragStartBeat);

        // Remove any overlapping notes
        const nonOverlappingNotes = notes.filter(note => 
          note.startBeat + note.duration <= startBeat || 
          note.startBeat >= startBeat + duration
        );

        setNotes([...nonOverlappingNotes, { startBeat, duration }]);
      }
      setDragStartBeat(null);
    }
  };

  return (
    <div className="w-full space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-gray-500" />
            <Label>BPM</Label>
            <div className="w-32">
              <Slider
                value={[bpm]}
                min={60}
                max={200}
                step={1}
                onValueChange={([value]) => setBpm(value)}
              />
            </div>
            <span className="text-sm text-gray-600">{bpm}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-32 border rounded-lg overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid"
             style={{ 
               gridTemplateColumns: `repeat(${TOTAL_BEATS}, 1fr)`,
               backgroundColor: '#fafafa'
             }}>
          {Array.from({ length: TOTAL_BEATS }).map((_, i) => {
            const isBeatStart = i % SUBDIVISIONS === 0;
            const isBarStart = i % (SUBDIVISIONS * BEATS_PER_BAR) === 0;

            return (
              <div
                key={i}
                className={`relative h-full border-r cursor-pointer hover:bg-stone-100 transition-colors
                  ${isBarStart 
                    ? 'border-gray-300' 
                    : isBeatStart 
                      ? 'border-gray-200' 
                      : 'border-gray-100'
                  }`}
                onClick={() => handleGridClick(i)}
                onMouseEnter={(e) => {
                  if (isDragging && dragStartBeat !== null) {
                    handleGridClick(i);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Notes */}
        <div className="absolute inset-0">
          {notes.map((note, i) => (
            <div
              key={i}
              className="absolute h-full bg-stone-500/50 border border-stone-600 hover:bg-stone-500/60 transition-colors"
              style={{
                left: `${(note.startBeat / TOTAL_BEATS) * 100}%`,
                width: `${(note.duration / TOTAL_BEATS) * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Playhead */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-px bg-stone-600 transition-transform"
            style={{
              transform: `translateX(${(currentBeat / TOTAL_BEATS) * 100}%)`
            }}
          />
        )}
      </div>
    </div>
  );
}