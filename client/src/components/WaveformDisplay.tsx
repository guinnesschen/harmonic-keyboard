import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  playbackPosition: number;
  duration: number;
  streamAnalyser: AnalyserNode | null;
  isRecording: boolean;
}

export default function WaveformDisplay({
  audioBuffer,
  isPlaying,
  playbackPosition,
  duration,
  streamAnalyser,
  isRecording,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const progressRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Constants for rhythmic movement
  const CANVAS_WIDTH = 800;
  const DIVISIONS = 64; // 64th notes
  const STEP_WIDTH = CANVAS_WIDTH / DIVISIONS;
  const TIME_PER_STEP = duration / DIVISIONS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (audioBuffer) {
      // Draw recorded waveform
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;

      ctx.beginPath();
      ctx.moveTo(0, amp);
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 2;

      for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = data[i * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.lineTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }

      ctx.stroke();
    }

    // Setup real-time visualization if recording
    if (isRecording && streamAnalyser) {
      const drawStream = () => {
        const dataArray = new Float32Array(streamAnalyser.frequencyBinCount);
        streamAnalyser.getFloatTimeDomainData(dataArray);

        ctx.beginPath();
        ctx.strokeStyle = "#EF4444"; // Red color for recording
        ctx.lineWidth = 2;

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        ctx.moveTo(0, canvas.height / 2);

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i];
          const y = (v + 1) * canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
        animationFrameRef.current = requestAnimationFrame(drawStream);
      };

      drawStream();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioBuffer, isRecording, streamAnalyser]);

  // Update progress bar position rhythmically
  useEffect(() => {
    if (!isPlaying || !duration) return;

    let currentStep = Math.floor(playbackPosition / TIME_PER_STEP);
    const progressBar = progressRef.current;
    if (!progressBar) return;

    const updatePosition = () => {
      if (!isPlaying) return;

      const now = performance.now();
      const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000;

      if (timeSinceLastUpdate >= TIME_PER_STEP) {
        currentStep = (currentStep + 1) % DIVISIONS;
        const newPosition = (currentStep * STEP_WIDTH);
        progressBar.style.transform = `translateX(${newPosition}px)`;
        lastUpdateTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    lastUpdateTimeRef.current = performance.now();
    updatePosition();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration, playbackPosition]);

  return (
    <div className="relative w-full h-24 bg-white rounded-lg shadow-sm overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={96}
        className="absolute inset-0 w-full h-full"
      />
      {isPlaying && (
        <div
          ref={progressRef}
          className="absolute top-0 h-full w-0.5 bg-green-500 transition-transform duration-0"
          style={{
            transform: `translateX(0px)`,
          }}
        />
      )}
    </div>
  );
}