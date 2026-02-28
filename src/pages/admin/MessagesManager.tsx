import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Trash2, Mail, MailOpen, Archive } from "lucide-react";
import { toast } from "sonner";

const MessagesManager = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchAll = async () => {
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (filter === "unread") query = query.eq("read", false);
    if (filter === "archived") query = query.eq("archived", true);
    else if (filter !== "archived") query = query.eq("archived", false);
    const { data } = await query;
    setMessages(data || []);
  };

  useEffect(() => { fetchAll(); }, [filter]);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    fetchAll();
  };

  const toggleArchive = async (id: string, archived: boolean) => {
    await supabase.from("contact_messages").update({ archived: !archived }).eq("id", id);
    toast.success(archived ? "Unarchived" : "Archived");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Deleted");
    if (selected?.id === id) setSelected(null);
    fetchAll();
  };

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.read) markRead(msg.id);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <div className="flex gap-2">
          {(["all", "unread", "archived"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id} className={!msg.read ? "bg-primary/5" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!msg.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    <div>
                      <p className="font-medium text-foreground">{msg.name}</p>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{msg.subject || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(msg.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openMessage(msg)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleArchive(msg.id, msg.archived)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No messages</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message from {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${selected.email}`} className="text-primary">{selected.email}</a></div>
                <div><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              {selected.subject && <p className="font-medium text-foreground">{selected.subject}</p>}
              <div className="rounded-lg bg-secondary p-4 text-sm text-foreground whitespace-pre-wrap">{selected.message}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
