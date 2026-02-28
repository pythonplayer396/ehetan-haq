import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Search, Filter, Clock, FileText, Calendar } from "lucide-react";
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
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

const calcReadingTime = (text: string) => Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

const PostsManager = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft"
  });

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("blog_categories").select("id, name, color");
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
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    
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

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("blog_posts").update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    }).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Post ${newStatus === "published" ? "published" : "unpublished"}`);
    fetchPosts();
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return null;
    const cat = categories.find(c => c.id === catId);
    return cat || null;
  };

  const filteredPosts = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} total · {posts.filter(p => p.status === "published").length} published · {posts.filter(p => p.status === "draft").length} drafts
          </p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reading Time</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => {
              const cat = getCategoryName(post.category_id);
              return (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">/{post.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {cat ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border border-border" style={{ color: cat.color || undefined }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color || '#888' }} />
                        {cat.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleStatus(post)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                        post.status === "published"
                          ? "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25"
                          : post.status === "archived"
                          ? "bg-muted text-muted-foreground"
                          : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25"
                      }`}
                    >
                      {post.status}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.reading_time_minutes || 1} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {wordCount(post.content)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                      {post.published_at && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Published {new Date(post.published_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {post.status === "published" && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {search || statusFilter !== "all" ? "No posts match your filters." : "No posts yet. Create your first one!"}
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
            <DialogDescription>
              {editing ? "Update your blog post details below." : "Fill in the details to create a new blog post."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} placeholder="My awesome post" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Brief description of your post..." />
            </div>
            <div>
              <Label>Content (Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="font-mono text-sm" placeholder="Write your post content here..." />
              {form.content && (
                <p className="text-xs text-muted-foreground mt-1">
                  {wordCount(form.content)} words · ~{calcReadingTime(form.content)} min read
                </p>
              )}
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
              {form.cover_image && (
                <img src={form.cover_image} alt="Preview" className="mt-2 rounded-lg max-h-32 object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        No categories yet. Add them in Categories & Tags.
                      </div>
                    ) : (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: c.color || '#888' }} />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))
                    )}
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
