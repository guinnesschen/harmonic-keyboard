import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  onRecordStart: () => void;
  onRecordStop: () => void;
  isActive: boolean;
  className?: string;
}

export default function RecordButton({
  onRecordStart,
  onRecordStop,
  isActive,
  className,
}: RecordButtonProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-red-400/30 rounded-lg transition-opacity",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <Button
        size="lg"
        onClick={() => {
          if (!isActive) {
            onRecordStart();
          } else {
            onRecordStop();
          }
        }}
        className={cn(
          "relative z-10 w-16 h-16 rounded-lg bg-red-500 hover:bg-red-600 transition-colors",
          isActive && "bg-red-600",
          className
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full",
            isActive ? "bg-red-200" : "bg-red-100"
          )}
        />
      </Button>
    </div>
  );
}