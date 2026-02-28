# Ethan Haq — Developer Portfolio

A full-stack developer portfolio with a custom CMS, analytics, and a dynamic blog system. Built from scratch with React, TypeScript, and a cloud backend.


## Stack

Frontend — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
Backend — Lovable Cloud (Supabase under the hood), PostgreSQL, Row Level Security
State — TanStack React Query for server state, React Hook Form + Zod for validation
Routing — React Router v6 with nested admin routes
Markdown — react-markdown with GitHub Flavored Markdown support via remark-gfm


## Pages

/ — Landing page with animated hero, tech orbit, featured projects grid, certificates section
/about — Background, skills breakdown, experience
/blog — Dynamic blog feed pulling published posts from the database with category filtering
/blog/:slug — Full blog post view with markdown rendering and reading time
/contact — Contact form that writes directly to the database
/login — Admin authentication gate
/admin — Protected dashboard with nested routes for managing everything


## Admin Panel

Full CRUD management system behind auth. No third-party CMS.

/admin — Dashboard overview with stats
/admin/posts — Blog post editor with markdown, categories, tags, publish status
/admin/categories — Blog category management
/admin/projects — Portfolio project management with image uploads, tags, links
/admin/services — Service offerings management
/admin/skills — Skills and proficiency tracking by category
/admin/certificates — Certifications with image lightbox
/admin/messages — Contact form submissions inbox with read/archive
/admin/analytics — Page view analytics dashboard with charts


## Database

PostgreSQL with 13 tables — blog_posts, blog_categories, blog_tags, blog_post_tags, projects, services, skills, certificates, contact_messages, profiles, user_roles, site_settings, page_views.

Every table uses Row Level Security. Public-facing data is read-only for anonymous users. Write operations require admin role verification through a custom has_role database function. Role-based access control using a user_roles table with an app_role enum (admin/user).


## Auth

Email/password authentication. No anonymous signups. Admin access is gated by role checks on both the frontend (useAuth hook) and backend (RLS policies). The admin layout redirects unauthorized users.


## Analytics

Custom page view tracking built in. Every page navigation logs to the page_views table with path, title, referrer, user agent, session ID, and IP hash. The admin analytics dashboard visualizes this data with Recharts.


## How It Runs

Clone it, run npm install, then npm run dev. The backend is managed through Lovable Cloud so there is no separate server to configure. Environment variables for the API URL and keys are injected automatically.
