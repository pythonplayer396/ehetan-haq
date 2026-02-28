import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
  blog_categories: { name: string; slug: string; color: string } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name, slug, color)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setPost(data as any);

      if (data) {
        const { data: tagData } = await supabase
          .from("blog_post_tags")
          .select("blog_tags(name)")
          .eq("post_id", data.id);
        setTags(tagData?.map((t: any) => t.blog_tags?.name).filter(Boolean) || []);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[var(--nav-height)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-[var(--nav-height)]">
        <p className="mb-4 text-xl font-bold text-foreground">Post not found</p>
        <Button asChild variant="outline">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>
      </div>
    );
  }

  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="relative z-10 min-h-screen bg-background pt-[var(--nav-height)]">
      {/* Full-bleed cover image hero */}
      {post.cover_image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full"
        >
          <div className="aspect-[21/9] max-h-[70vh] w-full overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
        </motion.div>
      )}

      <article className="relative">
        {/* Title section */}
        <div className="container mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={post.cover_image ? "-mt-32 relative z-10" : "pt-16"}
          >
            <Link
              to="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Link>

            <div className="flex items-center gap-3 mb-6">
              {(post.blog_categories as any) && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  {(post.blog_categories as any).name}
                </span>
              )}
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-8 mb-12">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {publishDate}
              </span>
              {post.reading_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_minutes} min read
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="container mx-auto max-w-3xl px-6 pb-20"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {tags.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-2 border-t border-border/50 pt-8">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full px-4 py-1.5 text-xs uppercase tracking-wider">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to all articles
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  );
};

export default BlogPost;
