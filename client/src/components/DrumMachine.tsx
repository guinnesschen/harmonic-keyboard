import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { drumAudioEngine, type DrumSampleMap } from "@/lib/drumAudio";
import RecordButton from "@/components/RecordButton";
import WaveformDisplay from "@/components/WaveformDisplay";
import * as Tone from "tone";

type LoopState = "idle" | "recording" | "playing" | "overdubbing";

interface DrumPad {
  key: string;
  sound: keyof DrumSampleMap;
  label: string;
  color: string;
  row: number;
  animation: "heartbeat" | "shake" | "bounce" | "pulse" | "ripple" | "crash" | "hihat" | "snare";
}

const drumPads: DrumPad[] = [
  { key: "U", sound: "crash", label: "Crash", color: "bg-yellow-100", row: 0, animation: "crash" },
  { key: "I", sound: "hihat", label: "Hi-Hat", color: "bg-yellow-200", row: 0, animation: "hihat" },
  { key: "O", sound: "openhat", label: "Open Hat", color: "bg-yellow-300", row: 0, animation: "ripple" },
  { key: "J", sound: "snare", label: "Snare", color: "bg-blue-200", row: 1, animation: "snare" },
  { key: "F", sound: "kick", label: "Kick", color: "bg-red-100", row: 2, animation: "shake" },
  { key: "G", sound: "rimshot", label: "Rim", color: "bg-red-200", row: 2, animation: "ripple" },
  { key: "B", sound: "clap", label: "Clap", color: "bg-red-300", row: 2, animation: "pulse" },
];

interface DrumMachineProps {
  className?: string;
}

const animations = {
  heartbeat: {
    scale: [1, 1.4, 1],
    transition: { duration: 0.3, times: [0, 0.2, 1] }
  },
  crash: {
    rotate: [0, -3, 3, -3, 3, -1.5, 0],
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hihat: {
    x: [0, -2, 2, -2, 2, 0],
    rotate: [0, 1, -1, 1, -1, 0],
    transition: { duration: 0.2 }
  },
  bounce: {
    y: [0, -10, 0],
    transition: { duration: 0.3 }
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.2 }
  },
  ripple: {
    y: [0, -5, 0],
    rotate: [0, -3, 3, -3, 3, -1.5, 0],
    transition: { duration: 0.4, ease: "easeOut" }
  },
  snare: {
    scale: [1, 1.1, 1],
    rotate: [0, 2, 0],
    transition: { duration: 0.2, ease: "easeOut" }
  },
  shake: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.2, ease: "linear" }
  }
};

