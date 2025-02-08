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
import { InversionMode, StickyMode } from "@shared/schema";

interface SettingsModalProps {
  inversionMode: InversionMode;
  stickyMode: StickyMode;
  onInversionModeChange: (mode: InversionMode) => void;
  onStickyModeChange: (mode: StickyMode) => void;
}

export default function SettingsModal({ 
  inversionMode, 
  stickyMode,
  onInversionModeChange,
  onStickyModeChange,
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5 text-gray-600" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}