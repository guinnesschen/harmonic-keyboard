import { FC } from "react";
import { Link } from "wouter";

const SheetMusic: FC = () => {
  return (
    <div className="min-h-screen w-full bg-white p-8">
      {/* Tutorial Link */}
      <Link href="/" className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition-colors">
        ← back
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
        <div className="font-mono text-center whitespace-pre-wrap text-gray-900 leading-relaxed">
{`                              Em                   
And I don't want the world to see me
                    Gmaj                     
'Cause I don't think that they'd understand
                   Em                         A
When everything's made to be broken
                 C                 D          Em
I just want you to know who I am

                     Em
And you can't fight the tears that ain't coming
                    Gmaj
Or the moment of truth in your lies
                   Em                         A
When everything feels like the movies
                  C                D          Em
Yeah you bleed just to know you're alive

                              Em                   
And I don't want the world to see me
                    Gmaj                     
'Cause I don't think that they'd understand
                   Em                         A
When everything's made to be broken
                 C                 D          Em
I just want you to know who I am`}
        </div>
      </div>
    </div>
  );
};

export default SheetMusic;