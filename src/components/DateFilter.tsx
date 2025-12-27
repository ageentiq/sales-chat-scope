import { useState } from "react";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export type DateFilterOption = 
  | "allTime" 
  | "today" 
  | "yesterday" 
  | "last7Days" 
  | "currentMonth" 
  | "lastMonth" 
  | "dateRange";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateFilterProps {
  value: DateFilterOption;
  dateRange: DateRange;
  onChange: (option: DateFilterOption, range: DateRange) => void;
}

export function getDateRangeForOption(option: DateFilterOption): DateRange {
  const now = new Date();
  
  switch (option) {
    case "allTime":
      return { from: null, to: null };
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday":
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case "last7Days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "currentMonth":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "lastMonth":
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    default:
      return { from: null, to: null };
  }
}

export function DateFilter({ value, dateRange, onChange }: DateFilterProps) {
  const { t } = useLanguage();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  const options: { value: DateFilterOption; label: string }[] = [
    { value: "allTime", label: t("allTime") },
    { value: "today", label: t("today") },
    { value: "yesterday", label: t("yesterday") },
    { value: "last7Days", label: t("last7Days") },
    { value: "currentMonth", label: t("currentMonth") },
    { value: "lastMonth", label: t("lastMonth") },
    { value: "dateRange", label: t("dateRange") },
  ];

  const handleOptionChange = (newValue: string) => {
    const option = newValue as DateFilterOption;
    if (option === "dateRange") {
      setIsCalendarOpen(true);
      setTempRange({ from: null, to: null });
    } else {
      const range = getDateRangeForOption(option);
      onChange(option, range);
    }
  };

  const handleApplyRange = () => {
    if (tempRange.from && tempRange.to) {
      onChange("dateRange", {
        from: startOfDay(tempRange.from),
        to: endOfDay(tempRange.to),
      });
      setIsCalendarOpen(false);
    }
  };

  const getDisplayLabel = () => {
    if (value === "dateRange" && dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
    }
    return options.find((o) => o.value === value)?.label || t("allTime");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <Select value={value} onValueChange={handleOptionChange}>
          <SelectTrigger className="w-[180px] md:w-[200px] bg-white border-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <SelectValue>{getDisplayLabel()}</SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <PopoverTrigger asChild>
          <span className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="text-sm font-medium text-gray-700">
              {t("selectDateRange")}
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">{t("from")}</label>
                <Calendar
                  mode="single"
                  selected={tempRange.from || undefined}
                  onSelect={(date) =>
                    setTempRange((prev) => ({ ...prev, from: date || null }))
                  }
                  disabled={(date) =>
                    date > new Date() ||
                    (tempRange.to ? date > tempRange.to : false)
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto border rounded-md")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">{t("to")}</label>
                <Calendar
                  mode="single"
                  selected={tempRange.to || undefined}
                  onSelect={(date) =>
                    setTempRange((prev) => ({ ...prev, to: date || null }))
                  }
                  disabled={(date) =>
                    date > new Date() ||
                    (tempRange.from ? date < tempRange.from : false)
                  }
                  className={cn("p-3 pointer-events-auto border rounded-md")}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleApplyRange}
                disabled={!tempRange.from || !tempRange.to}
                size="sm"
              >
                {t("apply")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
