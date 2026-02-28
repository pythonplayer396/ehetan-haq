import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading?: boolean;
  className?: string;
}

const ImageUploadField = ({ label = "Image", value, onChange, onUpload, uploading, className }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file);
    if (url) onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-40 rounded-lg object-cover border border-border" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUploadField;
