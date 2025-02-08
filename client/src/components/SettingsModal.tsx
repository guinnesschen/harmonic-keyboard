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
import { Settings } from "lucide-react";
import { InversionMode, StickyMode, ThemeMode, BackgroundMode } from "@shared/schema";

interface SettingsModalProps {
  inversionMode: InversionMode;
  stickyMode: StickyMode;
  themeMode: ThemeMode;
  backgroundMode: BackgroundMode;
  onInversionModeChange: (mode: InversionMode) => void;
  onStickyModeChange: (mode: StickyMode) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onBackgroundModeChange: (mode: BackgroundMode) => void;
}

export default function SettingsModal({ 
  inversionMode, 
  stickyMode,
  themeMode,
  backgroundMode,
  onInversionModeChange,
  onStickyModeChange,
  onThemeModeChange,
  onBackgroundModeChange,
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your playing experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Mode</label>
            <Select value={themeMode} onValueChange={value => onThemeModeChange(value as ThemeMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ThemeMode.Light}>
                  <div className="space-y-1">
                    <div>Light</div>
                    <div className="text-xs text-muted-foreground">
                      Elegant light theme with musical aesthetics
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={ThemeMode.Dark}>
                  <div className="space-y-1">
                    <div>Dark</div>
                    <div className="text-xs text-muted-foreground">
                      Sophisticated dark theme with contrasting elements
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Background Style</label>
            <Select value={backgroundMode} onValueChange={value => onBackgroundModeChange(value as BackgroundMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BackgroundMode.Minimal}>
                  <div className="space-y-1">
                    <div>Minimal</div>
                    <div className="text-xs text-muted-foreground">
                      Clean, distraction-free interface
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={BackgroundMode.Animated}>
                  <div className="space-y-1">
                    <div>Animated</div>
                    <div className="text-xs text-muted-foreground">
                      Dynamic space-themed background
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inversion Mode</label>
            <Select value={inversionMode} onValueChange={value => onInversionModeChange(value as InversionMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InversionMode.Traditional}>
                  <div className="space-y-1">
                    <div>Traditional</div>
                    <div className="text-xs text-muted-foreground">
                      Bass key sets the root note, inversion modifies voicing
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={InversionMode.Functional}>
                  <div className="space-y-1">
                    <div>Functional</div>
                    <div className="text-xs text-muted-foreground">
                      Bass key sets actual bass note, inversion sets its function
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sticky Mode</label>
            <Select value={stickyMode} onValueChange={value => onStickyModeChange(value as StickyMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StickyMode.Off}>
                  <div className="space-y-1">
                    <div>Off</div>
                    <div className="text-xs text-muted-foreground">
                      Notes stop when keys are released
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={StickyMode.On}>
                  <div className="space-y-1">
                    <div>On</div>
                    <div className="text-xs text-muted-foreground">
                      Notes persist, modifiers update the current chord
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}