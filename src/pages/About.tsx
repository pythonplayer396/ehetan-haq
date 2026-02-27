import { motion } from "framer-motion";
import { Code, Megaphone, Bot, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OrbitSystem from "@/components/OrbitSystem";

const skills = [
  { name: "JavaScript", level: "Expert" },
  { name: "Python", level: "Expert" },
  { name: "Node.js", level: "Expert" },
  { name: "React", level: "Advanced" },
  { name: "Tailwind CSS", level: "Advanced" },
  { name: "Discord.js", level: "Expert" },
  { name: "Express.js", level: "Advanced" },
  { name: "Bash/Linux", level: "Advanced" },
  { name: "TypeScript", level: "Intermediate" },
  { name: "HTML/CSS", level: "Expert" },
  { name: "Ubuntu/VPS", level: "Advanced" },
  { name: "npm", level: "Expert" },
];

const levelColor: Record<string, string> = {
  Expert: "bg-primary/15 text-primary border-primary/20",
  Advanced: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const services = [
  {
    icon: Code,
    title: "Web Development",
    desc: "Full-stack web applications, responsive sites, and modern UIs built with React, Tailwind, and Node.js. From landing pages to complex dashboards.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Team Management",
    desc: "Digital marketing strategy, ad campaign management, and social media presence across Facebook, Instagram, and other platforms. Team coordination and growth hacking.",
  },
  {
    icon: Bot,
    title: "Discord & Telegram Bots",
    desc: "Custom automation bots, moderation systems, interactive community features, and AI-powered chatbots. Built for scale and reliability.",
  },
  {
    icon: Server,
    title: "Backend Management",
    desc: "Server setup, database design, RESTful API development, VPS/Linux administration, and TypeScript backend services. Secure and performant infrastructure.",
  },
];

const About = () => {
  return (
    <div className="pt-[var(--nav-height)]">
      {/* Profile */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-sm text-primary">About Me</p>
          <h1 className="mb-2 text-4xl font-extrabold text-foreground md:text-5xl">Ethan Haq</h1>
          <p className="mb-6 text-lg text-muted-foreground">Full-Stack Developer & Bot Specialist</p>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              I'm a passionate <strong className="text-foreground">full-stack developer</strong> with deep expertise in building
              scalable web applications, intelligent automation bots, and robust backend systems. My journey in software
              development has been driven by an insatiable curiosity for how <strong className="text-foreground">modern systems interconnect</strong>.
            </p>
            <p>
              With proficiency spanning <strong className="text-foreground">JavaScript, Python, and Bash</strong>, I architect solutions
              that bridge the gap between user experience and server-side performance. Whether it's crafting a
              <strong className="text-foreground"> Discord bot</strong> that serves thousands of users or deploying a full
              <strong className="text-foreground"> e-commerce platform</strong>, I approach every project with precision and purpose.
            </p>
            <p>
              Beyond code, I bring experience in <strong className="text-foreground">digital marketing</strong>,
              <strong className="text-foreground"> team management</strong>, and <strong className="text-foreground">cybersecurity research</strong> —
              a unique combination that allows me to deliver holistic solutions for any digital challenge.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Skills Grid */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <p className="mb-3 font-mono text-sm text-primary">Expertise</p>
          <p className="mb-10 text-3xl font-bold text-foreground">Skills & Tools</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <Badge variant="outline" className={`text-[10px] ${levelColor[skill.level]}`}>
                  {skill.level}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Orbit System */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-sm text-primary">System Architecture</p>
            <p className="mb-4 text-3xl font-bold text-foreground">How Modern Web Systems Connect</p>
            <p className="mx-auto mb-12 max-w-lg text-sm text-muted-foreground">
              A visual representation of the full-stack ecosystem — from frontend interfaces to backend services, databases, APIs, and intelligent bots — all orbiting around a unified system core.
            </p>
          </div>
          <OrbitSystem />
        </div>
      </section>

      {/* What I Offer */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <p className="mb-3 font-mono text-sm text-primary">Services</p>
          <p className="mb-10 text-3xl font-bold text-foreground">What I Offer</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{service.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
