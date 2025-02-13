import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface QuantizeButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function QuantizeButton({ onClick, isActive }: QuantizeButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={`
        relative w-16 h-16 p-0 rounded-full
        border-2 bg-white
        ${isActive ? "border-purple-500" : "border-gray-300"}
        hover:border-purple-400
        transition-colors duration-200
      `}
      onClick={onClick}
    >
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
          rotate: isActive ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <div className="text-2xl font-bold select-none">
          Q
        </div>
      </motion.div>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-purple-500"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      )}
    </Button>
  );
}
