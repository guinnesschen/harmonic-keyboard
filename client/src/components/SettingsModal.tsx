import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings } from "lucide-react";
import { InversionMode, StickyMode, ChordQuality, type ChordQualityConfig } from "@shared/schema";
import { defaultChordQualities } from "@/lib/chordConfig";
import { midiNoteToNoteName } from "@/lib/chords";

interface SettingsModalProps {
  inversionMode: InversionMode;
  stickyMode: StickyMode;
  chordQualities: ChordQualityConfig;
  onInversionModeChange: (mode: InversionMode) => void;
  onStickyModeChange: (mode: StickyMode) => void;
  onChordQualitiesChange: (config: ChordQualityConfig) => void;
}

function QualitySelect({ value, onChange, noteIndex }: { 
  value: ChordQuality; 
  onChange: (value: ChordQuality) => void;
  noteIndex: number;
}) {
  const noteName = midiNoteToNoteName(noteIndex + 60).replace(/\d+/, "");

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600 w-12">{noteName}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ChordQuality.Major}>Major</SelectItem>
          <SelectItem value={ChordQuality.Minor}>Minor</SelectItem>
          <SelectItem value={ChordQuality.Major7}>Major 7</SelectItem>
          <SelectItem value={ChordQuality.Minor7}>Minor 7</SelectItem>
          <SelectItem value={ChordQuality.Dominant7}>Dominant 7</SelectItem>
          <SelectItem value={ChordQuality.Diminished7}>Diminished 7</SelectItem>
          <SelectItem value={ChordQuality.HalfDiminished7}>Half-dim 7</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function SettingsModal({ 
  inversionMode, 
  stickyMode,
  chordQualities,
  onInversionModeChange,
  onStickyModeChange,
  onChordQualitiesChange,
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localChordQualities, setLocalChordQualities] = useState<ChordQualityConfig>(chordQualities);

  const updateChordQuality = (position: keyof ChordQualityConfig, noteIndex: number, quality: ChordQuality) => {
    const newConfig = {
      ...localChordQualities,
      [position]: {
        ...localChordQualities[position],
        [noteIndex]: quality
      }
    };
    setLocalChordQualities(newConfig);
    onChordQualitiesChange(newConfig);
  };

  const resetToDefaults = () => {
    setLocalChordQualities(defaultChordQualities);
    onChordQualitiesChange(defaultChordQualities);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your playing experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Inversion Mode</label>
            <Select value={inversionMode} onValueChange={value => onInversionModeChange(value as InversionMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InversionMode.Traditional}>
                  <div className="space-y-1">
                    <div>Traditional</div>
                    <div className="text-xs text-gray-600">
                      Bass key sets root, number keys set inversion
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={InversionMode.Functional}>
                  <div className="space-y-1">
                    <div>Functional</div>
                    <div className="text-xs text-gray-600">
                      Bass key sets actual bass note, number keys set function
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Sticky Mode</label>
            <Select value={stickyMode} onValueChange={value => onStickyModeChange(value as StickyMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StickyMode.Off}>
                  <div className="space-y-1">
                    <div>Off</div>
                    <div className="text-xs text-gray-600">
                      Notes stop when keys are released
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={StickyMode.On}>
                  <div className="space-y-1">
                    <div>On</div>
                    <div className="text-xs text-gray-600">
                      Notes persist, modifiers update the current chord
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inversionMode === InversionMode.Functional && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Default Chord Qualities</label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetToDefaults}
                >
                  Reset to Defaults
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="root">
                  <AccordionTrigger className="text-sm">Root Position</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <QualitySelect
                        key={i}
                        noteIndex={i}
                        value={localChordQualities.root[i]}
                        onChange={(quality) => updateChordQuality("root", i, quality)}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="first">
                  <AccordionTrigger className="text-sm">First Inversion</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <QualitySelect
                        key={i}
                        noteIndex={i}
                        value={localChordQualities.first[i]}
                        onChange={(quality) => updateChordQuality("first", i, quality)}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="second">
                  <AccordionTrigger className="text-sm">Second Inversion</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <QualitySelect
                        key={i}
                        noteIndex={i}
                        value={localChordQualities.second[i]}
                        onChange={(quality) => updateChordQuality("second", i, quality)}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="thirdseventh">
                  <AccordionTrigger className="text-sm">Third/Seventh in Bass</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <QualitySelect
                        key={i}
                        noteIndex={i}
                        value={localChordQualities.thirdseventh[i]}
                        onChange={(quality) => updateChordQuality("thirdseventh", i, quality)}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}