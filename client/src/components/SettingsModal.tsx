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
import { InversionMode } from "@shared/schema";

interface SettingsModalProps {
  inversionMode: InversionMode;
  onInversionModeChange: (mode: InversionMode) => void;
}

export default function SettingsModal({ inversionMode, onInversionModeChange }: SettingsModalProps) {
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
