import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  status: string;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
}

const calcReadingTime = (text: string) => Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

const PostsManager = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft" });

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("blog_categories").select("id, name");
    setCategories(data || []);
  };

  useEffect(() => { fetchPosts(); fetchCategories(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      category_id: post.category_id || "",
      status: post.status,
    });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const reading_time_minutes = calcReadingTime(form.content);
    const payload = {
      title: form.title.trim(),
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image: form.cover_image || null,
      category_id: form.category_id || null,
      status: form.status,
      reading_time_minutes,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id,
    };

    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Post updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Post created");
    }
    setDialogOpen(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast.success("Post deleted");
    fetchPosts();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No posts yet. Create your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Content (Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostsManager;
