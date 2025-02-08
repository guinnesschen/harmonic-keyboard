import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChordVoicing } from "@shared/schema";

interface BackgroundAnimationProps {
  voicing: ChordVoicing | null;
}

interface ParticleProps {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

function getChordColors(voicing: ChordVoicing | null) {
  if (!voicing) return ["hsl(250, 95%, 60%, 0.2)"]; // Default purple

  const colors = {
    major: ["hsl(45, 100%, 60%, 0.2)", "hsl(30, 100%, 60%, 0.2)"], // Warm yellows
    minor: ["hsl(220, 100%, 60%, 0.2)", "hsl(250, 100%, 60%, 0.2)"], // Cool blues
    dominant7: ["hsl(280, 100%, 60%, 0.2)", "hsl(320, 100%, 60%, 0.2)"], // Rich purples
    diminished7: ["hsl(0, 100%, 60%, 0.2)", "hsl(350, 100%, 60%, 0.2)"], // Deep reds
    halfdiminished7: ["hsl(300, 100%, 60%, 0.2)", "hsl(330, 100%, 60%, 0.2)"], // Burgundy
    minor7: ["hsl(200, 100%, 60%, 0.2)", "hsl(230, 100%, 60%, 0.2)"], // Deep blues
    major7: ["hsl(60, 100%, 60%, 0.2)", "hsl(40, 100%, 60%, 0.2)"], // Bright golds
  };

  return colors[voicing.quality] || colors.major;
}

function generateParticles(count: number, colors: string[]): ParticleProps[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    scale: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.2,
  }));
}

export default function BackgroundAnimation({ voicing }: BackgroundAnimationProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const colors = getChordColors(voicing);

  useEffect(() => {
    // Generate new particles on chord changes
    const newParticles = generateParticles(20, colors);
    setParticles(newParticles);
  }, [voicing?.quality, voicing?.root]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle, i) => (
          <motion.div
            key={`${i}-${voicing?.quality}-${voicing?.root}`}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y + (Math.random() - 0.5) * 100,
              scale: particle.scale,
              opacity: particle.opacity,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors[0]}, ${colors[1]})`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
