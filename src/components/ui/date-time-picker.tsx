import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha y hora",
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState(() => {
    if (value) {
      const h = value.getHours();
      const h12 = h % 12 || 12;
      return h12.toString().padStart(2, "0");
    }
    return "12";
  });
  const [minutes, setMinutes] = React.useState(() => {
    if (value) {
      return value.getMinutes().toString().padStart(2, "0");
    }
    return "00";
  });
  const [period, setPeriod] = React.useState<"AM" | "PM">(() => {
    if (value) {
      return value.getHours() >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  // Update time when value changes externally
  React.useEffect(() => {
    if (value) {
      const h = value.getHours();
      const h12 = h % 12 || 12;
      setHours(h12.toString().padStart(2, "0"));
      setMinutes(value.getMinutes().toString().padStart(2, "0"));
      setPeriod(h >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const get24Hours = (h12: number, p: "AM" | "PM") => {
    if (p === "AM") {
      return h12 === 12 ? 0 : h12;
    } else {
      return h12 === 12 ? 12 : h12 + 12;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const h24 = get24Hours(parseInt(hours) || 12, period);
      const m = parseInt(minutes) || 0;
      const newDate = new Date(date);
      newDate.setHours(h24, m, 0, 0);
      onChange(newDate);
    } else {
      onChange(null);
    }
  };

  const updateTime = (newHours: string, newMinutes: string, newPeriod: "AM" | "PM") => {
    if (value) {
      const h24 = get24Hours(parseInt(newHours) || 12, newPeriod);
      const m = parseInt(newMinutes) || 0;
      const newDate = new Date(value);
      newDate.setHours(h24, m, 0, 0);
      onChange(newDate);
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    let num = parseInt(val) || 0;
    if (num > 12) num = 12;
    if (num < 0) num = 0;
    const newHours = num === 0 ? "" : num.toString().padStart(2, "0");
    setHours(newHours || "");
    if (num >= 1 && num <= 12) {
      updateTime(num.toString(), minutes, period);
    }
  };

  const handleHoursBlur = () => {
    let num = parseInt(hours) || 12;
    if (num < 1) num = 12;
    if (num > 12) num = 12;
    const newHours = num.toString().padStart(2, "0");
    setHours(newHours);
    updateTime(num.toString(), minutes, period);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    let num = parseInt(val);
    if (isNaN(num)) {
      setMinutes("");
      return;
    }
    if (num > 59) num = 59;
    const newMinutes = num.toString().padStart(2, "0");
    setMinutes(newMinutes);
    updateTime(hours || "12", newMinutes, period);
  };

  const handleMinutesBlur = () => {
    let num = parseInt(minutes) || 0;
    if (num < 0) num = 0;
    if (num > 59) num = 59;
    const newMinutes = num.toString().padStart(2, "0");
    setMinutes(newMinutes);
    updateTime(hours || "12", newMinutes, period);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    updateTime(hours || "12", minutes, newPeriod);
  };

  const handleClear = () => {
    onChange(null);
    setHours("12");
    setMinutes("00");
    setPeriod("AM");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "dd MMM yyyy, hh:mm a", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={handleDateSelect}
          locale={es}
          initialFocus
        />
        <div className="border-t p-3 space-y-3">
          <div className="flex items-center">
            <div className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              inputMode="numeric"
              value={hours}
              onChange={handleHoursChange}
              onBlur={handleHoursBlur}
              className="w-12 text-center px-1 rounded-none border-r-0 focus-visible:z-10"
              placeholder="12"
              maxLength={2}
            />
            <div className="flex h-9 items-center border-y border-input bg-background px-1">
              <span className="text-muted-foreground">:</span>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={handleMinutesChange}
              onBlur={handleMinutesBlur}
              className="w-12 text-center px-1 rounded-none border-l-0 focus-visible:z-10"
              placeholder="00"
              maxLength={2}
            />
            <Select value={period} onValueChange={(val) => handlePeriodChange(val as "AM" | "PM")}>
              <SelectTrigger className="w-[70px] rounded-l-none border-l-0 focus:z-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
            >
              Aceptar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
