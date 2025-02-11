import { FC } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SheetMusicPanelProps {
  onClose: () => void;
}

const good_luck_babe_tab = `           V          B
It's fine, it's cool
 Z                            N
You can say that we are nothing, but you know the truth
                       V          B
And guess I'm the fool
         Z                                              N
With her arms out like an angel through the car sunroof

                                                       X     
I don't wanna call it off
                                                 X
But you don't wanna call it love
                                       X                                
You only wanna be the one that I call "baby"

                                                    V                                  B
You can kiss a hundred boys in bars
                                                     Z                                N
Shoot another shot, try to stop the feeling
                                                     V                                B
You can say it's just the way you are
                                                   Z                                       N
Make a new excuse, another stupid reason
                                   V                                                        B
Good luck, babe (well, good luck), well, good luck, babe (well, good luck)
                                                  Z                                      N
You'd have to stop the world just to stop the feeling
                                  V                                                        B
Good luck, babe (well, good luck), well, good luck, babe (well, good luck)
                                                  Z                                      N
You'd have to stop the world just to stop the feeling

`;

const yesterday_tab = `                                Z               M  
Yesterday
       					CE                           N             B  V
All my troubles seemed so far away
B                                   Z   
Now it looks as though they’re here to stay
        M1  N       XQ    V        Z     
Oh, I believe in yesterday

    Z              M
Suddenly
                  CE                 N               B V
I’m not half the man I used to be
        B                       Z
There’s a shadow hanging over me
M1 N       XQ            V        Z
Oh, yesterday came suddenly

  					    M    CE   N    B  V 
Why she had to go
               B               BE             Z
I don’t know, she wouldn’t say
 				          M CE  N     B        V 
I said something wrong
          B          BE       Z
Now I long for yesterday

`;

const when_you_wish_tab = `
Z                NE      X5  X  Z3   
When you wish upon a star
            M1           BE            ZY          Z 
Makes no difference who you are
       CT   DY           XT          BE
Anything your heart desires
           XT   BE  ZW
Will come to you
`;
const SheetMusicPanel: FC<SheetMusicPanelProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="relative p-4">
        <div className="flex justify-end items-center"></div>
      </div>
      <div className="max-w-4xl mx-auto space-y-12 p-8">
        <div className="h-[calc(100vh-8rem)] overflow-y-auto border rounded-lg shadow-sm p-8 bg-white">
          <pre className="text-center font-mono whitespace-pre-wrap text-gray-900 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-stone-800 [&>h2]:my-6">
            <h2>Easy Difficulty: Good Luck Babe by Chappell Roan</h2>
            {good_luck_babe_tab}
            <h2>Medium Difficulty: Yesterday by The Beatles</h2>
            {yesterday_tab}
            <h2>Hard Difficulty: When You Wish Upon A Star by Cliff Edwards</h2>
            {when_you_wish_tab}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SheetMusicPanel;
