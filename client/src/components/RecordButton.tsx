import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  onRecordStart: () => void;
  onRecordStop: () => void;
  className?: string;
}

export default function RecordButton({
  onRecordStart,
  onRecordStop,
  className,
}: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (!isRecording) {
          setIsRecording(true);
          onRecordStart();
        } else {
          setIsRecording(false);
          onRecordStop();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, onRecordStart, onRecordStop]);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={false}
        animate={{
          scale: isRecording ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-red-400/30 rounded-lg"
      />
      <Button
        size="lg"
        onClick={() => {
          if (!isRecording) {
            setIsRecording(true);
            onRecordStart();
          } else {
            setIsRecording(false);
            onRecordStop();
          }
        }}
        className={cn(
          "relative z-10 w-16 h-16 rounded-lg bg-red-500 hover:bg-red-600 transition-colors",
          isRecording && "bg-red-600",
          className
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-full",
          isRecording ? "bg-red-200" : "bg-red-100"
        )} />
      </Button>
    </div>
  );
}
