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
        />
      )}
    </div>
  );
}