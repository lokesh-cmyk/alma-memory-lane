import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  FileIcon, 
  Link as LinkIcon,
  Clock,
  Edit3,
  Trash2,
  Download
} from "lucide-react";

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
  metadata: Record<string, any>;
  media?: MemoryMedia[];
}

interface MemoryDialogProps {
  memory: Memory;
  open: boolean;
  onClose: () => void;
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

export const MemoryDialog = ({ memory, open, onClose }: MemoryDialogProps) => {
  const TypeIcon = typeIcons[memory.type];
  const typeColor = typeColors[memory.type];

  const renderContent = () => {
    const mediaItem = memory.media?.[0];
    
    switch (memory.type) {
      case "photo":
        return (
          <div className="space-y-4">
            {(mediaItem?.file_url || memory.metadata?.url) && (
              <img
                src={mediaItem?.file_url || memory.metadata.url}
                alt="Memory"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            )}
            {memory.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {memory.content}
              </p>
            )}
            {memory.metadata?.description && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-1">AI Description</h4>
                <p className="text-sm text-muted-foreground">
                  {memory.metadata.description}
                </p>
              </div>
            )}
          </div>
        );

      case "voice":
        return (
          <div className="space-y-4">
            {(mediaItem?.file_url || memory.metadata?.audioUrl) && (
              <audio controls className="w-full">
                <source src={mediaItem?.file_url || memory.metadata.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {(mediaItem?.transcription || memory.content) && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Transcript</h4>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {mediaItem?.transcription || memory.content}
                </p>
              </div>
            )}
          </div>
        );

      case "document":
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3">
              <FileIcon className="w-8 h-8" style={{ color: typeColor }} />
              <div className="flex-1">
                <h4 className="font-medium">{memory.metadata?.filename || "Document"}</h4>
                {(mediaItem?.file_size || memory.metadata?.fileSize) && (
                  <p className="text-sm text-muted-foreground">
                    {((mediaItem?.file_size || memory.metadata.fileSize) / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              {(mediaItem?.file_url || memory.metadata?.url) && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mediaItem?.file_url || memory.metadata?.url} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
            </div>
            {memory.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {memory.content}
              </p>
            )}
          </div>
        );

      case "url":
        return (
          <div className="space-y-4">
            {memory.metadata?.preview && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={memory.metadata.preview.favicon} 
                    alt="" 
                    className="w-4 h-4"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {memory.metadata.preview.domain}
                  </span>
                </div>
                <h4 className="font-medium">{memory.metadata.preview.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {memory.metadata.preview.description}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={memory.metadata.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Visit Link
                  </a>
                </Button>
              </div>
            )}
            {memory.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {memory.content}
              </p>
            )}
          </div>
        );

      default:
        return (
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {memory.content}
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${typeColor}20` }}
            >
              <TypeIcon 
                className="w-5 h-5" 
                style={{ color: typeColor }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="capitalize">{memory.type} Memory</span>
                {memory.emotions?.map((emotion) => (
                  <div
                    key={emotion}
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{
                      backgroundColor: emotionColors[emotion as keyof typeof emotionColors] || typeColor
                    }}
                    title={emotion}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                {format(new Date(memory.timestamp), "PPP 'at' p")}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implement edit functionality
                }}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  // TODO: Implement delete functionality
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {renderContent()}

            {(memory.tags?.length > 0 || memory.emotions?.length > 0) && (
              <div className="space-y-3">
                {memory.emotions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Emotions</h4>
                    <div className="flex flex-wrap gap-1">
                      {memory.emotions.map((emotion) => (
                        <Badge
                          key={emotion}
                          variant="outline"
                          className="text-xs capitalize"
                          style={{
                            borderColor: emotionColors[emotion as keyof typeof emotionColors] || typeColor,
                            color: emotionColors[emotion as keyof typeof emotionColors] || typeColor
                          }}
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {memory.tags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {memory.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};