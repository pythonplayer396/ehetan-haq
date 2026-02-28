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
    const fetch = async () => {
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
    fetch();
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

  return (
    <div className="relative z-10 pt-[var(--nav-height)]">
      <article className="container mx-auto max-w-3xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button asChild variant="ghost" size="sm" className="mb-8">
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
          </Button>

          {(post.blog_categories as any) && (
            <Badge variant="secondary" className="mb-4">{(post.blog_categories as any).name}</Badge>
          )}

          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
            {post.title}
          </h1>

          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {post.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time_minutes} min read
              </span>
            )}
          </div>

          {post.cover_image && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-secondary prose-pre:border prose-pre:border-border"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </motion.div>

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border/50 pt-6">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
