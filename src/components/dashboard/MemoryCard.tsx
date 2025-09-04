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
  Clock
} from "lucide-react";
import { MemoryDialog } from "./MemoryDialog";

interface Memory {
  id: string;
  content: string;
  type: "text" | "voice" | "photo" | "document" | "url";
  timestamp: string;
  emotions: string[];
  tags: string[];
  metadata: Record<string, any>;
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
  text: "hsl(var(--memory-text))",
  voice: "hsl(var(--memory-voice))",
  photo: "hsl(var(--memory-photo))",
  document: "hsl(var(--memory-document))",
  url: "hsl(var(--memory-url))",
};

const emotionColors = {
  happy: "hsl(var(--emotion-happy))",
  excited: "hsl(var(--emotion-excited))",
  calm: "hsl(var(--emotion-calm))",
  sad: "hsl(var(--emotion-sad))",
  angry: "hsl(var(--emotion-angry))",
  anxious: "hsl(var(--emotion-anxious))",
  grateful: "hsl(var(--emotion-grateful))",
  nostalgic: "hsl(var(--emotion-nostalgic))",
};

export const MemoryCard = ({ memory }: MemoryCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const TypeIcon = typeIcons[memory.type];
  const typeColor = typeColors[memory.type];
  
  const getPreviewContent = () => {
    if (!memory.content) return "No content";
    return memory.content.length > 150 
      ? memory.content.substring(0, 150) + "..." 
      : memory.content;
  };

  const getPrimaryEmotion = () => {
    return memory.emotions?.[0] || null;
  };

  const primaryEmotion = getPrimaryEmotion();

  return (
    <>
      <Card 
        className="group cursor-pointer transition-all duration-200 hover:shadow-elevated hover:-translate-y-1 bg-gradient-card border-border/50"
        onClick={() => setIsDialogOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${typeColor}20` }}
              >
                <TypeIcon 
                  className="w-4 h-4" 
                  style={{ color: typeColor }}
                />
              </div>
              {primaryEmotion && (
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ 
                    backgroundColor: emotionColors[primaryEmotion as keyof typeof emotionColors] || typeColor
                  }}
                  title={primaryEmotion}
                />
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(memory.timestamp), "MMM d, HH:mm")}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-3">
            {memory.type === "photo" && memory.metadata?.thumbnail ? (
              <div className="relative">
                <img
                  src={memory.metadata.thumbnail}
                  alt="Memory"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Expand className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : memory.type === "voice" ? (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Voice Note</div>
                  {memory.metadata?.duration && (
                    <div className="text-xs text-muted-foreground">
                      {memory.metadata.duration}s
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
            <p className="text-sm text-foreground/90 leading-relaxed">
              {getPreviewContent()}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex gap-1">
            {memory.tags?.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {memory.tags?.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{memory.tags.length - 2}
              </Badge>
            )}
          </div>

          <div 
            className={`flex gap-1 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              <Expand className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement edit functionality
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement delete functionality
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <MemoryDialog
        memory={memory}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};