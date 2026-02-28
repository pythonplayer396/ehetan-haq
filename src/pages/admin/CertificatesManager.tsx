import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploadField from "@/components/ImageUploadField";

const defaultForm = {
  title: "", description: "", image_url: "", issuer: "", issue_date: "", credential_url: "", active: true, sort_order: 0,
};

const CertificatesManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const { upload, uploading } = useImageUpload();

  const fetchAll = async () => {
    const { data } = await supabase.from("certificates").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title, description: item.description || "", image_url: item.image_url || "",
      issuer: item.issuer || "", issue_date: item.issue_date || "", credential_url: item.credential_url || "",
      active: item.active, sort_order: item.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      image_url: form.image_url || null,
      issuer: form.issuer || null,
      issue_date: form.issue_date || null,
      credential_url: form.credential_url || null,
      active: form.active,
      sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from("certificates").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Certificate updated");
    } else {
      const { error } = await supabase.from("certificates").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Certificate created");
    }
    setDialogOpen(false); fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    toast.success("Deleted"); fetchAll();
  };

  const filtered = items.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const CertCard = ({ item }: { item: any }) => (
    <div className="rounded-xl border border-border bg-card p-4 flex gap-4">
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} className="h-20 w-28 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary flex-shrink-0">
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
            {item.issuer && <p className="text-sm text-primary mt-0.5">{item.issuer}</p>}
            {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {item.issue_date && (
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.issue_date).toLocaleDateString()}</span>
          )}
          {item.credential_url && (
            <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> View Credential
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} certificates · {items.filter(i => i.active).length} active</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Certificate</Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(item => <CertCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {search ? "No certificates match your search." : "No certificates yet. Add your first one!"}
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Certificate" : "New Certificate"}</DialogTitle>
            <DialogDescription>{editing ? "Update the certificate details." : "Add a new certificate."}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Image & Links</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AWS Certified Developer" /></div>
              <div><Label>Issuer</Label><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What does this certification cover?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <ImageUploadField
                label="Certificate Image"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                onUpload={(file) => upload(file, "certificates")}
                uploading={uploading}
              />
              <div><Label>Credential URL</Label><Input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="https://credential.example.com/..." /></div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full mt-4">{editing ? "Update Certificate" : "Create Certificate"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificatesManager;
