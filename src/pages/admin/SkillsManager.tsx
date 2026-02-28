import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SkillsManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ category: "", name: "", proficiency: 50, color: "#3b82f6", sort_order: 0 });

  const fetchAll = async () => {
    const { data } = await supabase.from("skills").select("*").order("category").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm({ category: "", name: "", proficiency: 50, color: "#3b82f6", sort_order: 0 }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm(item); setDialogOpen(true); };

  const handleSave = async () => {
    const payload = { category: form.category.trim(), name: form.name.trim(), proficiency: form.proficiency, color: form.color, sort_order: form.sort_order };
    if (editing) {
      const { error } = await supabase.from("skills").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("skills").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Created");
    }
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("skills").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  const grouped = items.reduce<Record<string, any[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Skills</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, skills]) => (
          <div key={cat} className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">{cat}</h2>
            <div className="space-y-3">
              {skills.map((skill: any) => (
                <div key={skill.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-foreground">{skill.name}</span>
                      <span className="font-mono text-muted-foreground">{skill.proficiency}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full" style={{ width: `${skill.proficiency}%`, backgroundColor: skill.color }} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(skill)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No skills yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Frontend" /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Proficiency: {form.proficiency}%</Label>
              <Slider value={[form.proficiency]} onValueChange={(v) => setForm({ ...form, proficiency: v[0] })} max={100} step={1} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsManager;
