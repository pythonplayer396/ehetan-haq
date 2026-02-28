import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star, Search, Globe, Github, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploadField from "@/components/ImageUploadField";

const defaultForm = {
  title: "", description: "", image_url: "", link: "", github_url: "",
  tags: "", featured: false, status: "active", sort_order: 0,
};

const ProjectsManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [tagInput, setTagInput] = useState("");
  const { upload, uploading } = useImageUpload();

  const fetchAll = async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(defaultForm); setTagInput(""); setDialogOpen(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ ...item, tags: "" });
    setTagInput("");
    setDialogOpen(true);
  };

  const currentTags = (): string[] => {
    if (editing && Array.isArray(editing.tags)) {
      const formTagsArr = form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      return [...new Set([...editing.tags, ...formTagsArr])];
    }
    return form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = currentTags();
    if (!tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setForm({ ...form, tags: newTags.join(", ") });
      if (editing) setEditing({ ...editing, tags: newTags });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const tags = currentTags().filter(t => t !== tag);
    setForm({ ...form, tags: tags.join(", ") });
    if (editing) setEditing({ ...editing, tags });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const tags = currentTags();
    const payload = {
      title: form.title.trim(), description: form.description || null,
      image_url: form.image_url || null, link: form.link || null,
      github_url: form.github_url || null, tags, featured: form.featured,
      status: form.status, sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Project updated");
    } else {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Project created");
    }
    setDialogOpen(false); fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    toast.success("Deleted"); fetchAll();
  };

  const liveProjects = items.filter(i => i.link && (!search || i.title.toLowerCase().includes(search.toLowerCase())));
  const githubProjects = items.filter(i => !i.link && i.github_url && (!search || i.title.toLowerCase().includes(search.toLowerCase())));

  const ProjectCard = ({ item }: { item: any }) => (
    <div className="rounded-xl border border-border bg-card p-4 flex gap-4">
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} className="h-20 w-20 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary flex-shrink-0">
          {item.title[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              {item.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.status === "active" ? "bg-green-500/15 text-green-600" : item.status === "coming_soon" ? "bg-yellow-500/15 text-yellow-600" : "bg-muted text-muted-foreground"
              }`}>{item.status}</span>
            </div>
            {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><Globe className="h-3 w-3" /> Live</a>}
          {item.github_url && <a href={item.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Github className="h-3 w-3" /> Repo</a>}
        </div>
        {(item.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} total · {liveProjects.length} live · {githubProjects.length} GitHub-only · {items.filter(i => i.featured).length} featured
          </p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Project</Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9" />
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="live" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Live <Badge variant="secondary" className="ml-1 text-xs">{liveProjects.length}</Badge></TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub <Badge variant="secondary" className="ml-1 text-xs">{githubProjects.length}</Badge></TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          <div className="space-y-3">
            {liveProjects.map(item => <ProjectCard key={item.id} item={item} />)}
            {liveProjects.length === 0 && <p className="text-center text-muted-foreground py-12">No live projects yet.</p>}
          </div>
        </TabsContent>
        <TabsContent value="github">
          <div className="space-y-3">
            {githubProjects.map(item => <ProjectCard key={item.id} item={item} />)}
            {githubProjects.length === 0 && <p className="text-center text-muted-foreground py-12">No GitHub-only projects yet.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
            <DialogDescription>{editing ? "Update the project details." : "Add a new project."}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Image & Tags</TabsTrigger>
              <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Cool Project" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What does this project do?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured Project</Label>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <ImageUploadField
                label="Project Image"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                onUpload={(file) => upload(file, "projects")}
                uploading={uploading}
              />
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Type a tag and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag} size="sm">Add</Button>
                </div>
                {currentTags().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentTags().map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 mt-4">
              <div><Label>Project URL (Live Link)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://myproject.com" /></div>
              <div><Label>GitHub Repository</Label><Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." /></div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full mt-4">{editing ? "Update Project" : "Create Project"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManager;
