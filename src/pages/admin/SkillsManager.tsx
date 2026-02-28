import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categoryPresets = [
  { value: "Frontend", color: "hsl(262, 83%, 58%)" },
  { value: "Backend & Databases", color: "hsl(142, 71%, 45%)" },
  { value: "Bots & Automation", color: "hsl(346, 77%, 50%)" },
  { value: "Cybersecurity & Tools", color: "hsl(38, 92%, 50%)" },
  { value: "Soft Skills", color: "hsl(188, 78%, 41%)" },
];

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

  const handleCategorySelect = (val: string) => {
    if (val === "custom") {
      setForm({ ...form, category: "" });
      return;
    }
    const preset = categoryPresets.find(p => p.value === val);
    setForm({ ...form, category: val, color: preset?.color || form.color });
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.name.trim()) { toast.error("Category and name are required"); return; }
    const payload = { category: form.category.trim(), name: form.name.trim(), proficiency: form.proficiency, color: form.color, sort_order: form.sort_order };
    if (editing) {
      const { error } = await supabase.from("skills").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Skill updated");
    } else {
      const { error } = await supabase.from("skills").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Skill added");
    }
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} skills across {Object.keys(grouped).length} categories</p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, skills]) => (
          <div key={cat} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{cat}</h2>
              <span className="text-xs text-muted-foreground">{skills.length} skills</span>
            </div>
            <div className="space-y-3">
              {skills.map((skill: any) => (
                <div key={skill.id} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-foreground truncate">{skill.name}</span>
                      <span className="font-mono text-muted-foreground shrink-0 ml-2">{skill.proficiency}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full transition-all" style={{ width: `${skill.proficiency}%`, backgroundColor: skill.color }} />
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(skill)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">No skills yet. Add your first one!</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>{editing ? "Update the skill details." : "Add a new skill to your profile."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryPresets.find(p => p.value === form.category) ? form.category : "custom"} onValueChange={handleCategorySelect}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categoryPresets.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                        {p.value}
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom category...</SelectItem>
                </SelectContent>
              </Select>
              {(!categoryPresets.find(p => p.value === form.category) || form.category === "") && (
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. DevOps" className="mt-2" />
              )}
            </div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. React" /></div>
            <div>
              <Label>Proficiency: {form.proficiency}%</Label>
              <Slider value={[form.proficiency]} onValueChange={(v) => setForm({ ...form, proficiency: v[0] })} max={100} step={1} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update Skill" : "Add Skill"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsManager;
