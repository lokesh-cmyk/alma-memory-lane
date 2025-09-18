/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MemoryCard } from "./MemoryCard";
import { ViewModeSelector } from "./ViewModeSelector";
import { SearchAndFilter } from "./SearchAndFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, subWeeks, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Clock, Archive } from "lucide-react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  memories: Memory[];
  icon: React.ComponentType<any>;
  gradient: string;
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
        { 
          id: "today", 
          title: "Today", 
          memories: [], 
          icon: Sparkles,
          gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-200/50"
        },
        { 
          id: "yesterday", 
          title: "Yesterday", 
          memories: [], 
          icon: Clock,
          gradient: "from-blue-500/20 to-indigo-500/20 border-blue-200/50"
        },
        { 
          id: "this-week", 
          title: "This Week", 
          memories: [], 
          icon: Calendar,
          gradient: "from-purple-500/20 to-pink-500/20 border-purple-200/50"
        },
        { 
          id: "last-week", 
          title: "Last Week", 
          memories: [], 
          icon: Calendar,
          gradient: "from-amber-500/20 to-orange-500/20 border-amber-200/50"
        },
        { 
          id: "older", 
          title: "Older", 
          memories: [], 
          icon: Archive,
          gradient: "from-gray-500/20 to-slate-500/20 border-gray-200/50"
        }
      ];
    } else if (viewMode === "weekly") {
      columns = [
        { id: "this-week", title: "This Week", memories: [], icon: Sparkles, gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-200/50" },
        { id: "last-week", title: "Last Week", memories: [], icon: Clock, gradient: "from-blue-500/20 to-indigo-500/20 border-blue-200/50" },
        { id: "2-weeks-ago", title: "2 Weeks Ago", memories: [], icon: Calendar, gradient: "from-purple-500/20 to-pink-500/20 border-purple-200/50" },
        { id: "this-month", title: "This Month", memories: [], icon: Calendar, gradient: "from-amber-500/20 to-orange-500/20 border-amber-200/50" },
        { id: "older", title: "Older", memories: [], icon: Archive, gradient: "from-gray-500/20 to-slate-500/20 border-gray-200/50" }
      ];
    } else {
      columns = [
        { id: "this-month", title: "This Month", memories: [], icon: Sparkles, gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-200/50" },
        { id: "last-month", title: "Last Month", memories: [], icon: Clock, gradient: "from-blue-500/20 to-indigo-500/20 border-blue-200/50" },
        { id: "2-months-ago", title: "2 Months Ago", memories: [], icon: Calendar, gradient: "from-purple-500/20 to-pink-500/20 border-purple-200/50" },
        { id: "this-year", title: "This Year", memories: [], icon: Calendar, gradient: "from-amber-500/20 to-orange-500/20 border-amber-200/50" },
        { id: "older", title: "Older", memories: [], icon: Archive, gradient: "from-gray-500/20 to-slate-500/20 border-gray-200/50" }
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
      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center"
        >
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-12 w-80 rounded-xl" />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const columns = getColumns();
  const totalMemories = memories.length;

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center"
      >
        <div className="flex items-center gap-4">
          <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-full"
          >
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {totalMemories} memories
            </span>
          </motion.div>
        </div>
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {columns.map((column, index) => {
          const IconComponent = column.icon;
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-6"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${column.gradient} border backdrop-blur-sm p-6`}>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <IconComponent className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{column.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {column.memories.length} {column.memories.length === 1 ? 'memory' : 'memories'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full"
                  >
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {column.memories.length}
                    </span>
                  </motion.div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </div>
              
              <div className="space-y-4 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {column.memories.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <IconComponent className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No memories yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Memories will appear here as you add them
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {column.memories.map((memory, memoryIndex) => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + memoryIndex * 0.05 }}
                        >
                          <MemoryCard memory={memory} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};