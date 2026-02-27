import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Shield, Bug, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TechIcon from "@/components/TechIcon";

const techs = ["JavaScript", "Python", "Node.js", "React", "Tailwind CSS", "Discord.js", "Express.js", "Bash/Linux"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  return (
    <div className="pt-[var(--nav-height)]">
      {/* Hero */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-sm text-primary">Full-Stack Developer & Bot Specialist</p>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl">
            Building Digital<br />
            <span className="text-gradient">Solutions</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            I craft scalable web applications, intelligent bots, and robust backend systems that drive real results. From concept to deployment, every line of code is written with purpose.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/about">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/pythonplayer396" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> GitHub
              </a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Skills */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 font-mono text-sm text-primary"
          >
            Skills & Technologies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-3xl font-bold text-foreground"
          >
            My Tech Stack
          </motion.p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {techs.map((tech, i) => (
              <motion.div
                key={tech}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <TechIcon name={tech} className="h-8 w-8 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium text-foreground">{tech}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Currently Working On */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6">
          <p className="mb-3 font-mono text-sm text-primary">Currently Working On</p>
          <p className="mb-10 text-3xl font-bold text-foreground">Active Projects</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SilkenBD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">E-commerce</Badge>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">SilkenBD.shop</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                A premium beauty & lifestyle e-commerce platform featuring curated products, seamless checkout, and a modern shopping experience designed for the Bangladeshi market.
              </p>
              <div className="flex flex-wrap gap-2">
                {["React", "Node.js", "Tailwind CSS", "E-commerce"].map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </motion.div>

            {/* GitHub Projects */}
            {[
              {
                name: "Sentinel",
                desc: "A comprehensive web security auditing tool for vulnerability assessment and penetration testing workflows.",
                icon: Shield,
                url: "https://github.com/pythonplayer396/sentinel",
                tags: ["Python", "Security", "CLI"],
              },
              {
                name: "Evil-Droid",
                desc: "An educational penetration testing framework designed for learning mobile security concepts and ethical hacking.",
                icon: Bug,
                url: "https://github.com/pythonplayer396/evil-droid",
                tags: ["Bash", "Android", "Security"],
              },
              {
                name: "MR.Holmes",
                desc: "An OSINT reconnaissance framework for gathering publicly available intelligence across multiple data sources.",
                icon: Search,
                url: "https://github.com/pythonplayer396/MR.Holems-",
                tags: ["Python", "OSINT", "Recon"],
              },
            ].map((project, i) => (
              <motion.a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <project.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Github className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{project.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground">Let's Work Together</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">
              Got a project in mind? I'm always open to discussing new opportunities and ambitious ideas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/contact">
                  Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://github.com/pythonplayer396" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> View GitHub
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
