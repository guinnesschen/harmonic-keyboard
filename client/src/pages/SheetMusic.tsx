import { FC } from "react";
import { Link } from "wouter";

const SheetMusic: FC = () => {
  return (
    <div className="min-h-screen w-full bg-white p-8 relative">
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

        {/* PDF Viewer */}
        <div className="space-y-8">
          <object
            data="/sheet-music.pdf#page=1"
            type="application/pdf"
            className="w-full h-[842px]"
          >
            <p>Unable to display PDF file. <a href="/sheet-music.pdf">Download</a> instead.</p>
          </object>
          <object
            data="/sheet-music.pdf#page=2"
            type="application/pdf"
            className="w-full h-[842px]"
          >
          </object>
          <object
            data="/sheet-music.pdf#page=3"
            type="application/pdf"
            className="w-full h-[842px]"
          >
          </object>
        </div>
      </div>
    </div>
  );
};

export default SheetMusic;