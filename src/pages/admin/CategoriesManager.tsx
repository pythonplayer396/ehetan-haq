import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [catDialog, setCatDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);
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

  const openNewCat = () => { setEditingCat(null); setCatForm({ name: "", slug: "", description: "", color: "#3b82f6" }); setCatDialog(true); };
  const openEditCat = (c: any) => { setEditingCat(c); setCatForm({ name: c.name, slug: c.slug, description: c.description || "", color: c.color || "#3b82f6" }); setCatDialog(true); };

  const openNewTag = () => { setEditingTag(null); setTagForm({ name: "", slug: "" }); setTagDialog(true); };
  const openEditTag = (t: any) => { setEditingTag(t); setTagForm({ name: t.name, slug: t.slug }); setTagDialog(true); };

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast.error("Name is required"); return; }
    const payload = {
      name: catForm.name.trim(),
      slug: catForm.slug || slugify(catForm.name),
      description: catForm.description || null,
      color: catForm.color,
    };
    if (editingCat) {
      const { error } = await supabase.from("blog_categories").update(payload).eq("id", editingCat.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("blog_categories").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Category added");
    }
    setCatDialog(false);
    fetchAll();
  };

  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("blog_categories").delete().eq("id", id);
    toast.success("Category deleted");
    fetchAll();
  };

  const saveTag = async () => {
    if (!tagForm.name.trim()) { toast.error("Name is required"); return; }
    const payload = {
      name: tagForm.name.trim(),
      slug: tagForm.slug || slugify(tagForm.name),
    };
    if (editingTag) {
      const { error } = await supabase.from("blog_tags").update(payload).eq("id", editingTag.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Tag updated");
    } else {
      const { error } = await supabase.from("blog_tags").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Tag added");
    }
    setTagDialog(false);
    fetchAll();
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
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
            <Button onClick={openNewCat}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditCat(c)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCat(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No categories yet. Add your first one!</p>}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="mb-4">
            <Button onClick={openNewTag}><Plus className="mr-2 h-4 w-4" /> Add Tag</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <div key={t.id} className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="text-sm text-foreground">#{t.name}</span>
                <button onClick={() => openEditTag(t)} className="ml-1 text-muted-foreground hover:text-primary"><Edit className="h-3 w-3" /></button>
                <button onClick={() => deleteTag(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-center text-muted-foreground py-8 w-full">No tags yet. Add your first one!</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>{editingCat ? "Update the category details." : "Create a new blog category."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: slugify(e.target.value) })} placeholder="e.g. Technology" /></div>
            <div><Label>Slug</Label><Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} placeholder="Brief description..." /></div>
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <Input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-16 h-10" />
                <span className="text-sm text-muted-foreground">{catForm.color}</span>
              </div>
            </div>
            <Button onClick={saveCat} className="w-full">{editingCat ? "Update Category" : "Add Category"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialog} onOpenChange={setTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
            <DialogDescription>{editingTag ? "Update the tag details." : "Create a new blog tag."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value, slug: slugify(e.target.value) })} placeholder="e.g. javascript" /></div>
            <div><Label>Slug</Label><Input value={tagForm.slug} onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })} /></div>
            <Button onClick={saveTag} className="w-full">{editingTag ? "Update Tag" : "Add Tag"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManager;
