import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2, Archive, Reply, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MessagesManager = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (filter === "unread") query = query.eq("read", false).eq("archived", false);
    else if (filter === "archived") query = query.eq("archived", true);
    else query = query.eq("archived", false);
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
    if (!confirm("Delete this message permanently?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Deleted");
    if (selected?.id === id) setSelected(null);
    fetchAll();
  };

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.read) markRead(msg.id);
  };

  const filteredMessages = messages.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || (m.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} messages · {messages.filter(m => !m.read).length} unread
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "archived"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="pl-9" />
      </div>

      {/* Card-based layout for all screen sizes */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border border-border bg-card p-4 ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0" onClick={() => openMessage(msg)}>
                {!msg.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0">
                  <p className={`text-sm ${!msg.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{msg.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {new Date(msg.created_at).toLocaleDateString()}
              </p>
            </div>
            {msg.subject && (
              <p className="text-sm font-medium text-foreground mt-2 truncate">{msg.subject}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
            <div className="flex gap-1 mt-3 border-t border-border pt-3">
              <Button variant="ghost" size="sm" onClick={() => openMessage(msg)} className="flex-1 sm:flex-none"><Eye className="mr-1 h-3 w-3" /> View</Button>
              <Button variant="ghost" size="sm" asChild className="flex-1 sm:flex-none">
                <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Your message"}`}><Reply className="mr-1 h-3 w-3" /> Reply</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleArchive(msg.id, msg.archived)} className="flex-1 sm:flex-none">
                <Archive className="mr-1 h-3 w-3" /> {msg.archived ? "Unarchive" : "Archive"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(msg.id)} className="flex-1 sm:flex-none text-destructive hover:text-destructive">
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {search ? "No messages match your search." : "No messages yet. They'll show up here when someone contacts you."}
          </p>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
            <DialogDescription>{selected?.email} · {selected && new Date(selected.created_at).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.subject && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium text-foreground">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="rounded-lg bg-secondary p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selected.message}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}>
                    <Reply className="mr-2 h-4 w-4" /> Reply via Email
                  </a>
                </Button>
                <Button variant="outline" onClick={() => { toggleArchive(selected.id, selected.archived); setSelected(null); }}>
                  <Archive className="mr-2 h-4 w-4" /> {selected.archived ? "Unarchive" : "Archive"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
