import { FC } from "react";

const SheetMusic: FC = () => {
  return (
    <div className="min-h-screen w-full bg-white p-4 flex justify-center">
      <object
        data="/sheet-music.pdf"
        type="application/pdf"
        className="w-full h-screen"
      >
        <p>Unable to display PDF file. <a href="/sheet-music.pdf">Download</a> instead.</p>
      </object>
    </div>
  );
};

export default SheetMusic;
