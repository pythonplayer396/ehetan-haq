
-- =============================================
-- ROLES & AUTH
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin can read roles
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PROFILES (minimal, for admin display name)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- BLOG: CATEGORIES
-- =============================================
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.blog_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.blog_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOG: TAGS
-- =============================================
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags" ON public.blog_tags
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.blog_tags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOG: POSTS
-- =============================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  reading_time_minutes INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can only see published posts
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOG: POST-TAG JUNCTION
-- =============================================
CREATE TABLE public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post tags" ON public.blog_post_tags
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage post tags" ON public.blog_post_tags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ANALYTICS: PAGE VIEWS
-- =============================================
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking), only admins can read
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CMS: PROJECTS (managed from admin)
-- =============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  github_url TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'coming_soon')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects" ON public.projects
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CMS: SERVICES (what I offer)
-- =============================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  features TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read services" ON public.services
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CMS: SKILLS
-- =============================================
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  proficiency INT DEFAULT 0 CHECK (proficiency >= 0 AND proficiency <= 100),
  color TEXT DEFAULT '#3b82f6',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read skills" ON public.skills
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage skills" ON public.skills
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CONTACT MESSAGES
-- =============================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read messages" ON public.contact_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- SITE SETTINGS (key-value store)
-- =============================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_contact_messages_read ON public.contact_messages(read);
CREATE INDEX idx_projects_sort_order ON public.projects(sort_order);
CREATE INDEX idx_skills_category ON public.skills(category);
