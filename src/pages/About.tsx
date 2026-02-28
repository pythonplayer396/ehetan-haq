import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import profileImg from "@/assets/profile.jpg";
import iconWebdev from "@/assets/icon-webdev.png";
import iconMarketing from "@/assets/icon-marketing.png";
import iconBots from "@/assets/icon-bots.png";
import iconBackend from "@/assets/icon-backend.png";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { cn } from "@/lib/utils";

interface SkillItem {
  name: string;
  percent: number;
  color: string;
}

interface SkillCategory {
  title: string;
  color: string;
  skills: SkillItem[];
}

interface ServiceItem {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  features: string[] | null;
}

// Fallback data
const fallbackSkillCategories: SkillCategory[] = [
  { title: "Frontend", color: "hsl(262, 83%, 58%)", skills: [
    { name: "React", percent: 88, color: "hsl(262, 83%, 58%)" },
    { name: "Tailwind CSS", percent: 90, color: "hsl(262, 83%, 58%)" },
    { name: "HTML / CSS", percent: 95, color: "hsl(262, 83%, 58%)" },
    { name: "Responsive UI/UX", percent: 85, color: "hsl(262, 83%, 58%)" },
  ]},
  { title: "Backend & Databases", color: "hsl(142, 71%, 45%)", skills: [
    { name: "Node.js", percent: 92, color: "hsl(142, 71%, 45%)" },
    { name: "Express.js", percent: 88, color: "hsl(142, 71%, 45%)" },
    { name: "Python", percent: 85, color: "hsl(142, 71%, 45%)" },
    { name: "MongoDB", percent: 75, color: "hsl(142, 71%, 45%)" },
  ]},
  { title: "Bots & Automation", color: "hsl(346, 77%, 50%)", skills: [
    { name: "Discord.js", percent: 95, color: "hsl(346, 77%, 50%)" },
    { name: "Discord Bots", percent: 93, color: "hsl(346, 77%, 50%)" },
    { name: "Telegram Bots", percent: 80, color: "hsl(346, 77%, 50%)" },
  ]},
  { title: "Cybersecurity & Tools", color: "hsl(38, 92%, 50%)", skills: [
    { name: "Linux / VPS", percent: 88, color: "hsl(38, 92%, 50%)" },
    { name: "Bash / Shell", percent: 85, color: "hsl(38, 92%, 50%)" },
    { name: "Security & Pen Testing", percent: 75, color: "hsl(38, 92%, 50%)" },
  ]},
];

const fallbackServices = [
  { id: "1", image: iconWebdev, title: "Web Development", desc: "Full-stack web applications, responsive sites, and modern UIs built with React, Tailwind, and Node.js." },
  { id: "2", image: iconMarketing, title: "Marketing & Team Management", desc: "Digital marketing strategy, ad campaign management, and social media presence." },
  { id: "3", image: iconBots, title: "Discord & Telegram Bots", desc: "Custom automation bots, moderation systems, interactive community features, and AI-powered chatbots." },
  { id: "4", image: iconBackend, title: "Backend Management", desc: "Server setup, database design, RESTful API development, VPS/Linux administration." },
];

const serviceIconMap: Record<string, string> = {
  "Web Development": iconWebdev,
  "Marketing & Team Management": iconMarketing,
  "Discord & Telegram Bots": iconBots,
  "Backend Management": iconBackend,
};

const SkillDropdown = ({ category, defaultOpen = false }: { category: SkillCategory; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/30">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold" style={{ color: category.color }}>{category.title}</h3>
          <span className="text-xs text-muted-foreground">[{category.skills.length} modules]</span>
        </div>
        <ChevronUp className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", !open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="space-y-4 px-5 pb-5">
              {category.skills.map((skill, i) => (
                <div key={skill.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-foreground">{skill.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{skill.percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.percent}%` }} viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: skill.color }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const About = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(fallbackSkillCategories);
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const [skillRes, serviceRes] = await Promise.all([
        supabase.from("skills").select("*").order("category").order("sort_order"),
        supabase.from("services").select("*").eq("active", true).order("sort_order"),
      ]);

      // Group skills by category
      if (skillRes.data && skillRes.data.length > 0) {
        const grouped: Record<string, SkillItem[]> = {};
        const categoryColors: Record<string, string> = {};
        for (const s of skillRes.data) {
          if (!grouped[s.category]) grouped[s.category] = [];
          grouped[s.category].push({ name: s.name, percent: s.proficiency || 0, color: s.color || "#3b82f6" });
          if (!categoryColors[s.category]) categoryColors[s.category] = s.color || "#3b82f6";
        }
        setSkillCategories(Object.entries(grouped).map(([title, skills]) => ({
          title, color: categoryColors[title], skills,
        })));
      }

      if (serviceRes.data && serviceRes.data.length > 0) {
        setServices(serviceRes.data);
      }
    };
    load();
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices.map(s => ({
    id: s.id, title: s.title, description: s.desc, icon_url: s.image, features: null,
  }));

  return (
    <div className="relative z-10 pt-[var(--nav-height)]">
      {/* Profile */}
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="relative shrink-0">
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-primary/30 shadow-xl md:h-40 md:w-40">
              <img src={profileImg} alt="Ethan Haq" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div>
            <p className="mb-3 font-mono text-sm text-primary">About Me</p>
            <h1 className="mb-2 text-4xl font-extrabold text-foreground md:text-5xl">Ethan Haq</h1>
            <p className="mb-0 text-lg text-muted-foreground">Full-Stack Developer & Bot Specialist</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8 max-w-3xl">
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>I'm a passionate <strong className="text-foreground">full-stack developer</strong> with deep expertise in building scalable web applications, intelligent automation bots, and robust backend systems.</p>
            <p>With proficiency spanning <strong className="text-foreground">JavaScript, Python, and Bash</strong>, I architect solutions that bridge the gap between user experience and server-side performance.</p>
            <p>Beyond code, I bring experience in <strong className="text-foreground">digital marketing</strong>, <strong className="text-foreground">team management</strong>, and <strong className="text-foreground">cybersecurity research</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* Skills */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <p className="mb-3 font-mono text-sm text-primary">Expertise</p>
          <p className="mb-10 text-3xl font-bold text-foreground">Skills & Proficiency</p>
          <div className="space-y-4">
            {skillCategories.map((cat, catIdx) => (
              <SkillDropdown key={cat.title} category={cat} defaultOpen={catIdx === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Graph */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-sm text-primary">System Architecture</p>
            <p className="mb-4 text-3xl font-bold text-foreground">How Modern Web Systems Connect</p>
            <p className="mx-auto mb-12 max-w-lg text-sm text-muted-foreground">
              An interactive knowledge graph showing how technologies, services, and tools interconnect.
            </p>
          </div>
          <KnowledgeGraph />
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <p className="mb-3 font-mono text-sm text-primary">Services</p>
          <p className="mb-10 text-3xl font-bold text-foreground">What I Offer</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {displayServices.map((service, i) => {
              const iconSrc = service.icon_url || serviceIconMap[service.title] || null;
              return (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                    {iconSrc ? (
                      <img src={iconSrc} alt={service.title} className="h-10 w-10 object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{service.title[0]}</span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {service.features.map((f, fi) => (
                        <li key={fi} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
