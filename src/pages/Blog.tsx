import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, Calendar, ArrowRight } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image, reading_time_minutes, published_at, created_at, blog_categories(name, slug, color)")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("id, name, slug, color"),
      ]);
      setPosts((postsRes.data as any) || []);
      setCategories(catsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || (p.blog_categories as any)?.slug === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="relative z-10 min-h-screen bg-background pt-[var(--nav-height)]">
      {/* Hero header */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-primary">Journal</p>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Articles &<br />
              <span className="text-primary">Insights</span>
            </h1>
          </motion.div>
        </div>
        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Filters */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-6 py-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
                  !activeCategory ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
                    activeCategory === cat.slug ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="border-border/50 bg-transparent pl-10 text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="space-y-8">
            <div className="h-[50vh] animate-pulse rounded-2xl bg-muted/30" />
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted/30" />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32">
            <p className="text-2xl font-bold text-foreground">No articles found</p>
            <p className="mt-2 text-muted-foreground">{search ? "Try a different search term" : "Check back soon for new content"}</p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Featured post - full width cinematic */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Link to={`/blog/${featured.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-card">
                    {featured.cover_image ? (
                      <div className="aspect-[21/9] overflow-hidden">
                        <img
                          src={featured.cover_image}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="aspect-[21/9] bg-gradient-to-br from-primary/20 via-background to-primary/5" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="flex items-center gap-3 mb-4">
                        {(featured.blog_categories as any) && (
                          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                            {(featured.blog_categories as any).name}
                          </span>
                        )}
                        <span className="text-xs text-white/70">
                          {new Date(featured.published_at || featured.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h2 className="mb-3 text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="max-w-2xl text-base text-white/70 line-clamp-2 md:text-lg">{featured.excerpt}</p>
                      )}
                      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary transition-colors">
                        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid of remaining posts */}
            {rest.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2">
                {rest.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                  >
                    <Link to={`/blog/${post.slug}`} className="group block h-full">
                      <div className="overflow-hidden rounded-2xl border border-border/30 bg-card transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 h-full flex flex-col">
                        {post.cover_image ? (
                          <div className="aspect-[16/9] overflow-hidden">
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                            <span className="text-6xl font-black text-muted-foreground/10">{post.title[0]}</span>
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-4">
                            {(post.blog_categories as any) && (
                              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                                {(post.blog_categories as any).name}
                              </span>
                            )}
                          </div>
                          <h2 className="mb-3 text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors md:text-2xl">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="mb-6 flex-1 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/30">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              {post.reading_time_minutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {post.reading_time_minutes} min
                                </span>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
