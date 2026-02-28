import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
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
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Created");
    }
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Service</Button>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.active ? "✅" : "❌"}</TableCell>
                <TableCell>{item.sort_order}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No services yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div><Label>Icon URL</Label><Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} /></div>
            <div><Label>Features (comma-separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManager;
