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
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import {
  ChordQuality,
  type ChordQualityConfig,
  type QualityKeyMapping,
  LEGAL_QUALITY_KEYS,
} from "@shared/schema";
import { defaultChordQualities } from "@/lib/chordConfig";
import { midiNoteToNoteName } from "@/lib/chords";
import { getQualityKeyMappings, updateQualityKeyMappings } from "@/lib/keyboardMapping";

interface SettingsModalProps {
  chordQualities: ChordQualityConfig;
  onChordQualitiesChange: (config: ChordQualityConfig) => void;
}

function QualitySelect({
  value,
  onChange,
  noteIndex,
}: {
  value: ChordQuality;
  onChange: (value: ChordQuality) => void;
  noteIndex: number;
}) {
  const noteName = midiNoteToNoteName(noteIndex + 60).replace(/\d+/, "");

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-900 w-12">{noteName}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-32 text-gray-900">
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
          <SelectItem value={ChordQuality.DomSus}>Dom Sus</SelectItem>
          <SelectItem value={ChordQuality.Sus}>Sus</SelectItem>
          <SelectItem value={ChordQuality.Aug}>Augmented</SelectItem>
          <SelectItem value={ChordQuality.MinMaj7}>Minor Maj 7</SelectItem>
          <SelectItem value={ChordQuality.Add9}>Add 9</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function QualityKeyMappingItem({
  mapping,
  onToggle,
  onKeyChange,
}: {
  mapping: QualityKeyMapping;
  onToggle: (enabled: boolean) => void;
  onKeyChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-4">
        <Switch
          checked={mapping.enabled}
          onCheckedChange={onToggle}
        />
        <Select value={mapping.key} onValueChange={onKeyChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEGAL_QUALITY_KEYS.map(key => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="text-sm text-gray-900">
        {mapping.quality.charAt(0).toUpperCase() + mapping.quality.slice(1)}
      </span>
    </div>
  );
}

export default function SettingsModal({
  chordQualities,
  onChordQualitiesChange,
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localChordQualities, setLocalChordQualities] =
    useState<ChordQualityConfig>(chordQualities);
  const [keyMappings, setKeyMappings] = useState<QualityKeyMapping[]>(
    getQualityKeyMappings()
  );

  const updateChordQuality = (
    position: keyof ChordQualityConfig,
    noteIndex: number,
    quality: ChordQuality,
  ) => {
    const newConfig = {
      ...localChordQualities,
      [position]: {
        ...localChordQualities[position],
        [noteIndex]: quality,
      },
    };
    setLocalChordQualities(newConfig);
    onChordQualitiesChange(newConfig);
  };

  const updateKeyMapping = (index: number, updates: Partial<QualityKeyMapping>) => {
    const newMappings = keyMappings.map((mapping, i) =>
      i === index ? { ...mapping, ...updates } : mapping
    );
    setKeyMappings(newMappings);
    updateQualityKeyMappings(newMappings);
  };

  const resetToDefaults = () => {
    setLocalChordQualities(defaultChordQualities);
    onChordQualitiesChange(defaultChordQualities);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
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
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="keyMappings">
              <AccordionTrigger className="text-sm font-medium text-gray-900">
                Chord Quality Key Mappings
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 border rounded-lg p-4">
                  {keyMappings.map((mapping, index) => (
                    <QualityKeyMappingItem
                      key={index}
                      mapping={mapping}
                      onToggle={(enabled) => updateKeyMapping(index, { enabled })}
                      onKeyChange={(key) => updateKeyMapping(index, { key })}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="defaultQualities">
              <AccordionTrigger className="text-sm font-medium text-gray-900">
                Default Chord Qualities
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={resetToDefaults}>
                      Reset to Defaults
                    </Button>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="root">
                      <AccordionTrigger className="text-sm text-gray-900">
                        Root Position
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {Array.from({ length: 12 }, (_, i) => (
                          <QualitySelect
                            key={i}
                            noteIndex={i}
                            value={localChordQualities.root[i]}
                            onChange={(quality) =>
                              updateChordQuality("root", i, quality)
                            }
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="first">
                      <AccordionTrigger className="text-sm text-gray-900">
                        First Inversion
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {Array.from({ length: 12 }, (_, i) => (
                          <QualitySelect
                            key={i}
                            noteIndex={i}
                            value={localChordQualities.first[i]}
                            onChange={(quality) =>
                              updateChordQuality("first", i, quality)
                            }
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="second">
                      <AccordionTrigger className="text-sm text-gray-900">
                        Second Inversion
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {Array.from({ length: 12 }, (_, i) => (
                          <QualitySelect
                            key={i}
                            noteIndex={i}
                            value={localChordQualities.second[i]}
                            onChange={(quality) =>
                              updateChordQuality("second", i, quality)
                            }
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="third">
                      <AccordionTrigger className="text-sm text-gray-900">
                        Third/Seventh in Bass
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {Array.from({ length: 12 }, (_, i) => (
                          <QualitySelect
                            key={i}
                            noteIndex={i}
                            value={localChordQualities.third[i]}
                            onChange={(quality) =>
                              updateChordQuality("third", i, quality)
                            }
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}