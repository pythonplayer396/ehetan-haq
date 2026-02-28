import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const ServicesManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", icon_url: "", features: "", active: true, sort_order: 0 });

  const fetchAll = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", description: "", icon_url: "", features: "", active: true, sort_order: 0 }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ ...item, features: (item.features || []).join(", ") }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      icon_url: form.icon_url || null,
      features: form.features.split(",").map((f: string) => f.trim()).filter(Boolean),
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
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} services · {items.filter(i => i.active).length} active</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Service</Button>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.icon_url ? (
                      <img src={item.icon_url} alt="" className="h-8 w-8 rounded object-contain" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">{item.title[0]}</div>
                    )}
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{item.description || "—"}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{(item.features || []).length} features</span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${item.active ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.sort_order}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">No services yet. Add your first one!</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle>
            <DialogDescription>{editing ? "Update the service details." : "Fill in details for a new service."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Web Development" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What does this service include?" /></div>
            <div>
              <Label>Icon URL</Label>
              <Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..." />
              {form.icon_url && <img src={form.icon_url} alt="Preview" className="mt-2 h-10 w-10 rounded object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />}
            </div>
            <div>
              <Label>Features (comma-separated)</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={2} placeholder="Feature 1, Feature 2, Feature 3" />
              {form.features && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.features.split(",").map((f, i) => f.trim() && (
                    <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">{f.trim()}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update Service" : "Create Service"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManager;
