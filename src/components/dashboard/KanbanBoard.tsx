import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MemoryCard } from "./MemoryCard";
import { ViewModeSelector } from "./ViewModeSelector";
import { SearchAndFilter } from "./SearchAndFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, subWeeks, subMonths } from "date-fns";

export type ViewMode = "daily" | "weekly" | "monthly";

interface Memory {
  id: string;
  content: string;
  type: "text" | "voice" | "photo" | "document" | "url";
  timestamp: string;
  emotions: string[];
  tags: string[];
  metadata: Record<string, any>;
}

interface DatabaseMemory {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  emotions: string[];
  tags: string[];
  metadata: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  memories: Memory[];
}

export const KanbanBoard = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    types: [] as string[],
    emotions: [] as string[],
    dateRange: null as { from: Date; to: Date } | null
  });

  useEffect(() => {
    fetchMemories();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories'
        },
        () => fetchMemories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      // Transform database memories to component format
      const transformedMemories: Memory[] = (data || []).map((dbMemory: DatabaseMemory) => ({
        id: dbMemory.id,
        content: dbMemory.content || "",
        type: dbMemory.type as "text" | "voice" | "photo" | "document" | "url",
        timestamp: dbMemory.timestamp,
        emotions: dbMemory.emotions || [],
        tags: dbMemory.tags || [],
        metadata: dbMemory.metadata || {}
      }));
      
      setMemories(transformedMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = (): KanbanColumn[] => {
    const now = new Date();
    
    let columns: KanbanColumn[] = [];
    
    if (viewMode === "daily") {
      columns = [
        { id: "today", title: "Today", memories: [] },
        { id: "yesterday", title: "Yesterday", memories: [] },
        { id: "this-week", title: "This Week", memories: [] },
        { id: "last-week", title: "Last Week", memories: [] },
        { id: "older", title: "Older", memories: [] }
      ];
    } else if (viewMode === "weekly") {
      columns = [
        { id: "this-week", title: "This Week", memories: [] },
        { id: "last-week", title: "Last Week", memories: [] },
        { id: "2-weeks-ago", title: "2 Weeks Ago", memories: [] },
        { id: "this-month", title: "This Month", memories: [] },
        { id: "older", title: "Older", memories: [] }
      ];
    } else {
      columns = [
        { id: "this-month", title: "This Month", memories: [] },
        { id: "last-month", title: "Last Month", memories: [] },
        { id: "2-months-ago", title: "2 Months Ago", memories: [] },
        { id: "this-year", title: "This Year", memories: [] },
        { id: "older", title: "Older", memories: [] }
      ];
    }

    // Filter memories based on search and filters
    const filteredMemories = memories.filter(memory => {
      // Search query filter
      if (searchQuery && !memory.content?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(memory.type)) {
        return false;
      }
      
      // Emotion filter
      if (filters.emotions.length > 0 && !filters.emotions.some(emotion => 
        memory.emotions?.includes(emotion)
      )) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const memoryDate = new Date(memory.timestamp);
        if (memoryDate < filters.dateRange.from || memoryDate > filters.dateRange.to) {
          return false;
        }
      }
      
      return true;
    });

    // Categorize memories into columns
    filteredMemories.forEach(memory => {
      const memoryDate = new Date(memory.timestamp);
      
      if (viewMode === "daily") {
        if (isToday(memoryDate)) {
          columns[0].memories.push(memory);
        } else if (isYesterday(memoryDate)) {
          columns[1].memories.push(memory);
        } else if (isThisWeek(memoryDate)) {
          columns[2].memories.push(memory);
        } else if (memoryDate >= subWeeks(now, 2)) {
          columns[3].memories.push(memory);
        } else {
          columns[4].memories.push(memory);
        }
      } else if (viewMode === "weekly") {
        if (isThisWeek(memoryDate)) {
          columns[0].memories.push(memory);
        } else if (memoryDate >= subWeeks(now, 2)) {
          columns[1].memories.push(memory);
        } else if (memoryDate >= subWeeks(now, 3)) {
          columns[2].memories.push(memory);
        } else if (isThisMonth(memoryDate)) {
          columns[3].memories.push(memory);
        } else {
          columns[4].memories.push(memory);
        }
      } else {
        if (isThisMonth(memoryDate)) {
          columns[0].memories.push(memory);
        } else if (memoryDate >= subMonths(now, 2)) {
          columns[1].memories.push(memory);
        } else if (memoryDate >= subMonths(now, 3)) {
          columns[2].memories.push(memory);
        } else if (memoryDate.getFullYear() === now.getFullYear()) {
          columns[3].memories.push(memory);
        } else {
          columns[4].memories.push(memory);
        }
      }
    });

    return columns;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {column.memories.length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {column.memories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No memories in this period</p>
                </div>
              ) : (
                column.memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};