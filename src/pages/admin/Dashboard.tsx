import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, MessageSquare, FolderKanban } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({ posts: 0, views: 0, messages: 0, projects: 0, unreadMessages: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [posts, views, messages, projects, unread] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
      ]);
      setStats({
        posts: posts.count || 0,
        views: views.count || 0,
        messages: messages.count || 0,
        projects: projects.count || 0,
        unreadMessages: unread.count || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Blog Posts", value: stats.posts, icon: FileText, color: "text-blue-500" },
    { label: "Total Views", value: stats.views, icon: Eye, color: "text-green-500" },
    { label: "Messages", value: `${stats.unreadMessages} unread / ${stats.messages}`, icon: MessageSquare, color: "text-orange-500" },
    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-purple-500" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
