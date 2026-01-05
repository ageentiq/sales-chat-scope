import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { GitCompare } from "lucide-react";

interface CompareToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const CompareToggle = ({ enabled, onChange }: CompareToggleProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <GitCompare className="h-4 w-4 text-gray-500" />
      <Label 
        htmlFor="compare-toggle" 
        className="text-sm text-gray-600 cursor-pointer whitespace-nowrap"
      >
        {t('compareToPrevious')}
      </Label>
      <Switch
        id="compare-toggle"
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};
