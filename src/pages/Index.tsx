import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Github, ExternalLink, Award, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TechIcon from "@/components/TechIcon";
import ScrollReveal from "@/components/ScrollReveal";
import { useRef } from "react";

// Fallback hardcoded projects if DB is empty
import iconSilkenbd from "@/assets/icon-silkenbd.png";
import iconSentinel from "@/assets/icon-sentinel.png";
import iconEvilDroid from "@/assets/icon-evil-droid.jpg";
import iconMrHolmes from "@/assets/icon-mrholmes.png";

const fallbackProjects = [
  { id: "1", title: "SilkenBD.shop", description: "A premium beauty & lifestyle e-commerce platform.", image_url: iconSilkenbd, link: null, github_url: null, tags: ["React", "Node.js", "Tailwind CSS", "E-commerce"], featured: true, status: "active" },
  { id: "2", title: "Sentinel", description: "A comprehensive web security auditing tool.", image_url: iconSentinel, link: null, github_url: "https://github.com/pythonplayer396/sentinel", tags: ["Python", "Security", "CLI"], featured: false, status: "active" },
  { id: "3", title: "Evil-Droid", description: "An educational penetration testing framework.", image_url: iconEvilDroid, link: null, github_url: "https://github.com/pythonplayer396/evil-droid", tags: ["Bash", "Android", "Security"], featured: false, status: "active" },
  { id: "4", title: "MR.Holmes", description: "An OSINT reconnaissance framework.", image_url: iconMrHolmes, link: null, github_url: "https://github.com/pythonplayer396/MR.Holems-", tags: ["Python", "OSINT", "Recon"], featured: false, status: "active" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [projRes, skillRes, certRes] = await Promise.all([
        supabase.from("projects").select("*").eq("status", "active").order("sort_order"),
        supabase.from("skills").select("*").order("category").order("sort_order"),
        supabase.from("certificates").select("*").eq("active", true).order("sort_order"),
      ]);
      setProjects((projRes.data && projRes.data.length > 0) ? projRes.data : fallbackProjects);
      setSkills(skillRes.data || []);
      setCertificates(certRes.data || []);
    };
    load();
  }, []);

  // Use DB skills if available, otherwise fallback
  const techNames = skills.length > 0
    ? [...new Set(skills.map(s => s.name))].slice(0, 8)
    : ["JavaScript", "Python", "Node.js", "React", "Tailwind CSS", "Discord.js", "Express.js", "Bash/Linux"];

  return (
    <div className="relative z-10 pt-[var(--nav-height)]">
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="container mx-auto px-6 py-28 md:py-40">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-4 font-mono text-sm text-primary">
              Full-Stack Developer & Bot Specialist
            </motion.p>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Building Digital<br /><span className="text-gradient">Solutions</span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              I craft scalable web applications, intelligent bots, and robust backend systems that drive real results. From concept to deployment, every line of code is written with purpose.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="group">
                <Link to="/about">Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://github.com/pythonplayer396" target="_blank" rel="noopener noreferrer"><Github className="mr-2 h-4 w-4" /> GitHub</a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Skills */}
      <section className="relative border-t border-border/30 py-24">
        <ScrollReveal parallax={30}>
          <div className="container mx-auto px-6">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-3 font-mono text-sm text-primary">Skills & Technologies</motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10 text-3xl font-bold text-foreground">My Tech Stack</motion.p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {techNames.map((tech, i) => (
                <motion.div key={tech} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <TechIcon name={tech} className="h-8 w-8 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium text-foreground">{tech}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Projects */}
      <section className="relative border-t border-border/30 py-24">
        <ScrollReveal parallax={20}>
          <div className="container mx-auto px-6">
            <p className="mb-3 font-mono text-sm text-primary">Currently Working On</p>
            <p className="mb-10 text-3xl font-bold text-foreground">Active Projects</p>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, i) => {
                const Wrapper = project.github_url || project.link ? "a" : "div";
                const wrapperProps = project.link
                  ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
                  : project.github_url
                  ? { href: project.github_url, target: "_blank", rel: "noopener noreferrer" }
                  : {};

                return (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                    <Wrapper {...(wrapperProps as any)} className="group block rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 h-full">
                      <div className="mb-4 flex items-start justify-between">
                        {project.image_url ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                            <img src={project.image_url} alt={project.title} className="h-8 w-8 object-contain" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <span className="text-lg font-bold text-primary">{project.title[0]}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {project.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                          {project.github_url && <Github className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />}
                          {project.link && <ExternalLink className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />}
                        </div>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">{project.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Certificates */}
      {certificates.length > 0 && (
        <section className="relative border-t border-border/30 py-24">
          <ScrollReveal parallax={20}>
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-primary" />
                <p className="font-mono text-sm text-primary">Certifications</p>
              </div>
              <p className="mb-10 text-3xl font-bold text-foreground">Certificates & Achievements</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <div className="group rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col cursor-pointer" onClick={() => cert.image_url && setLightboxImg(cert.image_url)}>
                      {cert.image_url ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={cert.image_url}
                            alt={cert.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-primary/5">
                          <Award className="h-12 w-12 text-primary/30" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="text-lg font-bold text-foreground mb-1">{cert.title}</h3>
                        {cert.issuer && (
                          <p className="text-sm font-medium text-primary mb-2">{cert.issuer}</p>
                        )}
                        {cert.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{cert.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                          {cert.issue_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(cert.issue_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          )}
                          {cert.credential_url && (
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View Credential <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* CTA */}
      <section className="relative border-t border-border/30 py-24">
        <ScrollReveal parallax={15} scaleFrom={0.97}>
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Let's Work Together</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">Got a project in mind? I'm always open to discussing new opportunities and ambitious ideas.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link to="/contact">Get In Touch <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://github.com/pythonplayer396" target="_blank" rel="noopener noreferrer"><Github className="mr-2 h-4 w-4" /> View GitHub</a>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
      {/* Lightbox */}
      {lightboxImg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-6"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={lightboxImg}
            alt="Certificate"
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
