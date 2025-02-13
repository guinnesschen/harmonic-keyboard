import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  playbackPosition: number;
  duration: number;
}

export default function WaveformDisplay({
  audioBuffer,
  isPlaying,
  playbackPosition,
  duration,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = "#E5E7EB"; // Light gray

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
  }, [audioBuffer]);

  const progressWidth = duration > 0 ? (playbackPosition / duration) * 100 : 0;

  return (
    <div className="relative w-full h-24 bg-white rounded-lg shadow-sm overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={96}
        className="absolute inset-0 w-full h-full"
      />
      {isPlaying && (
        <motion.div
          className="absolute top-0 h-full w-0.5 bg-green-500"
          style={{
            left: `${progressWidth}%`,
          }}
          transition={{
            duration: 0,
          }}
        />
      )}
    </div>
  );
}