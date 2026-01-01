import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExportButtonProps {
  onClick: () => void;
  className?: string;
}

export function ExportButton({ onClick, className = "" }: ExportButtonProps) {
  const { t } = useLanguage();
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Download className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('exportData') || 'Export data'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
