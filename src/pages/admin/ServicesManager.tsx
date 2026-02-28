import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploadField from "@/components/ImageUploadField";

const defaultForm = {
  title: "", description: "", icon_url: "", active: true, sort_order: 0,
};

const ServicesManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const { upload, uploading } = useImageUpload();

  const fetchAll = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null); setForm(defaultForm); setFeatures([]); setFeatureInput(""); setDialogOpen(true);
  };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "", icon_url: item.icon_url || "", active: item.active, sort_order: item.sort_order });
    setFeatures(item.features || []);
    setFeatureInput("");
    setDialogOpen(true);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (!features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
    }
    setFeatureInput("");
  };

  const removeFeature = (f: string) => {
    setFeatures(features.filter(t => t !== f));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      icon_url: form.icon_url || null,
      features,
      active: form.active,
      sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Service updated");
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Service created");
    }
    setDialogOpen(false); fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Deleted"); fetchAll();
  };

  const filtered = items.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const ServiceCard = ({ item }: { item: any }) => (
    <div className="rounded-xl border border-border bg-card p-4 flex gap-4">
      {item.icon_url ? (
        <img src={item.icon_url} alt={item.title} className="h-20 w-20 rounded-lg object-cover flex-shrink-0" />
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
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${item.active ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                {item.active ? "Active" : "Inactive"}
              </span>
            </div>
            {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
        {(item.features || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.features.map((f: string) => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} services · {items.filter(i => i.active).length} active</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Service</Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(item => <ServiceCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {search ? "No services match your search." : "No services yet. Add your first one!"}
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle>
            <DialogDescription>{editing ? "Update the service details." : "Add a new service."}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Image & Features</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Web Development" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What does this service include?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <ImageUploadField
                label="Service Icon"
                value={form.icon_url}
                onChange={(url) => setForm({ ...form, icon_url: url })}
                onUpload={(file) => upload(file, "services")}
                uploading={uploading}
              />
              <div>
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    placeholder="Type a feature and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addFeature} size="sm">Add</Button>
                </div>
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {features.map((f) => (
                      <Badge key={f} variant="secondary" className="flex items-center gap-1 pr-1">
                        {f}
                        <button onClick={() => removeFeature(f)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full mt-4">{editing ? "Update Service" : "Create Service"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManager;
