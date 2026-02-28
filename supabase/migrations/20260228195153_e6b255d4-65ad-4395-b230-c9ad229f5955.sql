
-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Allow anyone to view uploaded files
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow admins to upload files
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update files
CREATE POLICY "Admins can update files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));
