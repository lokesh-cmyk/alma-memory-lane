import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  FileIcon, 
  Link as LinkIcon,
  X,
  Upload,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface CreateMemoryDialogProps {
  open: boolean;
  onClose: () => void;
  onMemoryCreated: () => void;
}

const memoryTypes = [
  { value: "text", label: "Text", icon: FileText, color: "#3b82f6" },
  { value: "voice", label: "Voice", icon: Mic, color: "#10b981" },
  { value: "photo", label: "Photo", icon: ImageIcon, color: "#f59e0b" },
  { value: "document", label: "Document", icon: FileIcon, color: "#8b5cf6" },
  { value: "url", label: "URL", icon: LinkIcon, color: "#ef4444" },
] as const;

const emotionOptions = [
  "happy", "excited", "calm", "sad", "angry", "anxious", "grateful", "nostalgic"
];

export const CreateMemoryDialog = ({ open, onClose, onMemoryCreated }: CreateMemoryDialogProps) => {
  const [type, setType] = useState<"text" | "voice" | "photo" | "document" | "url">("text");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const toggleEmotion = (emotion: string) => {
    setEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile && !urlInput) {
      toast({
        title: "Content required",
        description: "Please add content, upload a file, or provide a URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert memory
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          type,
          content: content.trim(),
          emotions,
          tags,
          timestamp: new Date().toISOString(),
          metadata: type === "url" ? { url: urlInput } : {}
        })
        .select()
        .single();

      if (memoryError) throw memoryError;

      // Upload file if present
      if (selectedFile && memory) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${memory.id}.${fileExt}`;
        const bucket = type === "photo" ? "photos" : type === "voice" ? "audio" : "documents";

        // Note: Storage buckets need to be created first
        // For now, we'll store the file metadata in memory_media table
        const { error: mediaError } = await supabase
          .from('memory_media')
          .insert({
            memory_id: memory.id,
            file_type: type,
            file_url: URL.createObjectURL(selectedFile), // Temporary - should be actual storage URL
            file_size: selectedFile.size,
            transcription: null
          });

        if (mediaError) {
          console.error("Error saving media:", mediaError);
        }
      }

      toast({
        title: "Memory created",
        description: "Your memory has been saved successfully",
      });

      // Reset form
      setContent("");
      setSelectedFile(null);
      setUrlInput("");
      setTags([]);
      setEmotions([]);
      setType("text");
      
      onMemoryCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating memory:", error);
      toast({
        title: "Error creating memory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Memory</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Memory Type Selection */}
          <div className="space-y-2">
            <Label>Memory Type</Label>
            <div className="flex flex-wrap gap-2">
              {memoryTypes.map((memoryType) => {
                const Icon = memoryType.icon;
                return (
                  <Button
                    key={memoryType.value}
                    type="button"
                    variant={type === memoryType.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType(memoryType.value)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {memoryType.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What would you like to remember?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* File Upload (for photo, voice, document) */}
          {(type === "photo" || type === "voice" || type === "document") && (
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    type === "photo" ? "image/*" :
                    type === "voice" ? "audio/*" :
                    ".pdf,.doc,.docx,.txt"
                  }
                  className="flex-1"
                />
                {selectedFile && (
                  <Badge variant="secondary" className="gap-2">
                    <Upload className="w-3 h-3" />
                    {selectedFile.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          {type === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
          )}

          {/* Emotions */}
          <div className="space-y-2">
            <Label>Emotions (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {emotionOptions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={emotions.includes(emotion) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Memory"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
