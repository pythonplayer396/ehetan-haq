import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Search, Filter, Clock, FileText, Calendar, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  cover_image: string | null; category_id: string | null; status: string;
  reading_time_minutes: number | null; published_at: string | null;
  created_at: string; updated_at: string;
}

interface Category { id: string; name: string; color: string | null; }
interface Tag { id: string; name: string; slug: string; }

const calcReadingTime = (text: string) => Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const PostsManager = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogTab, setDialogTab] = useState("details");
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft"
  });

  const fetchAll = async () => {
    const [{ data: p }, { data: c }, { data: t }] = await Promise.all([
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("id, name, color"),
      supabase.from("blog_tags").select("*"),
    ]);
    setPosts(p || []); setCategories(c || []); setAllTags(t || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null); setSelectedTags([]); setDialogTab("details");
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = async (post: Post) => {
    setEditing(post); setDialogTab("details");
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "",
      content: post.content, cover_image: post.cover_image || "",
      category_id: post.category_id || "", status: post.status,
    });
    // Fetch existing tags for this post
    const { data } = await supabase.from("blog_post_tags").select("tag_id").eq("post_id", post.id);
    setSelectedTags((data || []).map(t => t.tag_id));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const reading_time_minutes = calcReadingTime(form.content);
    const payload = {
      title: form.title.trim(), slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null, content: form.content,
      cover_image: form.cover_image || null, category_id: form.category_id || null,
      status: form.status, reading_time_minutes,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id,
    };

    let postId = editing?.id;
    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      postId = data.id;
    }

    // Save tags
    if (postId) {
      await supabase.from("blog_post_tags").delete().eq("post_id", postId);
      if (selectedTags.length > 0) {
        await supabase.from("blog_post_tags").insert(selectedTags.map(tag_id => ({ post_id: postId!, tag_id })));
      }
    }

    toast.success(editing ? "Post updated" : "Post created");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_post_tags").delete().eq("post_id", id);
    await supabase.from("blog_posts").delete().eq("id", id);
    toast.success("Post deleted"); fetchAll();
  };

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("blog_posts").update({
      status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : null,
    }).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Post ${newStatus === "published" ? "published" : "unpublished"}`); fetchAll();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const getCat = (catId: string | null) => catId ? categories.find(c => c.id === catId) : null;

  const filteredPosts = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const PostCard = ({ post }: { post: Post }) => {
    const cat = getCat(post.category_id);
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex gap-4">
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="h-24 w-32 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <ImageIcon className="h-8 w-8 text-primary/40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{post.title}</h3>
                <button
                  onClick={() => toggleStatus(post)}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer ${
                    post.status === "published" ? "bg-green-500/15 text-green-600" :
                    post.status === "archived" ? "bg-muted text-muted-foreground" :
                    "bg-yellow-500/15 text-yellow-600"
                  }`}
                >{post.status}</button>
              </div>
              {post.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {post.status === "published" && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {cat && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color || '#888' }} />
                {cat.name}
              </span>
            )}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_minutes || 1} min</span>
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{wordCount(post.content)} words</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

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

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
        {filteredPosts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {search || statusFilter !== "all" ? "No posts match your filters." : "No posts yet. Create your first one!"}
          </p>
        )}
      </div>

      {/* Editor Dialog with Tabs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
            <DialogDescription>{editing ? "Update your blog post." : "Create a new blog post."}</DialogDescription>
          </DialogHeader>

          <Tabs value={dialogTab} onValueChange={setDialogTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Media & Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} placeholder="My awesome post" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Brief summary..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: c.color || '#888' }} />
                            {c.name}
                          </span>
                        </SelectItem>
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
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div>
                <Label>Content (Markdown)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={16} className="font-mono text-sm" placeholder="Write your post content in Markdown..." />
                {form.content && (
                  <p className="text-xs text-muted-foreground mt-1">{wordCount(form.content)} words · ~{calcReadingTime(form.content)} min read</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div>
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
                {form.cover_image && (
                  <img src={form.cover_image} alt="Preview" className="mt-2 rounded-lg max-h-40 w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <div>
                <Label>Tags</Label>
                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">No tags available. Create them in Categories & Tags.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                        {selectedTags.includes(tag.id) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full mt-4">{editing ? "Update Post" : "Create Post"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostsManager;
