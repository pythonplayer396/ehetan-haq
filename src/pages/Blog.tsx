import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, Calendar, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
  blog_categories: { name: string; slug: string; color: string } | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; color: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image, reading_time_minutes, published_at, created_at, blog_categories(name, slug, color)")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("id, name, slug, color"),
        supabase.from("blog_tags").select("id, name, slug"),
      ]);
      setPosts((postsRes.data as any) || []);
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || (p.blog_categories as any)?.slug === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="relative z-10 pt-[var(--nav-height)]">
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-3 font-mono text-sm text-primary">Blog</p>
          <h1 className="mb-4 text-4xl font-extrabold text-foreground md:text-5xl">Articles & Insights</h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            Thoughts on development, security, automation, and building digital products.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border border-border/50 bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <p className="text-lg font-medium text-foreground">No articles found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Check back soon for new content"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {(post.blog_categories as any) && (
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {(post.blog_categories as any).name}
                      </Badge>
                    )}
                    <h2 className="mb-2 text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {post.reading_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.reading_time_minutes} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