export default function DrumMachine({ className = "" }: DrumMachineProps) {
  // State
  const [loopState, setLoopState] = useState<LoopState>("idle");
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [isAudioContextStarted, setIsAudioContextStarted] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [loopDuration, setLoopDuration] = useState(0);
  const [streamAnalyser, setStreamAnalyser] = useState<AnalyserNode | null>(null);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [triggerCount, setTriggerCount] = useState<Record<string, number>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const recorderRef = useRef<Tone.Recorder | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const analyserDataRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    // Initialize recorder and analyzer
    recorderRef.current = new Tone.Recorder();
    const analyser = Tone.getContext().createAnalyser();
    analyser.fftSize = 2048;
    analyserDataRef.current = new Float32Array(analyser.frequencyBinCount);
    setStreamAnalyser(analyser);

    drumAudioEngine.connectToRecorder(recorderRef.current);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      recorderRef.current?.dispose();
      playerRef.current?.dispose();
    };
  }, []);

  const handleLoopStateChange = async () => {
    if (!isAudioContextStarted) {
      await startAudioContext();
    }

    switch (loopState) {
      case "idle":
        await startRecording();
        setLoopState("recording");
        break;
      case "recording":
        await stopRecording();
        setLoopState("playing");
        break;
      case "playing":
        await startOverdub();
        setLoopState("overdubbing");
        break;
      case "overdubbing":
        await stopOverdub();
        setLoopState("playing");
        break;
    }
  };

  const startRecording = async () => {
    if (!recorderRef.current) return;

    try {
      await recorderRef.current.start();
      recordStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setLoopState("idle");
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !recorderRef.current.state) return;

    try {
      const recording = await recorderRef.current.stop();
      const newBuffer = await Tone.getContext().rawContext.decodeAudioData(
        await recording.arrayBuffer()
      );

      const recordingDuration = (Date.now() - recordStartTimeRef.current) / 1000;
      setLoopDuration(recordingDuration);
      setRecordedBuffer(newBuffer);

      updatePlayer(newBuffer);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setLoopState("idle");
    }
  };

  const startOverdub = async () => {
    if (!recorderRef.current) return;
    try {
      await recorderRef.current.start();
      recordStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Failed to start overdub:", error);
      setLoopState("playing");
    }
  };

  const stopOverdub = async () => {
    if (!recorderRef.current || !recorderRef.current.state || !recordedBuffer) return;

    try {
      const recording = await recorderRef.current.stop();
      const newBuffer = await Tone.getContext().rawContext.decodeAudioData(
        await recording.arrayBuffer()
      );

      const mergedBuffer = await mergeAudioBuffers(recordedBuffer, newBuffer);
      setRecordedBuffer(mergedBuffer);
      updatePlayer(mergedBuffer);
    } catch (error) {
      console.error("Failed to stop overdub:", error);
      setLoopState("playing");
    }
  };

  const mergeAudioBuffers = async (existingBuffer: AudioBuffer, newBuffer: AudioBuffer): Promise<AudioBuffer> => {
    const ctx = Tone.getContext().rawContext;
    const numberOfChannels = Math.max(existingBuffer.numberOfChannels, newBuffer.numberOfChannels);
    const bufferLength = Math.max(existingBuffer.length, newBuffer.length);

    const mergedBuffer = ctx.createBuffer(
      numberOfChannels,
      bufferLength,
      existingBuffer.sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const mergedChannelData = mergedBuffer.getChannelData(channel);
      const existingChannelData = existingBuffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);

      for (let i = 0; i < bufferLength; i++) {
        mergedChannelData[i] = (existingChannelData[i] || 0) * 0.8 + (newChannelData[i] || 0) * 0.8;
      }
    }

    return mergedBuffer;
  };

  const updatePlayer = (buffer: AudioBuffer) => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
    }

    playerRef.current = new Tone.Player()
      .set({ 
        loop: true,
        autostart: false,
        volume: 0 
      })
      .toDestination();

    playerRef.current.buffer = new Tone.ToneAudioBuffer(buffer);
    playerRef.current.start();

    const updatePosition = () => {
      if (playerRef.current && loopState !== "idle") {
        const currentTime = Tone.Transport.seconds;
        setPlaybackPosition(currentTime % loopDuration);
        animationFrameRef.current = requestAnimationFrame(updatePosition);
      }
    };
    updatePosition();
  };

  const startAudioContext = async () => {
    try {
      await drumAudioEngine.startAudioContext();
      setIsAudioContextStarted(true);
    } catch (error) {
      console.error("Failed to start audio context:", error);
    }
  };

  useEffect(() => {
    const initAudio = async () => {
      try {
        await drumAudioEngine.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize drum audio:", error);
      }
    };
    initAudio();
    return () => drumAudioEngine.cleanup();
  }, []);

  const handlePadTrigger = async (pad: DrumPad) => {
    if (!isInitialized || loopState === "idle") return;

    if (!isAudioContextStarted) {
      await startAudioContext();
    }

    drumAudioEngine.triggerSample(pad.sound);
    setTriggerCount(prev => ({
      ...prev,
      [pad.key]: (prev[pad.key] || 0) + 1
    }));

    setActivePads((prev) => {
      const next = new Set(prev);
      next.add(pad.key);
      return next;
    });

    setTimeout(() => {
      setActivePads((prev) => {
        const next = new Set(prev);
        next.delete(pad.key);
        return next;
      });
    }, 300);
  };

  useEffect(() => {
    if (!isInitialized) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        await handleLoopStateChange();
      } else {
        const pad = drumPads.find(
          (p) => p.key.toLowerCase() === e.key.toLowerCase()
        );
        if (pad) {
          await handlePadTrigger(pad);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInitialized, loopState]);


  // Group pads by row
  const padsByRow = drumPads.reduce((acc, pad) => {
    if (!acc[pad.row]) acc[pad.row] = [];
    acc[pad.row].push(pad);
    return acc;
  }, {} as Record<number, DrumPad[]>);

  return (
    <div className={`p-8 ${className}`}>
      <div className="flex flex-col gap-8">
        {/* Status Display */}
        <div className="text-center text-lg font-semibold">
          {loopState === "idle" && "Press SPACE to start recording"}
          {loopState === "recording" && "Recording... Press SPACE to stop"}
          {loopState === "playing" && "Playing... Press SPACE to overdub"}
          {loopState === "overdubbing" && "Overdubbing... Press SPACE to stop"}
        </div>

        {/* Waveform Display */}
        <div className="w-full px-4">
          <WaveformDisplay
            audioBuffer={recordedBuffer}
            isPlaying={loopState === "playing" || loopState === "overdubbing"}
            playbackPosition={playbackPosition}
            duration={loopDuration}
            streamAnalyser={streamAnalyser}
            isRecording={loopState === "recording" || loopState === "overdubbing"}
          />
        </div>

        {/* Record Button */}
        <div className="flex justify-center mb-4">
          <RecordButton
            onRecordStart={handleLoopStateChange}
            onRecordStop={handleLoopStateChange}
            isActive={loopState === "recording" || loopState === "overdubbing"}
          />
        </div>

        {/* Drum Pads */}
        {Object.entries(padsByRow).map(([row, pads]) => (
          <div
            key={row}
            className="flex justify-center gap-8"
            style={{
              paddingLeft: `${parseInt(row) * 40}px`
            }}
          >
            {pads.map((pad) => (
              <motion.div
                key={`${pad.key}-${triggerCount[pad.key] || 0}`}
                animate={activePads.has(pad.key) ? animations[pad.animation] : {}}
                className={`
                  w-64 h-24 flex flex-col items-center justify-center
                  ${pad.color} hover:brightness-95
                  rounded-lg shadow-md
                  cursor-pointer
                  transition-colors duration-150
                  ${!isInitialized ? 'opacity-50' : ''}
                `}
                onClick={() => handlePadTrigger(pad)}
              >
                <span className="text-2xl font-bold text-gray-900">{pad.label}</span>
                <span className="text-sm text-gray-600 mt-2">{pad.key}</span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}