import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";

interface Filters {
  types: string[];
  emotions: string[];
  dateRange: { from: Date; to: Date } | null;
}

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const memoryTypes = [
  { value: "text", label: "Text", color: "hsl(var(--memory-text))" },
  { value: "voice", label: "Voice", color: "hsl(var(--memory-voice))" },
  { value: "photo", label: "Photo", color: "hsl(var(--memory-photo))" },
  { value: "document", label: "Document", color: "hsl(var(--memory-document))" },
  { value: "url", label: "URL", color: "hsl(var(--memory-url))" },
];

const emotions = [
  { value: "happy", label: "Happy", color: "hsl(var(--emotion-happy))" },
  { value: "excited", label: "Excited", color: "hsl(var(--emotion-excited))" },
  { value: "calm", label: "Calm", color: "hsl(var(--emotion-calm))" },
  { value: "sad", label: "Sad", color: "hsl(var(--emotion-sad))" },
  { value: "angry", label: "Angry", color: "hsl(var(--emotion-angry))" },
  { value: "anxious", label: "Anxious", color: "hsl(var(--emotion-anxious))" },
  { value: "grateful", label: "Grateful", color: "hsl(var(--emotion-grateful))" },
  { value: "nostalgic", label: "Nostalgic", color: "hsl(var(--emotion-nostalgic))" },
];

export const SearchAndFilter = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange 
}: SearchAndFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = filters.types.length > 0 || filters.emotions.length > 0 || filters.dateRange;

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      emotions: [],
      dateRange: null
    });
  };

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleEmotion = (emotion: string) => {
    const newEmotions = filters.emotions.includes(emotion)
      ? filters.emotions.filter(e => e !== emotion)
      : [...filters.emotions, emotion];
    onFiltersChange({ ...filters, emotions: newEmotions });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Search Input */}
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`gap-2 ${hasActiveFilters ? "border-primary bg-primary/5" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {filters.types.length + filters.emotions.length + (filters.dateRange ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Memory Types */}
            <div>
              <h5 className="text-sm font-medium mb-2">Memory Types</h5>
              <div className="grid grid-cols-2 gap-2">
                {memoryTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.types.includes(type.value)}
                      onCheckedChange={() => toggleType(type.value)}
                    />
                    <label
                      htmlFor={`type-${type.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div>
              <h5 className="text-sm font-medium mb-2">Emotions</h5>
              <div className="grid grid-cols-2 gap-2">
                {emotions.map((emotion) => (
                  <div key={emotion.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emotion-${emotion.value}`}
                      checked={filters.emotions.includes(emotion.value)}
                      onCheckedChange={() => toggleEmotion(emotion.value)}
                    />
                    <label
                      htmlFor={`emotion-${emotion.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: emotion.color }}
                      />
                      {emotion.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h5 className="text-sm font-medium mb-2">Date Range</h5>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange ? (
                      `${format(filters.dateRange.from, "MMM d, yyyy")} - ${format(filters.dateRange.to, "MMM d, yyyy")}`
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange || undefined}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        onFiltersChange({ 
                          ...filters, 
                          dateRange: { from: range.from, to: range.to } 
                        });
                      } else if (!range) {
                        onFiltersChange({ ...filters, dateRange: null });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {filters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, dateRange: null })}
                  className="mt-2 h-auto p-1 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear date range
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.types.map((type) => {
            const typeConfig = memoryTypes.find(t => t.value === type);
            return (
              <Badge key={type} variant="secondary" className="gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: typeConfig?.color }}
                />
                {typeConfig?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => toggleType(type)}
                />
              </Badge>
            );
          })}
          {filters.emotions.map((emotion) => {
            const emotionConfig = emotions.find(e => e.value === emotion);
            return (
              <Badge key={emotion} variant="secondary" className="gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: emotionConfig?.color }}
                />
                {emotionConfig?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => toggleEmotion(emotion)}
                />
              </Badge>
            );
          })}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="w-3 h-3" />
              {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d")}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, dateRange: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};