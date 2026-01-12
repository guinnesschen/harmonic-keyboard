import { useStorage } from '../../state/StorageContext';
import { QUALITY_NAMES } from '../../domain/constants';
import { Button } from '../ui/Button';
import { createDefaultQualityMappings } from '../../domain/keyMapping';

export function KeyMappingEditor() {
  const { settings, updateQualityMappings } = useStorage();
  const { qualityMappings } = settings;

  const toggleMapping = (key: string) => {
    updateQualityMappings(
      qualityMappings.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const resetToDefaults = () => {
    updateQualityMappings(createDefaultQualityMappings());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm text-gray-700">Quality Key Mappings</h4>
        <Button variant="ghost" size="sm" onClick={resetToDefaults}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {qualityMappings.map((mapping) => (
          <button
            key={mapping.key}
            onClick={() => toggleMapping(mapping.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              mapping.enabled
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="font-mono font-bold w-6">{mapping.key}</span>
            <span>{QUALITY_NAMES[mapping.quality]}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Click to enable/disable chord qualities. Disabled qualities won't respond to keypresses.
      </p>
    </div>
  );
}
