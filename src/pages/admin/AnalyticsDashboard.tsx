import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Eye, Users, TrendingUp, Clock } from "lucide-react";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(346, 77%, 50%)", "hsl(262, 83%, 58%)"];

const AnalyticsDashboard = () => {
  const [views, setViews] = useState<any[]>([]);
  const [range, setRange] = useState("7");
  const [stats, setStats] = useState({ total: 0, unique: 0, today: 0, avgPerDay: 0 });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchViews = async () => {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(range));

      const { data } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      const allViews = data || [];
      setViews(allViews);

      // Stats
      const uniqueSessions = new Set(allViews.map((v: any) => v.session_id)).size;
      const today = allViews.filter((v: any) => new Date(v.created_at).toDateString() === new Date().toDateString()).length;
      setStats({
        total: allViews.length,
        unique: uniqueSessions,
        today,
        avgPerDay: Math.round(allViews.length / parseInt(range)),
      });

      // Daily breakdown
      const daily: Record<string, number> = {};
      allViews.forEach((v: any) => {
        const day = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        daily[day] = (daily[day] || 0) + 1;
      });
      setDailyData(Object.entries(daily).map(([date, count]) => ({ date, views: count })));

      // Top pages
      const pages: Record<string, number> = {};
      allViews.forEach((v: any) => {
        pages[v.page_path] = (pages[v.page_path] || 0) + 1;
      });
      setTopPages(
        Object.entries(pages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([page, count]) => ({ page, count }))
      );
    };
    fetchViews();
  }, [range]);

  const statCards = [
    { label: "Total Views", value: stats.total, icon: Eye, color: "text-blue-500" },
    { label: "Unique Visitors", value: stats.unique, icon: Users, color: "text-green-500" },
    { label: "Today", value: stats.today, icon: TrendingUp, color: "text-orange-500" },
    { label: "Avg/Day", value: stats.avgPerDay, icon: Clock, color: "text-purple-500" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((card) => (
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Views Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Views Over Time</CardTitle></CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="views" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ fill: "hsl(217, 91%, 60%)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.map((page, i) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-primary-foreground" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </div>
                      <span className="text-sm text-foreground truncate max-w-[140px]">{page.page}</span>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">{page.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Page Distribution */}
      {topPages.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Traffic Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPages}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="page" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
