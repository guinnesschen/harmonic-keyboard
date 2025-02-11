import { FC } from "react";
import { Link } from "wouter";

const SheetMusic: FC = () => {
  return (
    <div className="min-h-screen w-full bg-white p-8">
      {/* Tutorial Link */}
      <Link href="/" className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition-colors">
        ← tutorial
      </Link>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* YouTube Video */}
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/EFqt0oD22WA"
            title="Harmonova Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Sheet Music Content */}
        <div className="prose prose-stone mx-auto">
          <h1 className="text-3xl font-light text-gray-900 text-center mb-12">
            Harmonic Keyboard Guide
          </h1>

          <div className="space-y-8 text-gray-800">
            <section>
              <h2 className="text-xl font-light mb-4">Introduction</h2>
              <p>
                The Harmonic Keyboard is a revolutionary musical instrument that 
                transforms how we approach chord generation and musical harmony.
                This guide will walk you through its core concepts and usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-light mb-4">Basic Controls</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the bottom two keyboard rows for bass notes (A-L keys)</li>
                <li>Press Q/W/E/R/T/Y for different chord qualities</li>
                <li>Numbers 0-3 select inversions</li>
                <li>Hold Space to sustain chords</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-light mb-4">Advanced Features</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Intelligent voice leading between chord changes</li>
                <li>Customizable chord qualities per scale degree</li>
                <li>Multiple sound synthesis options</li>
                <li>MIDI output capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-light mb-4">Practice Tips</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Start with simple major and minor triads in root position</li>
                <li>Practice moving between inversions on a single chord</li>
                <li>Experiment with different chord qualities on the same bass note</li>
                <li>Try common chord progressions in different keys</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-light mb-4">Voice Leading</h2>
              <p>
                The intelligent voice leading system ensures smooth transitions between
                chords by minimizing the movement of individual voices. This creates
                more natural and musical progressions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetMusic;