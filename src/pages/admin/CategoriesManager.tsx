import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [catDialog, setCatDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "", color: "#3b82f6" });
  const [tagForm, setTagForm] = useState({ name: "", slug: "" });

  const fetchAll = async () => {
    const [c, t] = await Promise.all([
      supabase.from("blog_categories").select("*").order("name"),
      supabase.from("blog_tags").select("*").order("name"),
    ]);
    setCategories(c.data || []);
    setTags(t.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const addCategory = async () => {
    const { error } = await supabase.from("blog_categories").insert({
      name: catForm.name.trim(),
      slug: catForm.slug || slugify(catForm.name),
      description: catForm.description || null,
      color: catForm.color,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Category added");
    setCatDialog(false);
    setCatForm({ name: "", slug: "", description: "", color: "#3b82f6" });
    fetchAll();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("blog_categories").delete().eq("id", id);
    toast.success("Category deleted");
    fetchAll();
  };

  const addTag = async () => {
    const { error } = await supabase.from("blog_tags").insert({
      name: tagForm.name.trim(),
      slug: tagForm.slug || slugify(tagForm.name),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Tag added");
    setTagDialog(false);
    setTagForm({ name: "", slug: "" });
    fetchAll();
  };

  const deleteTag = async (id: string) => {
    await supabase.from("blog_tags").delete().eq("id", id);
    toast.success("Tag deleted");
    fetchAll();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Categories & Tags</h1>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <div className="mb-4">
            <Button onClick={() => setCatDialog(true)}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="mb-4">
            <Button onClick={() => setTagDialog(true)}><Plus className="mr-2 h-4 w-4" /> Add Tag</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <div key={t.id} className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1">
                <span className="text-sm text-foreground">#{t.name}</span>
                <button onClick={() => deleteTag(t.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} /></div>
            <div><Label>Color</Label><Input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} /></div>
            <Button onClick={addCategory} className="w-full">Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialog} onOpenChange={setTagDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tag</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={tagForm.slug} onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })} /></div>
            <Button onClick={addTag} className="w-full">Add Tag</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManager;
