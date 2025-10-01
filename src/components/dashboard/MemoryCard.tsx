import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  FileIcon, 
  Link as LinkIcon,
  Expand,
  Edit3,
  Trash2,
  Clock,
  Play,
  Volume2,
  Heart,
  Star,
  Zap
} from "lucide-react";
import { MemoryDialog } from "./MemoryDialog";
import { motion } from "framer-motion";

interface MemoryMedia {
  id: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  transcription: string | null;
}

interface Memory {
  id: string;
  content: string;
  type: "text" | "voice" | "photo" | "document" | "url";
  timestamp: string;
  emotions: string[];
  tags: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
  media?: MemoryMedia[];
}

interface MemoryCardProps {
  memory: Memory;
}

const typeIcons = {
  text: FileText,
  voice: Mic,
  photo: ImageIcon,
  document: FileIcon,
  url: LinkIcon,
};

const typeColors = {
  text: "#3b82f6",
  voice: "#10b981",
  photo: "#f59e0b",
  document: "#8b5cf6",
  url: "#ef4444",
};

const typeGradients = {
  text: "from-blue-500/20 to-blue-600/20",
  voice: "from-emerald-500/20 to-emerald-600/20",
  photo: "from-amber-500/20 to-amber-600/20",
  document: "from-purple-500/20 to-purple-600/20",
  url: "from-rose-500/20 to-rose-600/20",
};

const emotionColors = {
  happy: "#fbbf24",
  excited: "#f97316",
  calm: "#06b6d4",
  sad: "#6366f1",
  angry: "#ef4444",
  anxious: "#8b5cf6",
  grateful: "#10b981",
  nostalgic: "#ec4899",
};

const emotionIcons = {
  happy: "😊",
  excited: "🎉",
  calm: "😌",
  sad: "😢",
  angry: "😠",
  anxious: "😰",
  grateful: "🙏",
  nostalgic: "💭",
};

export const MemoryCard = ({ memory }: MemoryCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const TypeIcon = typeIcons[memory.type];
  const typeColor = typeColors[memory.type];
  const typeGradient = typeGradients[memory.type];
  
  const getPreviewContent = () => {
    if (!memory.content) return "No content";
    return memory.content.length > 120 
      ? memory.content.substring(0, 120) + "..." 
      : memory.content;
  };

  const getPrimaryEmotion = () => {
    return memory.emotions?.[0] || null;
  };

  const primaryEmotion = getPrimaryEmotion();

  const renderMediaPreview = () => {
    const mediaItem = memory.media?.[0];
    
    switch (memory.type) {
      case "photo": {
        const imageUrl = mediaItem?.file_url || memory.metadata?.url;
        if (imageUrl) {
          return (
            <div className="relative overflow-hidden rounded-xl group">
              <motion.img
                src={imageUrl}
                alt="Memory"
                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
                  <Expand className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          );
        }
        break;
      }

      case "voice": {
        const audioUrl = mediaItem?.file_url || memory.metadata?.audioUrl;
        const transcription = mediaItem?.transcription || memory.content;
        return (
          <div className="relative">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-200/50">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="p-2.5 bg-emerald-500/20 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 text-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Voice Note</span>
                  </div>
                  {memory.metadata?.duration && (
                    <div className="text-xs text-emerald-600 mt-1">
                      {Math.floor(memory.metadata.duration / 60)}:{(memory.metadata.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Waveform visualization placeholder */}
              <div className="mt-3 flex items-center gap-1 opacity-60">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full"
                    style={{ height: Math.random() * 16 + 4 }}
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.1,
                      ease: "easeInOut" 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "document":
        return (
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-full">
                <FileIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-700 truncate">
                  {memory.metadata?.filename || "Document"}
                </p>
                {memory.metadata?.fileSize && (
                  <p className="text-xs text-purple-600">
                    {(memory.metadata.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "url":
        return (
          <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-4 border border-rose-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 rounded-full">
                <LinkIcon className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-rose-700 truncate">
                  {memory.metadata?.preview?.title || "Web Link"}
                </p>
                <p className="text-xs text-rose-600 truncate">
                  {memory.metadata?.preview?.domain || memory.metadata?.url}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          onClick={() => setIsDialogOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${typeGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="p-2.5 rounded-xl shadow-sm"
                  style={{ 
                    backgroundColor: `${typeColor}15`,
                    border: `1px solid ${typeColor}30`
                  }}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TypeIcon 
                    className="w-4 h-4" 
                    style={{ color: typeColor }}
                  />
                </motion.div>
                
                <div className="flex items-center gap-2">
                  {memory.emotions?.slice(0, 3).map((emotion, index) => (
                    <motion.div
                      key={emotion}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group/emotion"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border-2 border-white dark:border-gray-800"
                        style={{ 
                          backgroundColor: emotionColors[emotion as keyof typeof emotionColors] || typeColor
                        }}
                        title={emotion}
                      >
                        {emotionIcons[emotion as keyof typeof emotionIcons] || "💭"}
                      </div>
                    </motion.div>
                  ))}
                  {memory.emotions?.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{memory.emotions.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {format(new Date(memory.timestamp), "MMM d, HH:mm")}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3 relative z-10">
            <div className="space-y-4">
              {renderMediaPreview()}
              
              {memory.content && (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  className="prose prose-sm max-w-none dark:prose-invert"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {getPreviewContent()}
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex items-center justify-between relative z-10">
            <div className="flex gap-1.5 flex-wrap">
              {memory.tags?.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-2.5 py-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {memory.tags?.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2.5 py-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                >
                  +{memory.tags.length - 2}
                </Badge>
              )}
            </div>

            <motion.div 
              className="flex gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <Expand className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement edit functionality
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement delete functionality
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </CardFooter>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </motion.div>

      <MemoryDialog
        memory={memory}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};