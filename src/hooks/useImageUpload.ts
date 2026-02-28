import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, folder: string = "general"): Promise<string | null> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(fileName, file);
      if (error) { toast.error("Upload failed: " + error.message); return null; }
      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e: any) {
      toast.error("Upload error: " + e.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
};
